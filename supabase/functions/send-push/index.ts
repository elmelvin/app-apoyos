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
    const firebaseServiceAccount = getFirebaseServiceAccount();

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
      .select("id, usuario_id, apoyo_nombre, estado")
      .eq("id", solicitudId)
      .maybeSingle();

    if (solicitudError) throw solicitudError;
    if (!solicitud) {
      console.log("send-push: solicitud no encontrada", { solicitudId });
      return jsonResponse({ error: "Solicitud no encontrada." }, 404);
    }

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
      return jsonResponse({ sent: 0, reason: "El usuario no tiene tokens push guardados." });
    }

    console.log("send-push: enviando a Firebase", {
      solicitudId,
      estado,
      tokenCount: uniqueTokens.length,
    });

    const accessToken = await getFirebaseAccessToken(firebaseServiceAccount);
    const title = buildTitle(estado);
    const bodyText = buildMessage(solicitud.apoyo_nombre, estado);

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

    return jsonResponse({ sent, failed });
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

const getFirebaseServiceAccount = () => {
  const raw = requiredEnv("FIREBASE_SERVICE_ACCOUNT");

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
