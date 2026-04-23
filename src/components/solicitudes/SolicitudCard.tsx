import { IonButton } from "@ionic/react";
import Card from "../utilidades/Card";

type Documento = {
  url: string;
  tipo_documento: string;
};

type Solicitud = {
  nombre: string;
  telefono?: string | null;
  direccion?: string | null;
  mensaje?: string | null;
  estado?: string | null;
  apoyo_nombre?: string | null;
  documentos?: Documento[];
};

interface Props {
  solicitud: Solicitud;
  onVerDocumentos: (docs: Documento[]) => void;
}

const SolicitudCard = ({ solicitud, onVerDocumentos }: Props) => {
  const documentos = Array.isArray(solicitud.documentos) ? solicitud.documentos : [];

  return (
    <Card>
      <h3>{solicitud.nombre}</h3>

      <p>
        <strong>Telefono:</strong> {solicitud.telefono || "No disponible"}
      </p>

      <p>
        <strong>Apoyo:</strong> {solicitud.apoyo_nombre || "No especificado"}
      </p>

      <p>
        <strong>Direccion:</strong> {solicitud.direccion || "No disponible"}
      </p>

      <p>
        <strong>Mensaje:</strong> {solicitud.mensaje || "Sin mensaje"}
      </p>

      <p>
        <strong>Estado:</strong> {solicitud.estado || "Sin estado"}
      </p>

      <IonButton onClick={() => onVerDocumentos(documentos)}>
        Ver documentos
      </IonButton>
    </Card>
  );
};

export default SolicitudCard;
