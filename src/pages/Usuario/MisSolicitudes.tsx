import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  useIonViewWillEnter,
} from "@ionic/react";
import { documentTextOutline, refreshOutline, timeOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import UsuarioTopBar from "../../components/usuario/UsuarioTopBar";
import { Solicitud, useSolicitudes } from "../../hooks/useSolicitudes";
import SolicitudCard from "../../components/solicitudes/SolicitudCard";
import DocumentosModal from "../../components/solicitudes/DocumentosModal";
import Loader from "../../components/utilidades/Loader";
import EmptyState from "../../components/utilidades/EmptyState";
import AppFeedback, { AppFeedbackState } from "../../components/utilidades/AppFeedback";
import "./MisSolicitudes.css";

type Documento = {
  url: string;
  tipo_documento: string;
};

const MisSolicitudes = () => {
  const history = useHistory();
  const location = useLocation<{ feedback?: AppFeedbackState } | undefined>();
  const { solicitudes, loading, updatingId, cargarSolicitudes, cancelarSolicitud } = useSolicitudes();

  const [showModal, setShowModal] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [feedback, setFeedback] = useState<AppFeedbackState | null>(
    location.state?.feedback || null
  );
  const [solicitudACancelar, setSolicitudACancelar] = useState<Solicitud | null>(null);

  useEffect(() => {
    if (location.state?.feedback) {
      history.replace(location.pathname, {});
    }
  }, [history, location.pathname, location.state]);

  const verDocumentos = (docs: Documento[]) => {
    setDocumentos(Array.isArray(docs) ? docs : []);
    setShowModal(true);
  };

  const editarSolicitud = (solicitud: Solicitud) => {
    history.push("/usuario/formulario-Solicitud", {
      apoyoSeleccionado: solicitud.apoyo_id && solicitud.apoyo_nombre
        ? { id: solicitud.apoyo_id, nombre: solicitud.apoyo_nombre }
        : undefined,
      solicitudEditar: solicitud,
    });
  };

  const cancelarSolicitudPendiente = async (solicitud: Solicitud) => {
    setSolicitudACancelar(solicitud);
  };

  const confirmarCancelacion = async () => {
    if (!solicitudACancelar) return;

    const resultado = await cancelarSolicitud(solicitudACancelar.id);
    setSolicitudACancelar(null);

    if (!resultado.ok) {
      setFeedback({
        type: "error",
        title: "No se pudo cancelar",
        message: resultado.error || "Intenta nuevamente en unos momentos.",
      });
      return;
    }

    setFeedback({
      type: "success",
      title: "Solicitud cancelada",
      message: "La solicitud quedo cancelada. Puedes crear una nueva cuando lo necesites.",
    });
  };

  useIonViewWillEnter(() => {
    cargarSolicitudes();
  });

  return (
    <IonPage>
      <IonContent fullscreen className="mis-solicitudes-page">
        <div className="mis-solicitudes-layout">
          <section className="mis-solicitudes-hero">
            <div className="mis-solicitudes-hero__topbar">
              <UsuarioTopBar variant="hero" />
            </div>

            <div className="mis-solicitudes-hero__content">
              <p className="mis-solicitudes-hero__eyebrow">Seguimiento ciudadano</p>
              <div className="mis-solicitudes-hero__title">
                <IonIcon icon={documentTextOutline} />
                <h1>Mis solicitudes</h1>
              </div>
              <p>
                Consulta estatus, documentos y movimientos recientes.
              </p>
            </div>

            <div className="mis-solicitudes-hero__actions">
              <IonButton fill="outline" color="light" onClick={cargarSolicitudes}>
                <IonIcon slot="start" icon={refreshOutline} />
                Actualizar
              </IonButton>
            </div>
          </section>

          <section className="mis-solicitudes-panel">
            <div className="mis-solicitudes-panel__header">
              <div>
                <p className="mis-solicitudes-panel__eyebrow">Historial</p>
                <h2>Tus solicitudes recientes</h2>
              </div>
              <div className="mis-solicitudes-panel__meta">
                <IonIcon icon={timeOutline} />
                <span>Mas recientes primero</span>
              </div>
            </div>

            {loading ? (
              <Loader message="Cargando solicitudes..." />
            ) : solicitudes.length === 0 ? (
              <div className="mis-solicitudes-empty">
                <EmptyState message="Aun no tienes solicitudes registradas." />
              </div>
            ) : (
              <div className="mis-solicitudes-list">
                {solicitudes.map((solicitud) => (
                  <SolicitudCard
                    key={solicitud.id}
                    solicitud={solicitud}
                    onVerDocumentos={verDocumentos}
                    onEditar={editarSolicitud}
                    onCancelar={cancelarSolicitudPendiente}
                    updating={updatingId === solicitud.id}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <DocumentosModal
          show={showModal}
          setShow={setShowModal}
          documentos={documentos}
        />

        <IonAlert
          isOpen={Boolean(solicitudACancelar)}
          header="Cancelar solicitud"
          message={`Se cancelara la solicitud de "${
            solicitudACancelar?.apoyo_nombre || "apoyo"
          }". Podras crear una nueva despues.`}
          buttons={[
            {
              text: "Conservar",
              role: "cancel",
              handler: () => setSolicitudACancelar(null),
            },
            {
              text: "Cancelar solicitud",
              role: "destructive",
              handler: confirmarCancelacion,
            },
          ]}
          onDidDismiss={() => setSolicitudACancelar(null)}
        />

        <AppFeedback feedback={feedback} onClose={() => setFeedback(null)} />
      </IonContent>
    </IonPage>
  );
};

export default MisSolicitudes;
