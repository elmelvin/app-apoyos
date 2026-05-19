import { IonButton, IonIcon } from "@ionic/react";
import {
  calendarOutline,
  callOutline,
  closeCircleOutline,
  createOutline,
  documentTextOutline,
  homeOutline,
} from "ionicons/icons";
import { Solicitud } from "../../hooks/useSolicitudes";
import "./SolicitudCard.css";

type Documento = NonNullable<Solicitud["documentos"]>[number];

interface Props {
  solicitud: Solicitud;
  onVerDocumentos: (docs: Documento[]) => void;
  onEditar?: (solicitud: Solicitud) => void;
  onCancelar?: (solicitud: Solicitud) => void;
  updating?: boolean;
}

const SolicitudCard = ({ solicitud, onVerDocumentos, onEditar, onCancelar, updating }: Props) => {
  const documentos = Array.isArray(solicitud.documentos) ? solicitud.documentos : [];
  const estado = (solicitud.estado || "Sin estado").trim();
  const estadoClase = normalizarEstado(estado);
  const fecha = formatearFecha(solicitud.created_at);
  const editable = estado.toLowerCase() === "pendiente";

  return (
    <article className="solicitud-card">
      <div className="solicitud-card__header">
        <div>
          <p className="solicitud-card__eyebrow">Solicitud ciudadana</p>
          <h3>{solicitud.apoyo_nombre || "Apoyo no especificado"}</h3>
          <p className="solicitud-card__person">{solicitud.nombre}</p>
        </div>
        <span className={`solicitud-card__status solicitud-card__status--${estadoClase}`}>
          {estado}
        </span>
      </div>

      <div className="solicitud-card__grid">
        <div className="solicitud-card__item">
          <IonIcon icon={callOutline} />
          <div>
            <span>Telefono</span>
            <strong>{solicitud.telefono || "No disponible"}</strong>
          </div>
        </div>

        <div className="solicitud-card__item">
          <IonIcon icon={calendarOutline} />
          <div>
            <span>Fecha</span>
            <strong>{fecha}</strong>
          </div>
        </div>

        <div className="solicitud-card__item">
          <IonIcon icon={homeOutline} />
          <div>
            <span>Direccion</span>
            <strong>{solicitud.direccion || "No disponible"}</strong>
          </div>
        </div>

        <div className="solicitud-card__item">
          <IonIcon icon={documentTextOutline} />
          <div>
            <span>Documentos</span>
            <strong>
              {documentos.length > 0 ? `${documentos.length} adjuntos` : "Sin adjuntos"}
            </strong>
          </div>
        </div>
      </div>

      <div className="solicitud-card__message">
        <span>Mensaje</span>
        <p>{solicitud.mensaje || "Sin mensaje registrado."}</p>
      </div>

      {solicitud.comentario_admin ? (
        <div className="solicitud-card__admin-note">
          <span>Comentario del administrador</span>
          <p>{solicitud.comentario_admin}</p>
        </div>
      ) : null}

      <div className="solicitud-card__actions">
        <IonButton fill="outline" onClick={() => onVerDocumentos(documentos)}>
          Ver documentos
        </IonButton>
        {editable && onEditar ? (
          <IonButton fill="outline" color="success" onClick={() => onEditar(solicitud)}>
            <IonIcon icon={createOutline} slot="start" />
            Editar
          </IonButton>
        ) : null}
        {editable && onCancelar ? (
          <IonButton
            fill="outline"
            color="danger"
            disabled={updating}
            onClick={() => onCancelar(solicitud)}
          >
            <IonIcon icon={closeCircleOutline} slot="start" />
            {updating ? "Cancelando..." : "Cancelar"}
          </IonButton>
        ) : null}
      </div>
    </article>
  );
};

export default SolicitudCard;

const normalizarEstado = (estado: string) => {
  const texto = estado.toLowerCase();

  if (texto.includes("apro")) return "aprobada";
  if (texto.includes("rech") || texto.includes("cancel")) return "rechazada";
  if (texto.includes("proceso") || texto.includes("revision") || texto.includes("pend")) {
    return "revision";
  }

  return "neutra";
};

const formatearFecha = (fecha?: string) => {
  if (!fecha) return "No disponible";

  const valor = new Date(fecha);

  if (Number.isNaN(valor.getTime())) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(valor);
};
