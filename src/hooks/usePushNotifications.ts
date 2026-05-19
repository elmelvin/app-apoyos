import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "../services/supabaseClient";

type RegisterPushOptions = {
  requestPermission?: boolean;
};

let listenersReady = false;
let registering = false;

export const usePushNotifications = () => {
  useEffect(() => {
    let cancelled = false;

    const setupPushNotifications = async (requestPermission = false) => {
      if (!Capacitor.isNativePlatform()) return;
      if (cancelled) return;

      await registerPushNotificationsForCurrentUser({ requestPermission });
    };

    setupPushNotifications(true).catch((error) => console.log(error));

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        setupPushNotifications(true).catch((error) => console.log(error));
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);
};

export const registerPushNotificationsForCurrentUser = async (
  options: RegisterPushOptions = {}
) => {
  if (!Capacitor.isNativePlatform()) {
    return ensureWebNotificationPermission(options.requestPermission);
  }

  if (registering) return "pending";
  registering = true;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return "missing-user";

    const pushPermission = await ensurePushPermission(Boolean(options.requestPermission));
    if (pushPermission !== "granted") return pushPermission;

    await ensureLocalNotificationPermission(Boolean(options.requestPermission));
    await ensureNotificationChannels();
    await ensurePushListeners();
    await PushNotifications.register();

    return "granted";
  } finally {
    registering = false;
  }
};

export const getPushNotificationPermissionLabel = async () => {
  if (!Capacitor.isNativePlatform()) {
    if (typeof Notification === "undefined") return "no disponibles";
    if (Notification.permission === "granted") return "permitidas";
    if (Notification.permission === "denied") return "bloqueadas";
    return "pendientes de permiso";
  }

  const permission = await PushNotifications.checkPermissions();

  if (permission.receive === "granted") return "permitidas";
  if (permission.receive === "denied") return "bloqueadas";
  return "pendientes de permiso";
};

const ensurePushPermission = async (requestPermission: boolean) => {
  const currentPermission = await PushNotifications.checkPermissions();

  if (requestPermission && currentPermission.receive === "prompt") {
    const requestedPermission = await PushNotifications.requestPermissions();
    return requestedPermission.receive;
  }

  return currentPermission.receive;
};

const ensureLocalNotificationPermission = async (requestPermission: boolean) => {
  const currentPermission = await LocalNotifications.checkPermissions();

  if (requestPermission && currentPermission.display === "prompt") {
    return LocalNotifications.requestPermissions();
  }

  return currentPermission;
};

const ensureWebNotificationPermission = async (requestPermission?: boolean) => {
  if (typeof Notification === "undefined") return "unsupported";

  if (requestPermission && Notification.permission === "default") {
    return Notification.requestPermission();
  }

  return Notification.permission;
};

const ensurePushListeners = async () => {
  if (listenersReady) return;

  await PushNotifications.addListener("registration", async (token) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await guardarPushToken(user.id, token.value);
  });

  await PushNotifications.addListener("registrationError", (error) => {
    console.log("No se pudo registrar el dispositivo para push.", error);
  });

  await PushNotifications.addListener("pushNotificationReceived", () => {
    // El historial se actualiza en la campanita; evitamos duplicar avisos dentro de la app.
  });

  listenersReady = true;
};

const ensureNotificationChannels = async () => {
  await PushNotifications.createChannel({
    id: "solicitudes",
    name: "Solicitudes",
    description: "Actualizaciones del estado de tus solicitudes",
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
  }).catch((error) => console.log(error));

  await LocalNotifications.createChannel({
    id: "solicitudes",
    name: "Solicitudes",
    description: "Actualizaciones del estado de tus solicitudes",
    importance: 4,
    visibility: 1,
    vibration: true,
    lights: true,
  }).catch((error) => console.log(error));
};

const guardarPushToken = async (userId: string, token: string) => {
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      token,
      platform: Capacitor.getPlatform(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "token" }
  );

  if (error) {
    console.log("No se pudo guardar el token push en Supabase.", error.message);
  }
};
