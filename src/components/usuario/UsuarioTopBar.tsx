import { IonButton, IonIcon } from "@ionic/react";
import {
  checkmarkCircleOutline,
  checkmarkDoneOutline,
  closeOutline,
  notificationsOutline,
  refreshOutline,
  trashOutline,
} from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useUserNotifications } from "../../hooks/useUserNotifications";
import "./UsuarioTopBar.css";

interface UsuarioTopBarProps {
  variant?: "surface" | "hero";
}

const UsuarioTopBar: React.FC<UsuarioTopBarProps> = ({ variant = "surface" }) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
  } = useUserNotifications();

  useEffect(() => {
    if (!open) return;

    refreshNotifications();
  }, [open, refreshNotifications]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className={`usuario-topbar usuario-topbar--${variant}`}>
      <button
        ref={buttonRef}
        type="button"
        className="usuario-topbar__bell"
        onClick={() => setOpen((current) => !current)}
        aria-label="Abrir notificaciones"
        aria-expanded={open}
      >
        <IonIcon icon={notificationsOutline} />
        {unreadCount > 0 ? (
          <span className="usuario-topbar__badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div ref={panelRef} className="usuario-topbar__panel">
          <div className="usuario-topbar__panel-header">
            <div>
              <p className="usuario-topbar__eyebrow">Notificaciones</p>
              <strong>Avisos de tus solicitudes</strong>
            </div>

            <button
              type="button"
              className="usuario-topbar__close"
              onClick={() => setOpen(false)}
              aria-label="Cerrar notificaciones"
            >
              <IonIcon icon={closeOutline} />
            </button>
          </div>

          <div className="usuario-topbar__actions">
            <IonButton
              fill="outline"
              color="medium"
              onClick={refreshNotifications}
              disabled={loading}
            >
              <IonIcon icon={refreshOutline} slot="start" />
              Actualizar
            </IonButton>

            {notifications.length > 0 ? (
              <>
                <IonButton
                  fill="clear"
                  color="medium"
                  onClick={markAllAsRead}
                >
                  <IonIcon icon={checkmarkDoneOutline} slot="start" />
                  Leidas
                </IonButton>
                <IonButton
                  fill="clear"
                  color="danger"
                  onClick={clearNotifications}
                >
                  <IonIcon icon={trashOutline} slot="start" />
                  Limpiar
                </IonButton>
              </>
            ) : null}
          </div>

          {loading ? (
            <p className="usuario-topbar__empty">
              Revisando cambios recientes en tus solicitudes...
            </p>
          ) : notifications.length === 0 ? (
            <p className="usuario-topbar__empty">
              Aqui veras avisos cuando el estado de una solicitud cambie.
            </p>
          ) : (
            <div className="usuario-topbar__list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`usuario-topbar__item ${
                    notification.read ? "is-read" : "is-unread"
                  }`}
                >
                  <button
                    type="button"
                    className="usuario-topbar__item-main"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="usuario-topbar__item-icon">
                      <IonIcon
                        icon={
                          notification.estado === "aprobado"
                            ? checkmarkCircleOutline
                            : notificationsOutline
                        }
                      />
                    </div>

                    <div className="usuario-topbar__item-content">
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>{formatNotificationDate(notification.createdAt)}</small>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="usuario-topbar__item-delete"
                    onClick={() => deleteNotification(notification.id)}
                    aria-label="Eliminar notificacion"
                  >
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default UsuarioTopBar;

const formatNotificationDate = (date: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
