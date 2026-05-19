import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  getNotificationInboxKey,
  getNotificationSnapshotKey,
} from "../utils/notificationPreferences";

export type UserNotification = {
  id: string;
  solicitudId: string;
  apoyoNombre: string;
  estado: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type SolicitudNotificable = {
  id: string;
  apoyo_nombre: string | null;
  estado: string | null;
  created_at: string;
};

export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const userIdRef = useRef<string | null>(null);

  const refreshNotifications = useCallback(async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setUserId(null);
        userIdRef.current = null;
        setNotifications([]);
        return;
      }

      setUserId(user.id);
      userIdRef.current = user.id;

      const { data, error } = await supabase
        .from("solicitudes")
        .select("id, apoyo_nombre, estado, created_at")
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const solicitudes = (data || []) as SolicitudNotificable[];
      const inboxKey = getNotificationInboxKey(user.id);
      const snapshotKey = getNotificationSnapshotKey(user.id);
      const inboxActual = leerInbox(inboxKey);
      const snapshotAnterior = leerSnapshot(snapshotKey);
      const tieneSnapshotAnterior = Object.keys(snapshotAnterior).length > 0;
      const snapshotNuevo: Record<string, string> = {};
      const nuevasNotificaciones: UserNotification[] = [];

      solicitudes.forEach((solicitud) => {
        const estadoActual = (solicitud.estado || "pendiente").toLowerCase();
        snapshotNuevo[solicitud.id] = estadoActual;

        const estadoAnterior = snapshotAnterior[solicitud.id];
        const cambioDetectado = tieneSnapshotAnterior
          ? typeof estadoAnterior === "string" &&
            estadoAnterior !== estadoActual &&
            esEstadoNotificable(estadoActual)
          : esEstadoNotificable(estadoActual) && !inboxActual.some(
              (item) => item.solicitudId === solicitud.id && item.estado === estadoActual
            );

        if (!cambioDetectado) return;

        const notificationId = `${solicitud.id}:${estadoActual}`;
        const yaExiste = inboxActual.some((item) => item.id === notificationId);

        if (yaExiste) return;

        nuevasNotificaciones.push({
          id: notificationId,
          solicitudId: solicitud.id,
          apoyoNombre: solicitud.apoyo_nombre || "tu solicitud",
          estado: estadoActual,
          title: construirTitulo(estadoActual),
          message: construirMensaje(solicitud.apoyo_nombre, estadoActual),
          createdAt: new Date().toISOString(),
          read: false,
        });
      });

      const inboxFinal = [...nuevasNotificaciones, ...inboxActual].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      window.localStorage.setItem(inboxKey, JSON.stringify(inboxFinal));
      window.localStorage.setItem(snapshotKey, JSON.stringify(snapshotNuevo));
      setNotifications(inboxFinal);
    } catch (error) {
      console.log(error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    if (!userId) return;

    const inboxKey = getNotificationInboxKey(userId);
    const nextNotifications = notifications.map((notification) =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );

    setNotifications(nextNotifications);
    window.localStorage.setItem(inboxKey, JSON.stringify(nextNotifications));
  };

  const markAllAsRead = () => {
    if (!userId) return;

    const inboxKey = getNotificationInboxKey(userId);
    const nextNotifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));

    setNotifications(nextNotifications);
    window.localStorage.setItem(inboxKey, JSON.stringify(nextNotifications));
  };

  const deleteNotification = (notificationId: string) => {
    if (!userId) return;

    const inboxKey = getNotificationInboxKey(userId);
    const nextNotifications = notifications.filter(
      (notification) => notification.id !== notificationId
    );

    setNotifications(nextNotifications);
    window.localStorage.setItem(inboxKey, JSON.stringify(nextNotifications));
  };

  const clearNotifications = () => {
    if (!userId) return;

    const inboxKey = getNotificationInboxKey(userId);
    setNotifications([]);
    window.localStorage.setItem(inboxKey, JSON.stringify([]));
  };

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    if (!userId) return;

    const channelName = `solicitudes-notifications:${userId}:${Date.now()}`;
    const channel = supabase.channel(channelName);

    try {
      channel
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "solicitudes",
            filter: `usuario_id=eq.${userId}`,
          },
          () => {
            refreshNotifications();
          }
        )
        .subscribe((status) => {
          if (status === "CHANNEL_ERROR") {
            console.log("No se pudo conectar el canal de notificaciones.");
          }
        });
    } catch (error) {
      console.log(error);
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshNotifications, userId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!userIdRef.current) return;
      refreshNotifications();
    }, 30000);

    const refreshOnFocus = () => {
      if (document.visibilityState !== "visible") return;
      refreshNotifications();
    };

    document.addEventListener("visibilitychange", refreshOnFocus);
    window.addEventListener("focus", refreshNotifications);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshOnFocus);
      window.removeEventListener("focus", refreshNotifications);
    };
  }, [refreshNotifications]);

  return {
    notifications,
    loading,
    unreadCount: notifications.filter((notification) => !notification.read).length,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  };
};

const leerInbox = (key: string) => {
  const raw = window.localStorage.getItem(key);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as UserNotification[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const leerSnapshot = (key: string) => {
  const raw = window.localStorage.getItem(key);

  if (!raw) return {} as Record<string, string>;

  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const esEstadoNotificable = (estado: string) =>
  ["aprobado", "rechazado", "cancelada", "cancelado"].includes(estado);

const construirTitulo = (estado: string) => {
  if (estado === "aprobado") return "Solicitud aprobada";
  if (estado === "rechazado") return "Solicitud rechazada";
  return "Solicitud actualizada";
};

const construirMensaje = (apoyoNombre: string | null, estado: string) => {
  const apoyo = apoyoNombre || "tu solicitud";

  if (estado === "aprobado") {
    return `Tu solicitud para ${apoyo} fue aprobada.`;
  }

  if (estado === "rechazado") {
    return `Tu solicitud para ${apoyo} fue rechazada.`;
  }

  return `Tu solicitud para ${apoyo} fue cancelada o actualizada.`;
};
