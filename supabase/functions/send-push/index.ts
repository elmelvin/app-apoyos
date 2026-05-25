import { createClient } from "npm:@supabase/supabase-js@2";

type PushRequest = {
  solicitudId?: string;
  estado?: string;
};

type FirebaseServiceAccount = {
  client_email: string;
  private_key: string;
  project_id: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("send-push: solicitud recibida");

    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = requiredEnv("SUPABASE_URL");
    const supabaseAnonKey = requiredEnv("SUPABASE_ANON_KEY");
    const supabaseServiceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const firebaseServiceAccount = getOptionalFirebaseServiceAccount();

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "No autorizado." }, 401);
    }

    const { data: perfil, error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .select("rol")
      .eq("user_id", user.id)
      .maybeSingle();

    if (perfilError) throw perfilError;

    if (perfil?.rol !== "admin") {
      return jsonResponse({ error: "Solo administradores pueden enviar notificaciones." }, 403);
    }

    const body = (await req.json()) as PushRequest;
    const solicitudId = body.solicitudId?.trim();
    const estado = body.estado?.trim().toLowerCase();

    if (!solicitudId || !estado) {
      console.log("send-push: faltan datos", { solicitudId: Boolean(solicitudId), estado });
      return jsonResponse({ error: "Faltan solicitudId o estado." }, 400);
    }

    if (!["aprobado", "rechazado", "cancelada", "cancelado"].includes(estado)) {
      console.log("send-push: estado no notificable", { solicitudId, estado });
      return jsonResponse({ sent: 0, skipped: true, reason: "Estado no notificable." });
    }

    const { data: solicitud, error: solicitudError } = await supabaseAdmin
      .from("solicitudes")
      .select("id, usuario_id, apoyo_nombre, estado, comentario_admin")
      .eq("id", solicitudId)
      .maybeSingle();

    if (solicitudError) throw solicitudError;
    if (!solicitud) {
      console.log("send-push: solicitud no encontrada", { solicitudId });
      return jsonResponse({ error: "Solicitud no encontrada." }, 404);
    }

    const title = buildTitle(estado);
    const bodyText = buildMessage(solicitud.apoyo_nombre, estado);
    const emailResult = await sendStatusEmailIfConfigured(supabaseAdmin, {
      userId: solicitud.usuario_id,
      apoyoNombre: solicitud.apoyo_nombre,
      estado,
      comentarioAdmin: solicitud.comentario_admin,
      title,
      bodyText,
    });

    const { data: tokens, error: tokensError } = await supabaseAdmin
      .from("push_tokens")
      .select("token")
      .eq("user_id", solicitud.usuario_id);

    if (tokensError) throw tokensError;

    const uniqueTokens = [...new Set((tokens || []).map((item) => item.token).filter(Boolean))];

    if (uniqueTokens.length === 0) {
      console.log("send-push: usuario sin tokens", {
        solicitudId,
        usuarioId: solicitud.usuario_id,
      });
      return jsonResponse({
        push: { sent: 0, reason: "El usuario no tiene tokens push guardados." },
        email: emailResult,
      });
    }

    if (!firebaseServiceAccount) {
      console.log("send-push: Firebase no configurado, solo correo", { solicitudId });
      return jsonResponse({
        push: { sent: 0, reason: "Firebase no configurado." },
        email: emailResult,
      });
    }

    console.log("send-push: enviando a Firebase", {
      solicitudId,
      estado,
      tokenCount: uniqueTokens.length,
    });

    const accessToken = await getFirebaseAccessToken(firebaseServiceAccount);

    const results = await Promise.allSettled(
      uniqueTokens.map((token) =>
        sendFirebaseMessage(firebaseServiceAccount.project_id, accessToken, {
          token,
          title,
          body: bodyText,
          solicitudId,
          estado,
        })
      )
    );

    const sent = results.filter((result) => result.status === "fulfilled").length;
    const failed = results.length - sent;
    const failures = results
      .filter((result): result is PromiseRejectedResult => result.status === "rejected")
      .map((result) =>
        result.reason instanceof Error ? result.reason.message : String(result.reason)
      );

    console.log("send-push: resultado", {
      solicitudId,
      estado,
      sent,
      failed,
      failures,
    });

    return jsonResponse({ push: { sent, failed }, email: emailResult });
  } catch (error) {
    console.log(error);
    const message = error instanceof Error ? error.message : "Error inesperado.";
    return jsonResponse({ error: message }, 500);
  }
});

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

const requiredEnv = (key: string) => {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Falta configurar ${key}.`);
  return value;
};

const optionalEnv = (key: string) => Deno.env.get(key)?.trim() || "";

const getOptionalFirebaseServiceAccount = () => {
  const raw = optionalEnv("FIREBASE_SERVICE_ACCOUNT");

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as FirebaseServiceAccount;

    if (!parsed.client_email || !parsed.private_key || !parsed.project_id) {
      throw new Error("El service account no tiene client_email, private_key o project_id.");
    }

    return parsed;
  } catch (error) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT no es JSON valido: ${
        error instanceof Error ? error.message : "valor invalido"
      }`
    );
  }
};

const getFirebaseAccessToken = async (serviceAccount: FirebaseServiceAccount) => {
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = { alg: "RS256", typ: "JWT" };
  const jwtPayload = {
    iss: serviceAccount.client_email,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const unsignedJwt = `${base64UrlEncode(JSON.stringify(jwtHeader))}.${base64UrlEncode(
    JSON.stringify(jwtPayload)
  )}`;
  const signature = await signJwt(unsignedJwt, serviceAccount.private_key);
  const assertion = `${unsignedJwt}.${signature}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`Firebase OAuth error: ${JSON.stringify(payload)}`);
  }

  return payload.access_token as string;
};

const sendFirebaseMessage = async (
  projectId: string,
  accessToken: string,
  message: {
    token: string;
    title: string;
    body: string;
    solicitudId: string;
    estado: string;
  }
) => {
  const response = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: message.token,
          notification: {
            title: message.title,
            body: message.body,
          },
          data: {
            solicitudId: message.solicitudId,
            estado: message.estado,
          },
          android: {
            priority: "HIGH",
            notification: {
              channel_id: "solicitudes",
            },
          },
        },
      }),
    }
  );

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`FCM error: ${JSON.stringify(payload)}`);
  }

  return payload;
};

const signJwt = async (input: string, privateKeyPem: string) => {
  const binaryKey = pemToArrayBuffer(privateKeyPem);
  const key = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(input)
  );

  return base64UrlEncode(signature);
};

const pemToArrayBuffer = (pem: string) => {
  const cleanPem = pem
    .replace(/\\n/g, "\n")
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(cleanPem);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
};

const base64UrlEncode = (input: string | ArrayBuffer) => {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : new Uint8Array(input);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const buildTitle = (estado: string) => {
  if (estado === "aprobado") return "Solicitud aprobada";
  if (estado === "rechazado") return "Solicitud rechazada";
  return "Solicitud actualizada";
};

const buildMessage = (apoyoNombre: string | null, estado: string) => {
  const apoyo = apoyoNombre || "tu solicitud";

  if (estado === "aprobado") return `Tu solicitud para ${apoyo} fue aprobada.`;
  if (estado === "rechazado") return `Tu solicitud para ${apoyo} fue rechazada.`;

  return `Tu solicitud para ${apoyo} fue actualizada.`;
};

const sendStatusEmailIfConfigured = async (
  supabaseAdmin: ReturnType<typeof createClient>,
  payload: {
    userId: string;
    apoyoNombre: string | null;
    estado: string;
    comentarioAdmin?: string | null;
    title: string;
    bodyText: string;
  }
) => {
  const resendApiKey = optionalEnv("RESEND_API_KEY");
  const from = optionalEnv("MAIL_FROM") || optionalEnv("EMAIL_FROM");

  if (!resendApiKey || !from) {
    return { sent: false, reason: "Correo no configurado. Define RESEND_API_KEY y MAIL_FROM." };
  }

  const { data, error } = await supabaseAdmin.auth.admin.getUserById(payload.userId);

  if (error) throw error;

  const to = data.user?.email;

  if (!to) {
    return { sent: false, reason: "El usuario no tiene correo registrado." };
  }

  const html = buildEmailHtml(payload);
  const text = buildEmailText(payload);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: payload.title,
      html,
      text,
    }),
  });

  const responsePayload = await response.json();

  if (!response.ok) {
    throw new Error(`Resend error: ${JSON.stringify(responsePayload)}`);
  }

  return { sent: true, to };
};

const buildEmailText = (payload: {
  apoyoNombre: string | null;
  estado: string;
  comentarioAdmin?: string | null;
  bodyText: string;
}) => {
  const lineas = [
    payload.bodyText,
    "",
    `Apoyo: ${payload.apoyoNombre || "No especificado"}`,
    `Estado: ${formatEstado(payload.estado)}`,
  ];

  if (payload.comentarioAdmin) {
    lineas.push("", `Comentario del administrador: ${payload.comentarioAdmin}`);
  }

  lineas.push("", "Puedes revisar el detalle desde la app Apoyos DIF.");

  return lineas.join("\n");
};

const buildEmailHtml = (payload: {
  apoyoNombre: string | null;
  estado: string;
  comentarioAdmin?: string | null;
  title: string;
  bodyText: string;
}) => `
  <div style="font-family: Arial, sans-serif; color: #172033; line-height: 1.5;">
    <h2 style="color: #123524; margin-bottom: 8px;">${escapeHtml(payload.title)}</h2>
    <p>${escapeHtml(payload.bodyText)}</p>
    <div style="margin: 18px 0; padding: 14px; border: 1px solid #dfe8e2; border-radius: 8px; background: #f7faf8;">
      <p style="margin: 0 0 8px;"><strong>Apoyo:</strong> ${escapeHtml(payload.apoyoNombre || "No especificado")}</p>
      <p style="margin: 0;"><strong>Estado:</strong> ${escapeHtml(formatEstado(payload.estado))}</p>
    </div>
    ${
      payload.comentarioAdmin
        ? `<div style="margin: 18px 0; padding: 14px; border: 1px solid #f0d795; border-radius: 8px; background: #fff8e6;">
            <p style="margin: 0 0 6px;"><strong>Comentario del administrador</strong></p>
            <p style="margin: 0;">${escapeHtml(payload.comentarioAdmin)}</p>
          </div>`
        : ""
    }
    <p style="color: #5f6b7a;">Puedes revisar el detalle desde la app Apoyos DIF.</p>
  </div>
`;

const formatEstado = (estado: string) => {
  if (estado === "aprobado") return "Aprobado";
  if (estado === "rechazado") return "Rechazado";
  if (estado === "cancelada" || estado === "cancelado") return "Cancelada";
  return "Actualizada";
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
