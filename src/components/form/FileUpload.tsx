import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { useRef, useState } from "react";

interface FileUploadProps {
  label: string;
  file: File | null;
  setFile: (file: File | null) => void;
  accept?: string;
  helperText?: string;
  error?: string;
}

const FileUpload = ({
  label,
  file,
  setFile,
  accept = "application/pdf,image/*",
  helperText,
  error,
}: FileUploadProps) => {
  const [permissionError, setPermissionError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const supportsImages = accept.includes("image");
  const isNative = Capacitor.isNativePlatform();

  const seleccionarArchivo = (acceptOverride = accept) => {
    setPermissionError("");

    const input = fileInputRef.current;

    if (!input) return;

    input.accept = normalizarAccept(acceptOverride);
    input.value = "";
    input.click();
  };

  const seleccionarImagenNativa = async (source: CameraSource) => {
    setPermissionError("");

    try {
      if (source === CameraSource.Camera) {
        const permission = await Camera.requestPermissions({
          permissions: ["camera"],
        });

        if (permission.camera !== "granted") {
          setPermissionError("Necesitas permitir la camara para tomar la foto.");
          return;
        }
      }

      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.Uri,
        source,
      });

      if (!photo.webPath) return;

      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      const extension = photo.format || "jpg";
      const nombre = `${label.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.${extension}`;

      setFile(new File([blob], nombre, { type: blob.type || `image/${extension}` }));
    } catch (error) {
      console.log(error);
      if (source === CameraSource.Photos) {
        seleccionarArchivo();
        return;
      }

      setPermissionError("No se pudo cargar la imagen. Intenta de nuevo.");
    }
  };

  return (
    <div className={`doc-card ${error ? "doc-card-error" : ""}`}>
      <p>{label}</p>

      {helperText ? <span className="upload-helper">{helperText}</span> : null}
      <input
        ref={fileInputRef}
        type="file"
        accept={normalizarAccept(accept)}
        className="upload-native-input"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        tabIndex={-1}
      />

      {isNative && supportsImages ? (
        <div className="upload-actions">
          <button
            type="button"
            className="upload-action"
            onClick={() => seleccionarImagenNativa(CameraSource.Camera)}
          >
            Tomar foto
          </button>
          <button
            type="button"
            className="upload-action"
            onClick={() => seleccionarImagenNativa(CameraSource.Photos)}
          >
            Galeria
          </button>
          {accept !== "image/*" ? (
            <button
              type="button"
              className="upload-action"
              onClick={() => seleccionarArchivo()}
            >
              Archivo
            </button>
          ) : null}
        </div>
      ) : (
        <button type="button" className="upload-box" onClick={() => seleccionarArchivo()}>
          <div className="upload-content">
            <span>Archivo</span>
            <p>Seleccionar archivo</p>
          </div>
        </button>
      )}

      {file ? <p className="file-name">Cargado: {file.name}</p> : null}
      {permissionError ? <p className="upload-error">{permissionError}</p> : null}
      {error ? <p className="upload-error">{error}</p> : null}
    </div>
  );
};

export default FileUpload;

const normalizarAccept = (accept: string) =>
  accept
    .split(",")
    .map((tipo) => tipo.trim())
    .filter(Boolean)
    .flatMap((tipo) =>
      tipo === "application/pdf" ? ["application/pdf", ".pdf"] : [tipo]
    )
    .join(",");
