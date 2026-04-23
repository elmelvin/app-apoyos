import { IonButton } from "@ionic/react";
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
          <div>
            <p className="docs-modal__eyebrow">Archivos adjuntos</p>
            <h2>Documentos de la solicitud</h2>
          </div>

          <IonButton fill="clear" color="medium" onClick={() => setShow(false)}>
            Cerrar
          </IonButton>
        </div>

        {documentosSeguros.length === 0 ? (
          <p className="docs-modal__empty">
            No hay documentos asociados a esta solicitud.
          </p>
        ) : (
          <div className="docs-modal__list">
            {documentosSeguros.map((doc, index) => (
              <div key={`${doc.tipo_documento}-${index}`} className="docs-modal__row">
                <div>
                  <strong>{doc.tipo_documento}</strong>
                  <p className="docs-modal__hint">
                    Archivo disponible para consulta o descarga.
                  </p>
                </div>

                <div className="docs-modal__actions">
                  <IonButton
                    fill="outline"
                    size="small"
                    onClick={() => window.open(doc.url, "_blank", "noopener,noreferrer")}
                  >
                    Abrir
                  </IonButton>
                  <IonButton size="small" onClick={() => descargarDocumento(doc, index)}>
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
