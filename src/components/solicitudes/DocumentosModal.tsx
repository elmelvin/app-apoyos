import { IonButton, IonIcon } from "@ionic/react";
import { arrowDownOutline, closeOutline, documentTextOutline, eyeOutline } from "ionicons/icons";
import "./DocumentosModal.css";

type Documento = {
  url: string;
  tipo_documento: string;
};

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  documentos: Documento[];
}

const obtenerExtension = (url: string) => {
  const limpia = url.split("?")[0];
  const extension = limpia.split(".").pop();
  return extension || "bin";
};

const descargarDocumento = (doc: Documento, index: number) => {
  const enlace = document.createElement("a");
  enlace.href = doc.url;
  enlace.download = `${doc.tipo_documento || "documento"}-${index + 1}.${obtenerExtension(
    doc.url
  )}`;
  enlace.target = "_blank";
  enlace.rel = "noreferrer";
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
};

const DocumentosModal = ({ show, setShow, documentos }: Props) => {
  if (!show) return null;

  const documentosSeguros = Array.isArray(documentos) ? documentos : [];

  return (
    <div className="docs-modal__backdrop">
      <div className="docs-modal__content">
        <div className="docs-modal__header">
          <div className="docs-modal__header-copy">
            <p className="docs-modal__eyebrow">Archivos adjuntos</p>
            <h2>Documentos de la solicitud</h2>
            <p className="docs-modal__summary">
              {documentosSeguros.length > 0
                ? `${documentosSeguros.length} archivo${documentosSeguros.length === 1 ? "" : "s"} disponible${documentosSeguros.length === 1 ? "" : "s"} para revision.`
                : "No hay archivos cargados para esta solicitud."}
            </p>
          </div>

          <IonButton fill="clear" color="medium" onClick={() => setShow(false)}>
            <IonIcon slot="icon-only" icon={closeOutline} />
          </IonButton>
        </div>

        {documentosSeguros.length === 0 ? (
          <div className="docs-modal__empty">
            <div className="docs-modal__empty-icon">
              <IonIcon icon={documentTextOutline} />
            </div>
            <p>No hay documentos asociados a esta solicitud.</p>
          </div>
        ) : (
          <div className="docs-modal__list">
            {documentosSeguros.map((doc, index) => (
              <div key={`${doc.tipo_documento}-${index}`} className="docs-modal__row">
                <div className="docs-modal__file-main">
                  <div className="docs-modal__file-icon">
                    <IonIcon icon={documentTextOutline} />
                  </div>

                  <div>
                    <div className="docs-modal__file-top">
                      <strong>{formatearTipoDocumento(doc.tipo_documento)}</strong>
                      <span className="docs-modal__file-badge">
                        .{obtenerExtension(doc.url).toUpperCase()}
                      </span>
                    </div>

                    <p className="docs-modal__hint">
                      Archivo disponible para consulta o descarga.
                    </p>
                  </div>
                </div>

                <div className="docs-modal__actions">
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                  >
                    <IonIcon slot="start" icon={eyeOutline} />
                    Ver
                  </IonButton>
                  <IonButton size="small" onClick={() => descargarDocumento(doc, index)}>
                    <IonIcon slot="start" icon={arrowDownOutline} />
                    Descargar
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="docs-modal__footer">
          <IonButton onClick={() => setShow(false)}>Listo</IonButton>
        </div>
      </div>
    </div>
  );
};

export default DocumentosModal;

const formatearTipoDocumento = (tipo: string) =>
  (tipo || "Documento")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
