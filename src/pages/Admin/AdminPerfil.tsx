import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
} from "@ionic/react";
import {
  keyOutline,
  mailOutline,
  personOutline,
  settingsOutline,
  shieldCheckmarkOutline,
  timeOutline,
} from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import Card from "../../components/utilidades/Card";
import Loader from "../../components/utilidades/Loader";
import { changeUserPassword } from "../../services/authService";
import { supabase } from "../../services/supabaseClient";
import { getFriendlyAuthErrorMessage } from "../../utils/auth";
import { getFriendlyDatabaseErrorMessage } from "../../utils/errors";
import "./AdminPerfil.css";

type AdminCuenta = {
  nombre: string;
  email: string;
  rol: string;
  telefono: string;
  ultimoAcceso: string;
};

const AdminPerfil = () => {
  const history = useHistory();
  const [perfil, setPerfil] = useState<AdminCuenta | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const inicial = useMemo(() => {
    if (!perfil?.nombre) return "A";
    return perfil.nombre.trim().charAt(0).toUpperCase();
  }, [perfil?.nombre]);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("No se encontro la sesion del administrador.");
        return;
      }

      const { data: perfilDb, error: perfilError } = await supabase
        .from("perfiles")
        .select("nombre, rol, telefono")
        .eq("user_id", user.id)
        .maybeSingle();

      if (perfilError) {
        setError(
          getFriendlyDatabaseErrorMessage(
            perfilError,
            "No se pudo cargar la informacion del perfil."
          )
        );
        return;
      }

      setPerfil({
        nombre: perfilDb?.nombre || user.user_metadata?.nombre || "Administrador",
        email: user.email || "No disponible",
        rol: perfilDb?.rol || "admin",
        telefono: perfilDb?.telefono || user.user_metadata?.telefono || "No disponible",
        ultimoAcceso: formatearFecha(user.last_sign_in_at),
      });
    } catch (err) {
      setError(
        getFriendlyDatabaseErrorMessage(err, "No se pudo cargar el perfil.")
      );
    } finally {
      setLoading(false);
    }
  };

  const actualizarPassword = async () => {
    setFeedback("");
    setError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Completa la contrasena actual, la nueva y su confirmacion.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("La nueva contrasena debe ser diferente a la actual.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contrasenas no coinciden.");
      return;
    }

    try {
      setSavingPassword(true);
      await changeUserPassword(currentPassword, newPassword);

      setFeedback("La contrasena se actualizo correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        getFriendlyAuthErrorMessage(
          err,
          "No se pudo actualizar la contrasena. Intenta de nuevo en unos momentos."
        )
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const togglePasswordForm = () => {
    setFeedback("");
    setError("");
    setShowPasswordForm((current) => !current);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading ? (
          <Loader message="Cargando perfil administrativo..." />
        ) : (
          <div className="admin-perfil-page">
            <AdminHeader
              title="Perfil admin"
              subtitle="Consulta tu cuenta, verifica tu acceso y manten segura la sesion administrativa."
            />

            <div className="admin-perfil-layout">
              <Card>
                <div className="admin-perfil-card">
                  <section className="admin-perfil-hero">
                    <div className="admin-perfil-avatar">{inicial}</div>

                    <div className="admin-perfil-hero__content">
                      <p className="admin-perfil__eyebrow">Cuenta administrativa</p>
                      <h2>{perfil?.nombre || "Administrador"}</h2>
                      <p>{perfil?.email || "No disponible"}</p>
                    </div>

                    <span className="admin-perfil-role">
                      {perfil?.rol === "admin" ? "Administrador" : perfil?.rol}
                    </span>
                  </section>

                  <div className="admin-perfil-grid">
                    <div className="admin-perfil-item">
                      <IonIcon icon={mailOutline} />
                      <div>
                        <span>Correo</span>
                        <strong>{perfil?.email || "No disponible"}</strong>
                      </div>
                    </div>

                    <div className="admin-perfil-item">
                      <IonIcon icon={personOutline} />
                      <div>
                        <span>Telefono</span>
                        <strong>{perfil?.telefono || "No disponible"}</strong>
                      </div>
                    </div>

                    <div className="admin-perfil-item">
                      <IonIcon icon={shieldCheckmarkOutline} />
                      <div>
                        <span>Rol</span>
                        <strong>{perfil?.rol || "admin"}</strong>
                      </div>
                    </div>

                    <div className="admin-perfil-item">
                      <IonIcon icon={timeOutline} />
                      <div>
                        <span>Ultimo acceso</span>
                        <strong>{perfil?.ultimoAcceso || "No disponible"}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="admin-perfil-shortcuts">
                    <button
                      className="admin-perfil-shortcut"
                      onClick={() => history.push("/admin/solicitudes")}
                    >
                      <span>Gestion principal</span>
                      <strong>Revisar solicitudes</strong>
                    </button>

                    <button
                      className="admin-perfil-shortcut"
                      onClick={() => history.push("/admin/apoyos")}
                    >
                      <span>Catalogo</span>
                      <strong>Administrar apoyos</strong>
                    </button>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="admin-password-card">
                  <div>
                    <p className="admin-perfil__eyebrow">Configuracion</p>
                    <h3>Ajustes de seguridad</h3>
                    <p className="admin-password-card__copy">
                      Administra opciones sensibles de la cuenta sin dejarlas visibles a primera vista.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="admin-settings-option"
                    onClick={togglePasswordForm}
                  >
                    <div className="admin-settings-option__main">
                      <div className="admin-settings-option__icon">
                        <IonIcon icon={settingsOutline} />
                      </div>
                      <div>
                        <span>Seguridad</span>
                        <strong>Cambiar contrasena</strong>
                        <p>Confirma la contrasena actual antes de registrar una nueva.</p>
                      </div>
                    </div>

                    <IonButton fill="outline" color="medium">
                      {showPasswordForm ? "Ocultar" : "Configurar"}
                    </IonButton>
                  </button>

                  <div className={`admin-password-panel ${showPasswordForm ? "is-open" : ""}`}>
                    {showPasswordForm ? (
                      <>
                        <div className="form-field">
                          <IonItem>
                            <IonLabel position="stacked">Contrasena actual</IonLabel>
                            <IonInput
                              type="password"
                              value={currentPassword}
                              onIonChange={(e) => setCurrentPassword(e.detail.value || "")}
                            />
                          </IonItem>
                        </div>

                        <div className="form-field">
                          <IonItem>
                            <IonLabel position="stacked">Nueva contrasena</IonLabel>
                            <IonInput
                              type="password"
                              value={newPassword}
                              onIonChange={(e) => setNewPassword(e.detail.value || "")}
                            />
                          </IonItem>
                        </div>

                        <div className="form-field">
                          <IonItem>
                            <IonLabel position="stacked">Confirmar contrasena</IonLabel>
                            <IonInput
                              type="password"
                              value={confirmPassword}
                              onIonChange={(e) => setConfirmPassword(e.detail.value || "")}
                            />
                          </IonItem>
                        </div>

                        {feedback ? (
                          <IonText color="success">
                            <p className="admin-password-card__feedback">{feedback}</p>
                          </IonText>
                        ) : null}

                        {error ? (
                          <IonText color="danger">
                            <p className="admin-password-card__feedback">{error}</p>
                          </IonText>
                        ) : null}

                        <div className="admin-password-card__actions">
                          <IonButton
                            fill="outline"
                            color="medium"
                            onClick={cargarPerfil}
                          >
                            Actualizar datos
                          </IonButton>
                          <IonButton onClick={actualizarPassword} disabled={savingPassword}>
                            <IonIcon icon={keyOutline} slot="start" />
                            {savingPassword ? "Guardando..." : "Actualizar contrasena"}
                          </IonButton>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default AdminPerfil;

const formatearFecha = (fecha?: string | null) => {
  if (!fecha) return "No disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(valor);
};
