import {
  IonAlert,
  IonBadge,
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonToggle,
  useIonViewWillEnter,
} from "@ionic/react";
import { addCircleOutline, createOutline, trashOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import AdminHeader from "../../components/admin/AdminHeader";
import Card from "../../components/utilidades/Card";
import EmptyState from "../../components/utilidades/EmptyState";
import AppFeedback, { AppFeedbackState } from "../../components/utilidades/AppFeedback";
import Loader from "../../components/utilidades/Loader";
import StatCard from "../../components/utilidades/StatCard";
import {
  Apoyo,
  cambiarEstadoApoyo,
  eliminarApoyo,
  getAdminApoyos,
} from "../../services/apoyosService";
import "./AdminApoyos.css";

type AdminApoyo = Apoyo & {
  municipio_nombre?: string | null;
};

const AdminApoyos = () => {
  const history = useHistory();
  const location = useLocation<{ feedback?: string } | undefined>();
  const [apoyos, setApoyos] = useState<AdminApoyo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState(location.state?.feedback || "");
  const [toastFeedback, setToastFeedback] = useState<AppFeedbackState | null>(
    location.state?.feedback
      ? {
          type: "success",
          title: "Catalogo actualizado",
          message: location.state.feedback,
        }
      : null
  );
  const [apoyoAEliminar, setApoyoAEliminar] = useState<AdminApoyo | null>(null);

  const resumen = useMemo(() => {
    const total = apoyos.length;
    const generales = apoyos.filter((apoyo) => !apoyo.municipio_id).length;
    const municipales = total - generales;
    const activos = apoyos.filter((apoyo) => apoyo.activo !== false).length;

    return { total, generales, municipales, activos };
  }, [apoyos]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError("");

      const apoyosData = await getAdminApoyos();

      setApoyos(apoyosData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudieron cargar los apoyos.";
      setError(message);
      setApoyos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useIonViewWillEnter(() => {
    cargarDatos();
  });

  const borrarApoyo = async (apoyo: AdminApoyo) => {
    setApoyoAEliminar(apoyo);
  };

  const confirmarEliminarApoyo = async () => {
    if (!apoyoAEliminar) return;

    try {
      setDeletingId(apoyoAEliminar.id);
      setFeedback("");
      setError("");
      await eliminarApoyo(apoyoAEliminar.id);
      setFeedback("Apoyo eliminado correctamente.");
      setToastFeedback({
        type: "success",
        title: "Apoyo eliminado",
        message: `El apoyo "${apoyoAEliminar.nombre}" se retiro del catalogo.`,
      });
      setApoyoAEliminar(null);

      await cargarDatos();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo eliminar el apoyo.";
      setError(message);
      setToastFeedback({
        type: "error",
        title: "No se pudo eliminar",
        message,
      });
    } finally {
      setDeletingId(null);
    }
  };

  const toggleEstadoApoyo = async (apoyo: AdminApoyo, activo: boolean) => {
    try {
      setTogglingId(apoyo.id);
      setFeedback("");
      setError("");
      await cambiarEstadoApoyo(apoyo.id, activo);
      setFeedback(
        activo
          ? `El apoyo "${apoyo.nombre}" fue activado.`
          : `El apoyo "${apoyo.nombre}" fue desactivado.`
      );
      setToastFeedback({
        type: "success",
        title: activo ? "Apoyo activado" : "Apoyo desactivado",
        message: activo
          ? "El apoyo vuelve a estar visible para los usuarios."
          : "El apoyo quedo oculto del portal ciudadano.",
      });
      await cargarDatos();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No se pudo actualizar el estado del apoyo.";
      setError(message);
      setToastFeedback({
        type: "error",
        title: "No se pudo actualizar",
        message,
      });
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        {loading ? (
          <Loader message="Cargando apoyos..." />
        ) : (
          <div className="admin-apoyos-page">
            <AdminHeader
              title="Apoyos"
              subtitle="Crea apoyos generales o asignados a un municipio para que aparezcan en el portal ciudadano."
            />

            <div className="admin-apoyos-stats">
              <StatCard title="Total apoyos" value={resumen.total} />
              <StatCard title="Activos" value={resumen.activos} />
              <StatCard title="Generales" value={resumen.generales} />
              <StatCard title="Municipales" value={resumen.municipales} />
            </div>

            <div className="admin-apoyos-layout">
              <Card>
                <div className="admin-apoyos-entry">
                  <div>
                    <p className="admin-apoyos__eyebrow">Acciones del catalogo</p>
                    <h3>Registrar un nuevo apoyo</h3>
                    <p className="admin-apoyos__copy">
                      Crea apoyos generales o municipales desde una vista dedicada, con
                      toda la informacion necesaria antes de publicarlos.
                    </p>
                  </div>

                  <div className="admin-apoyos-entry__details">
                    <span>Define nombre, descripcion y requisitos.</span>
                    <span>Asigna el apoyo a un municipio o dejalo como general.</span>
                    <span>Vuelve al catalogo para editar, activar o eliminar registros.</span>
                  </div>

                  {feedback ? <p className="admin-apoyos__success">{feedback}</p> : null}
                  {error ? <p className="form-warning">{error}</p> : null}

                  <div className="admin-apoyos-entry__actions">
                    <IonButton fill="outline" color="medium" onClick={cargarDatos}>
                      Actualizar lista
                    </IonButton>
                    <IonButton onClick={() => history.push("/admin/apoyos/nuevo")}>
                      <IonIcon icon={addCircleOutline} slot="start" />
                      Crear apoyo
                    </IonButton>
                  </div>
                </div>
              </Card>

              <Card>
                <div className="admin-apoyos-list">
                  <div className="admin-apoyos-list__header">
                    <div>
                      <p className="admin-apoyos__eyebrow">Catalogo actual</p>
                      <h3>Apoyos registrados</h3>
                    </div>
                  </div>

                  {apoyos.length === 0 ? (
                    <EmptyState message="Todavia no hay apoyos registrados." />
                  ) : (
                    <div className="admin-apoyos-list__items">
                      {apoyos.map((apoyo) => (
                        <article key={apoyo.id} className="admin-apoyo-item">
                          <div className="admin-apoyo-item__header">
                            <div>
                              <h4>{apoyo.nombre}</h4>
                              <p>{apoyo.descripcion || "Sin descripcion disponible."}</p>
                            </div>

                            <IonBadge
                              className={`admin-apoyo-item__badge ${
                                apoyo.activo === false
                                  ? "inactive"
                                  : apoyo.municipio_id
                                  ? "municipal"
                                  : "general"
                              }`}
                            >
                              {apoyo.activo === false
                                ? "Inactivo"
                                : apoyo.municipio_nombre || "General"}
                            </IonBadge>
                          </div>

                          <div className="admin-apoyo-item__requisitos">
                            <span>Requisitos</span>
                            <ul>
                              {normalizarRequisitos(apoyo.requisitos).map((requisito) => (
                                <li key={`${apoyo.id}-${requisito}`}>{requisito}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="admin-apoyo-item__status-row">
                            <div>
                              <strong>Visible en portal</strong>
                              <p>
                                {apoyo.activo === false
                                  ? "Actualmente oculto para los usuarios."
                                  : "Actualmente disponible para los usuarios."}
                              </p>
                            </div>

                            <IonToggle
                              checked={apoyo.activo !== false}
                              disabled={togglingId === apoyo.id}
                              onIonChange={(e) =>
                                toggleEstadoApoyo(apoyo, e.detail.checked)
                              }
                            />
                          </div>

                          <div className="admin-apoyo-item__actions">
                            <IonButton
                              fill="outline"
                              color="medium"
                              onClick={() => history.push(`/admin/apoyos/editar/${apoyo.id}`)}
                            >
                              <IonIcon icon={createOutline} slot="start" />
                              Editar
                            </IonButton>
                            <IonButton
                              color="danger"
                              fill="outline"
                              disabled={deletingId === apoyo.id}
                              onClick={() => borrarApoyo(apoyo)}
                            >
                              <IonIcon icon={trashOutline} slot="start" />
                              {deletingId === apoyo.id ? "Eliminando..." : "Eliminar"}
                            </IonButton>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        <IonAlert
          isOpen={Boolean(apoyoAEliminar)}
          header="Eliminar apoyo"
          message={`Se eliminara el apoyo "${
            apoyoAEliminar?.nombre || ""
          }". Esta accion no se puede deshacer.`}
          buttons={[
            {
              text: "Conservar",
              role: "cancel",
              handler: () => setApoyoAEliminar(null),
            },
            {
              text: "Eliminar",
              role: "destructive",
              handler: confirmarEliminarApoyo,
            },
          ]}
          onDidDismiss={() => setApoyoAEliminar(null)}
        />

        <AppFeedback feedback={toastFeedback} onClose={() => setToastFeedback(null)} />
      </IonContent>
    </IonPage>
  );
};

export default AdminApoyos;

const normalizarRequisitos = (requisitos?: string | null) =>
  (requisitos || "")
    .split(/\r?\n|,|;|•/)
    .map((item) => item.trim())
    .filter(Boolean);
