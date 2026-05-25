import { IonContent, IonPage, IonSpinner, useIonViewWillEnter } from "@ionic/react";
import { useHistory } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
  ActiveSettingsSection,
  CuentaResumen,
  PerfilAjustes,
  PerfilHero,
  PerfilResumenCuenta,
} from "../../components/usuario/PerfilSections";
import {
  getPushNotificationPermissionLabel,
  registerPushNotificationsForCurrentUser,
} from "../../hooks/usePushNotifications";
import { changeUserPassword } from "../../services/authService";
import { supabase } from "../../services/supabaseClient";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  getNotificationPreferencesKey,
  NotificationPreferences,
} from "../../utils/notifications";
import { getFriendlyAuthErrorMessage } from "../../utils/auth";
import "./Perfil.css";

interface RelacionNombre {
  nombre?: string | null;
  tipo?: string | null;
}

interface PerfilData {
  nombre: string | null;
  municipios?: RelacionNombre | RelacionNombre[] | null;
  comunidades?: RelacionNombre | RelacionNombre[] | null;
}

const PerfilUsuario: React.FC = () => {
  const history = useHistory();
  const [perfil, setPerfil] = useState<CuentaResumen | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [notificationFeedback, setNotificationFeedback] = useState("");
  const [notificationError, setNotificationError] = useState("");
  const [notificationPermissionLabel, setNotificationPermissionLabel] = useState("revisando");
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const [activeSettingsSection, setActiveSettingsSection] =
    useState<ActiveSettingsSection>(null);

  const inicial = useMemo(() => {
    if (!perfil?.nombre) return "U";
    return perfil.nombre.trim().charAt(0).toUpperCase();
  }, [perfil?.nombre]);

  const cargarPerfil = async () => {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("perfiles")
        .select(`
          nombre,
          municipios(nombre),
          comunidades(nombre, tipo)
        `)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      const perfilData = data as PerfilData;
      const comunidad = obtenerRelacion(perfilData.comunidades);
      const municipio = obtenerRelacion(perfilData.municipios);

      setPerfil({
        nombre: perfilData.nombre || user.user_metadata?.nombre || "Usuario",
        email: user.email || "No disponible",
        municipio: municipio?.nombre || "No seleccionado",
        comunidad: comunidad?.nombre || "No seleccionada",
        tipo: comunidad?.tipo || "No seleccionado",
        userId: user.id,
      });
      cargarPreferenciasNotificacion(user.id);
      actualizarEstadoPermisoNotificacion();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoPermisoNotificacion = async () => {
    const label = await getPushNotificationPermissionLabel();
    setNotificationPermissionLabel(label);
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  useIonViewWillEnter(() => {
    cargarPerfil();
  });

  const cargarPreferenciasNotificacion = (userId: string) => {
    const guardado = window.localStorage.getItem(getNotificationPreferencesKey(userId));

    if (!guardado) {
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
      return;
    }

    try {
      const parseado = JSON.parse(guardado) as NotificationPreferences;
      setNotificationPreferences({
        app: Boolean(parseado.app),
        email: Boolean(parseado.email),
        reminders: Boolean(parseado.reminders),
      });
    } catch {
      setNotificationPreferences(DEFAULT_NOTIFICATION_PREFERENCES);
    }
  };

  const guardarPreferenciasNotificacion = (
    nextPreferences: NotificationPreferences,
    userId?: string
  ) => {
    if (!userId) return;

    window.localStorage.setItem(
      getNotificationPreferencesKey(userId),
      JSON.stringify(nextPreferences)
    );
  };

  const actualizarPassword = async () => {
    setPasswordFeedback("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Completa la contrasena actual, la nueva y su confirmacion.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("La nueva contrasena debe ser diferente a la actual.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contrasenas no coinciden.");
      return;
    }

    try {
      setSavingPassword(true);
      await changeUserPassword(currentPassword, newPassword);
      setPasswordFeedback("La contrasena se actualizo correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (error) {
      setPasswordError(
        getFriendlyAuthErrorMessage(
          error,
          "No se pudo actualizar la contrasena. Intenta de nuevo en unos momentos."
        )
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordForm = () => {
    setPasswordFeedback("");
    setPasswordError("");
    setShowPasswordForm((current) => !current);
  };

  const actualizarPreferenciaNotificacion = async (
    campo: keyof NotificationPreferences,
    valor: boolean
  ) => {
    setNotificationFeedback("");
    setNotificationError("");

    if (campo === "app" && valor) {
      const permiso = await registerPushNotificationsForCurrentUser({
        requestPermission: true,
      });

      await actualizarEstadoPermisoNotificacion();

      if (permiso !== "granted") {
        setNotificationError(
          permiso === "denied"
            ? "Las notificaciones estan bloqueadas en este dispositivo."
            : "Necesitas permitir las notificaciones para activarlas."
        );
        return;
      }
    }

    const nextPreferences = {
      ...notificationPreferences,
      [campo]: valor,
    };

    setNotificationPreferences(nextPreferences);
    guardarPreferenciasNotificacion(nextPreferences, perfil?.userId);
    setNotificationFeedback("Tus preferencias de notificacion se guardaron.");
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
    history.push("/login");
  };

  const toggleSettingsSection = (section: Exclude<ActiveSettingsSection, null>) => {
    setPasswordFeedback("");
    setPasswordError("");
    setNotificationFeedback("");
    setNotificationError("");
    setShowPasswordForm(false);
    setActiveSettingsSection((current) => (current === section ? null : section));
  };

  return (
    <IonPage>
      <IonContent className="perfil-page ion-padding">
        {loading ? (
          <div className="perfil-loading">
            <IonSpinner />
            <p>Cargando perfil...</p>
          </div>
        ) : (
          <div className="perfil-layout">
            <PerfilHero inicial={inicial} perfil={perfil} />
            <PerfilResumenCuenta perfil={perfil} />
            <PerfilAjustes
              activeSettingsSection={activeSettingsSection}
              showPasswordForm={showPasswordForm}
              currentPassword={currentPassword}
              newPassword={newPassword}
              confirmPassword={confirmPassword}
              savingPassword={savingPassword}
              passwordFeedback={passwordFeedback}
              passwordError={passwordError}
              notificationFeedback={notificationFeedback}
              notificationError={notificationError}
              notificationPermissionLabel={notificationPermissionLabel}
              notificationPreferences={notificationPreferences}
              onEditarUbicacion={() =>
                history.push("/usuario/home", { editarUbicacion: true })
              }
              onToggleSettingsSection={toggleSettingsSection}
              onTogglePasswordForm={togglePasswordForm}
              onCurrentPasswordChange={setCurrentPassword}
              onNewPasswordChange={setNewPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onActualizarPassword={actualizarPassword}
              onActualizarPreferenciaNotificacion={actualizarPreferenciaNotificacion}
              onAbrirAyuda={() => history.push("/usuario/ayuda")}
              onAbrirPrivacidad={() => history.push("/usuario/privacidad")}
              onCerrarSesion={cerrarSesion}
            />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PerfilUsuario;

const obtenerRelacion = (
  relacion?: RelacionNombre | RelacionNombre[] | null
): RelacionNombre | null => {
  if (Array.isArray(relacion)) {
    return relacion[0] || null;
  }

  return relacion || null;
};
