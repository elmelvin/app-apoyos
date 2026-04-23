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
  return (
    <div className={`doc-card ${error ? "doc-card-error" : ""}`}>
      <p>{label}</p>

      {helperText ? <span className="upload-helper">{helperText}</span> : null}

      <label className="upload-box">
        <input
          type="file"
          accept={accept}
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          hidden
        />

        <div className="upload-content">
          <span>Archivo</span>
          <p>Seleccionar archivo</p>
        </div>
      </label>

      {file ? <p className="file-name">Cargado: {file.name}</p> : null}
      {error ? <p className="upload-error">{error}</p> : null}
    </div>
  );
};

export default FileUpload;
