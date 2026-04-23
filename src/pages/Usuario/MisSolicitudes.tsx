import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, useIonViewWillEnter } from "@ionic/react";
import { useState } from "react";
import { useSolicitudes } from "../../hooks/useSolicitudes";
import SolicitudCard from "../../components/solicitudes/SolicitudCard";
import DocumentosModal from "../../components/solicitudes/DocumentosModal";
import Loader from "../../components/utilidades/Loader";
import EmptyState from "../../components/utilidades/EmptyState";

type Documento = {
  url: string;
  tipo_documento: string;
};

const MisSolicitudes = () => {
  const { solicitudes, loading, cargarSolicitudes } = useSolicitudes();

  const [showModal, setShowModal] = useState(false);
  const [documentos, setDocumentos] = useState<Documento[]>([]);

  const verDocumentos = (docs: Documento[]) => {
    setDocumentos(Array.isArray(docs) ? docs : []);
    setShowModal(true);
  };

  useIonViewWillEnter(() => {
    cargarSolicitudes();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mis Solicitudes</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading ? (
          <Loader />
        ) : solicitudes.length === 0 ? (
          <EmptyState message="No tienes solicitudes registradas" />
        ) : (
          solicitudes.map((solicitud) => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              onVerDocumentos={verDocumentos}
            />
          ))
        )}

        <DocumentosModal
          show={showModal}
          setShow={setShowModal}
          documentos={documentos}
        />
      </IonContent>
    </IonPage>
  );
};

export default MisSolicitudes;
