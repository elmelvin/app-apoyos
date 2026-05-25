import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonToggle,
} from "@ionic/react";
import {
  atOutline,
  businessOutline,
  chevronDownOutline,
  chevronForwardOutline,
  constructOutline,
  exitOutline,
  helpCircleOutline,
  homeOutline,
  keyOutline,
  notificationsOutline,
  personOutline,
  pinOutline,
  shieldCheckmarkOutline,
} from "ionicons/icons";
import UsuarioTopBar from "./UsuarioTopBar";
import { NotificationPreferences } from "../../utils/notifications";

export type CuentaResumen = {
  nombre: string;
  email: string;
  municipio: string;
  comunidad: string;
  tipo: string;
  userId: string;
};

export type ActiveSettingsSection = "security" | "notifications" | "support" | null;

export const PerfilHero = ({
  inicial,
  perfil,
}: {
  inicial: string;
  perfil: CuentaResumen | null;
}) => (
  <section className="perfil-hero">
    <div className="perfil-hero__topbar">
      <UsuarioTopBar variant="hero" />
    </div>

    <div className="perfil-hero__content">
      <p className="perfil-hero__eyebrow">Mi cuenta</p>
      <div className="perfil-hero__title">
        <div className="perfil-avatar">{inicial}</div>
        <h1>{perfil?.nombre || "Usuario"}</h1>
      </div>
      <IonText color="medium">
        <p>{perfil?.email || "No disponible"}</p>
      </IonText>
    </div>

    <div className="perfil-hero__aside">
      <div className="perfil-hero__badge">
        <span>{perfil?.tipo || "Sin tipo"}</span>
      </div>
    </div>
  </section>
);

export const PerfilResumenCuenta = ({ perfil }: { perfil: CuentaResumen | null }) => (
  <IonCard className="perfil-card perfil-card--compact">
    <IonCardContent>
      <div className="perfil-card__header">
        <div>
          <p className="perfil-card__eyebrow">Mi cuenta</p>
          <h2>Resumen de cuenta</h2>
        </div>
        <span className="perfil-status-pill">Activa</span>
      </div>

      <div className="perfil-list">
        <PerfilResumenItem icon={personOutline} label="Nombre" value={perfil?.nombre || "No registrado"} />
        <PerfilResumenItem icon={atOutline} label="Correo" value={perfil?.email || "No disponible"} />
        <PerfilResumenItem icon={businessOutline} label="Municipio" value={perfil?.municipio || "No seleccionado"} />
        <PerfilResumenItem icon={homeOutline} label="Comunidad" value={perfil?.comunidad || "No seleccionada"} />
      </div>
    </IonCardContent>
  </IonCard>
);

export const PerfilAjustes = ({
  activeSettingsSection,
  showPasswordForm,
  currentPassword,
  newPassword,
  confirmPassword,
  savingPassword,
  passwordFeedback,
  passwordError,
  notificationFeedback,
  notificationError,
  notificationPermissionLabel,
  notificationPreferences,
  onEditarUbicacion,
  onToggleSettingsSection,
  onTogglePasswordForm,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onActualizarPassword,
  onActualizarPreferenciaNotificacion,
  onAbrirAyuda,
  onAbrirPrivacidad,
  onCerrarSesion,
}: {
  activeSettingsSection: ActiveSettingsSection;
  showPasswordForm: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  savingPassword: boolean;
  passwordFeedback: string;
  passwordError: string;
  notificationFeedback: string;
  notificationError: string;
  notificationPermissionLabel: string;
  notificationPreferences: NotificationPreferences;
  onEditarUbicacion: () => void;
  onToggleSettingsSection: (section: Exclude<ActiveSettingsSection, null>) => void;
  onTogglePasswordForm: () => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onActualizarPassword: () => void;
  onActualizarPreferenciaNotificacion: (
    campo: keyof NotificationPreferences,
    valor: boolean
  ) => void;
  onAbrirAyuda: () => void;
  onAbrirPrivacidad: () => void;
  onCerrarSesion: () => void;
}) => (
  <IonCard className="perfil-card perfil-card--options">
    <IonCardContent>
      <p className="perfil-card__eyebrow">Configuracion</p>
      <h2>Ajustes de la app</h2>

      <div className="perfil-settings-hub">
        <PerfilOption
          icon={pinOutline}
          title="Editar ubicacion"
          subtitle="Actualiza municipio y comunidad"
          onClick={onEditarUbicacion}
        />

        <PerfilAccordionOption
          active={activeSettingsSection === "security"}
          icon={keyOutline}
          title="Seguridad"
          subtitle="Cambia tu contrasena y protege tu acceso"
          onClick={() => onToggleSettingsSection("security")}
        />

        {activeSettingsSection === "security" ? (
          <div className="perfil-settings-group">
            <PerfilSettingsHeader
              icon={keyOutline}
              title="Seguridad"
              subtitle="Cambia tu contrasena sin salir de la app."
            />

            <div className="perfil-settings-group__actions">
              <IonButton fill="outline" color="medium" onClick={onTogglePasswordForm}>
                {showPasswordForm ? "Ocultar" : "Cambiar contrasena"}
              </IonButton>
            </div>

            {showPasswordForm ? (
              <div className="perfil-password-panel">
                <PasswordField
                  label="Contrasena actual"
                  value={currentPassword}
                  onChange={onCurrentPasswordChange}
                />
                <PasswordField
                  label="Nueva contrasena"
                  value={newPassword}
                  onChange={onNewPasswordChange}
                />
                <PasswordField
                  label="Confirmar contrasena"
                  value={confirmPassword}
                  onChange={onConfirmPasswordChange}
                />

                {passwordFeedback ? (
                  <IonText color="success">
                    <p className="perfil-feedback">{passwordFeedback}</p>
                  </IonText>
                ) : null}
                {passwordError ? (
                  <IonText color="danger">
                    <p className="perfil-feedback">{passwordError}</p>
                  </IonText>
                ) : null}

                <div className="perfil-inline-actions">
                  <IonButton fill="outline" color="medium" onClick={onTogglePasswordForm}>
                    Cancelar
                  </IonButton>
                  <IonButton onClick={onActualizarPassword} disabled={savingPassword}>
                    <IonIcon icon={keyOutline} slot="start" />
                    {savingPassword ? "Guardando..." : "Guardar contrasena"}
                  </IonButton>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <PerfilAccordionOption
          active={activeSettingsSection === "notifications"}
          icon={notificationsOutline}
          title="Notificaciones"
          subtitle="Elige como quieres recibir avisos del proceso"
          onClick={() => onToggleSettingsSection("notifications")}
        />

        {activeSettingsSection === "notifications" ? (
          <div className="perfil-settings-group">
            <PerfilSettingsHeader
              icon={notificationsOutline}
              title="Notificaciones"
              subtitle="Activa o desactiva los avisos importantes de tu cuenta."
            />

            <div className="perfil-notification-list">
              <NotificationRow
                title="Alertas en la app"
                subtitle={`Estado actual: ${notificationPermissionLabel}`}
                checked={notificationPreferences.app}
                onChange={(valor) => onActualizarPreferenciaNotificacion("app", valor)}
              />
              <NotificationRow
                title="Avisos por correo"
                subtitle="Recibe actualizaciones cuando cambie el estado de tu solicitud."
                checked={notificationPreferences.email}
                onChange={(valor) => onActualizarPreferenciaNotificacion("email", valor)}
              />
              <NotificationRow
                title="Recordatorios"
                subtitle="Te ayudaran a completar documentos o revisar pendientes."
                checked={notificationPreferences.reminders}
                onChange={(valor) => onActualizarPreferenciaNotificacion("reminders", valor)}
              />
            </div>

            {notificationFeedback ? (
              <IonText color="success">
                <p className="perfil-feedback">{notificationFeedback}</p>
              </IonText>
            ) : null}
            {notificationError ? (
              <IonText color="danger">
                <p className="perfil-feedback">{notificationError}</p>
              </IonText>
            ) : null}
          </div>
        ) : null}

        <PerfilAccordionOption
          active={activeSettingsSection === "support"}
          icon={constructOutline}
          title="Soporte"
          subtitle="Ayuda, privacidad y orientacion"
          onClick={() => onToggleSettingsSection("support")}
        />

        {activeSettingsSection === "support" ? (
          <div className="perfil-settings-group">
            <PerfilSettingsHeader
              icon={helpCircleOutline}
              title="Soporte del usuario"
              subtitle="Encuentra orientacion y revisa la informacion de privacidad."
            />

            <div className="perfil-options perfil-options--inner">
              <PerfilOption
                icon={helpCircleOutline}
                title="Centro de ayuda"
                subtitle="Consulta orientacion y canales de atencion"
                onClick={onAbrirAyuda}
              />
              <PerfilOption
                icon={shieldCheckmarkOutline}
                title="Aviso de privacidad"
                subtitle="Revisa como se utiliza tu informacion"
                onClick={onAbrirPrivacidad}
              />
            </div>
          </div>
        ) : null}

        <div className="perfil-session-actions">
          <button className="perfil-option perfil-option--danger" onClick={onCerrarSesion}>
            <div className="perfil-option__main">
              <div className="perfil-option__icon perfil-option__icon--danger">
                <IonIcon icon={exitOutline} />
              </div>
              <div>
                <strong>Cerrar sesion</strong>
                <span>Salir de tu cuenta en este dispositivo</span>
              </div>
            </div>
            <IonIcon icon={chevronForwardOutline} />
          </button>
        </div>
      </div>
    </IonCardContent>
  </IonCard>
);

const PerfilResumenItem = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <div className="perfil-list__item">
    <div className="perfil-list__icon">
      <IonIcon icon={icon} />
    </div>
    <div className="perfil-list__content">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  </div>
);

const PerfilOption = ({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <button className="perfil-option" onClick={onClick}>
    <div className="perfil-option__main">
      <div className="perfil-option__icon">
        <IonIcon icon={icon} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
    <IonIcon icon={chevronForwardOutline} />
  </button>
);

const PerfilAccordionOption = ({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: string;
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <button
    className={`perfil-option perfil-option--accordion ${active ? "is-active" : ""}`}
    onClick={onClick}
  >
    <div className="perfil-option__main">
      <div className="perfil-option__icon">
        <IonIcon icon={icon} />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
    <IonIcon icon={active ? chevronDownOutline : chevronForwardOutline} />
  </button>
);

const PerfilSettingsHeader = ({
  icon,
  title,
  subtitle,
}: {
  icon: string;
  title: string;
  subtitle: string;
}) => (
  <div className="perfil-settings-group__header">
    <div className="perfil-option__icon">
      <IonIcon icon={icon} />
    </div>
    <div>
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
  </div>
);

const PasswordField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <IonItem>
    <IonLabel position="stacked">{label}</IonLabel>
    <IonInput
      type="password"
      value={value}
      onIonChange={(e) => onChange(e.detail.value || "")}
    />
  </IonItem>
);

const NotificationRow = ({
  title,
  subtitle,
  checked,
  onChange,
}: {
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="perfil-notification-item">
    <div>
      <strong>{title}</strong>
      <span>{subtitle}</span>
    </div>
    <IonToggle checked={checked} onIonChange={(e) => onChange(e.detail.checked)} />
  </div>
);
