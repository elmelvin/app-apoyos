import { IonButton } from "@ionic/react";
import FileUpload from "../form/FileUpload";
import InputField from "../form/InputField";
import { ApoyoSeleccionadoPayload } from "../../services/apoyosService";
import {
  DOCUMENTO_EVIDENCIA_ADICIONAL,
  DOCUMENTO_EVIDENCIA_SOLICITUD,
  OPCIONES_APOYO,
  OPCIONES_DEPENDIENTES,
  OPCIONES_INGRESO,
  OPCIONES_LABORALES,
  OPCIONES_SERVICIOS,
  OPCIONES_VIVIENDA,
} from "./constants";
import { obtenerAcceptDocumento, obtenerHelperDocumento } from "./utils";
import { SelectField } from "./SolicitudFormFields";
import { SolicitudFormErrors, SolicitudFormState } from "./types";

type SharedStepProps = {
  form: SolicitudFormState;
  onFieldChange: <K extends keyof SolicitudFormState>(
    campo: K,
    valor: SolicitudFormState[K]
  ) => void;
};

type DocumentoChangeHandler = (documento: string, file: File | null) => void;

export const PasoDatosPersonales = ({
  form,
  errores,
  modoEdicion,
  puedeAvanzar,
  onFieldChange,
  onCancelar,
  onSiguiente,
}: SharedStepProps & {
  errores: SolicitudFormErrors;
  modoEdicion: boolean;
  puedeAvanzar: boolean;
  onCancelar: () => void;
  onSiguiente: () => void;
}) => (
  <div className="form-section-card">
    <h3>Datos del solicitante</h3>
    <p className="section-copy">
      Captura los datos principales para identificar y contactar al solicitante.
    </p>

    <InputField
      label="Nombre completo"
      value={form.nombre}
      onChange={(v) => onFieldChange("nombre", v)}
      helperText="Escribe nombre y apellidos."
      error={errores.nombre}
    />
    <InputField
      label="Telefono"
      value={form.telefono}
      onChange={(v) => onFieldChange("telefono", v)}
      helperText="Debe incluir 10 digitos para poder contactarte."
      error={errores.telefono}
      type="tel"
      inputmode="tel"
    />
    <InputField
      label="Direccion"
      value={form.direccion}
      onChange={(v) => onFieldChange("direccion", v)}
      helperText="Incluye calle, numero, colonia y referencias si aplica."
      error={errores.direccion}
    />

    <div className="form-actions">
      <IonButton fill="outline" color="medium" onClick={onCancelar}>
        {modoEdicion ? "Cancelar edicion" : "Cancelar"}
      </IonButton>
      <IonButton onClick={onSiguiente} disabled={!puedeAvanzar}>
        Siguiente
      </IonButton>
    </div>
  </div>
);

export const PasoSocioeconomico = ({
  form,
  errores,
  puedeAvanzar,
  onFieldChange,
  onAtras,
  onSiguiente,
}: SharedStepProps & {
  errores: SolicitudFormErrors;
  puedeAvanzar: boolean;
  onAtras: () => void;
  onSiguiente: () => void;
}) => (
  <div className="form-section-card">
    <h3>Estudio socioeconomico breve</h3>
    <p className="section-copy">
      Responde estas preguntas cerradas para conocer mejor la situacion del hogar.
    </p>

    <SelectField
      label="Ingreso mensual del hogar"
      value={form.ingresoHogar}
      onChange={(v) => onFieldChange("ingresoHogar", v)}
      options={OPCIONES_INGRESO}
      error={errores.ingresoHogar}
    />
    <SelectField
      label="Personas que dependen de ese ingreso"
      value={form.dependientes}
      onChange={(v) => onFieldChange("dependientes", v)}
      options={OPCIONES_DEPENDIENTES}
      error={errores.dependientes}
    />
    <SelectField
      label="Situacion laboral actual"
      value={form.situacionLaboral}
      onChange={(v) => onFieldChange("situacionLaboral", v)}
      options={OPCIONES_LABORALES}
      error={errores.situacionLaboral}
    />
    <SelectField
      label="Tipo de vivienda"
      value={form.tipoVivienda}
      onChange={(v) => onFieldChange("tipoVivienda", v)}
      options={OPCIONES_VIVIENDA}
      error={errores.tipoVivienda}
    />
    <SelectField
      label="Disponibilidad de servicios basicos"
      value={form.serviciosBasicos}
      onChange={(v) => onFieldChange("serviciosBasicos", v)}
      options={OPCIONES_SERVICIOS}
      error={errores.serviciosBasicos}
    />
    <SelectField
      label="Apoyo adicional"
      value={form.apoyoAdicional}
      onChange={(v) => onFieldChange("apoyoAdicional", v)}
      options={OPCIONES_APOYO}
      error={errores.apoyoAdicional}
    />

    <div className="form-actions two-columns">
      <IonButton fill="outline" onClick={onAtras}>
        Atras
      </IonButton>
      <IonButton onClick={onSiguiente} disabled={!puedeAvanzar}>
        Siguiente
      </IonButton>
    </div>
  </div>
);

export const PasoDescripcion = ({
  form,
  errores,
  requiereEvidenciaSolicitud,
  puedeAvanzar,
  onFieldChange,
  onDocumentoChange,
  onAtras,
  onSiguiente,
}: SharedStepProps & {
  errores: SolicitudFormErrors;
  requiereEvidenciaSolicitud: boolean;
  puedeAvanzar: boolean;
  onDocumentoChange: DocumentoChangeHandler;
  onAtras: () => void;
  onSiguiente: () => void;
}) => (
  <div className="form-section-card">
    <h3>Descripcion de la solicitud</h3>
    <p className="section-copy">Explica en pocas palabras que apoyo necesitas y por que.</p>

    <InputField
      label="Motivo de la solicitud"
      value={form.mensaje}
      onChange={(v) => onFieldChange("mensaje", v)}
      helperText="Ejemplo: necesito una andadera porque tengo dificultad para caminar."
      error={errores.mensaje}
      multiline
      rows={3}
    />

    {requiereEvidenciaSolicitud ? (
      <div className="evidencia-solicitud">
        <h4>Evidencia de la solicitud</h4>
        <p>
          Adjunta una foto, receta, indicacion, diagnostico o archivo que ayude a
          verificar tu caso. Este archivo sustituye al documento medico separado.
        </p>
        <FileUpload
          label={DOCUMENTO_EVIDENCIA_SOLICITUD}
          file={form.documentos[DOCUMENTO_EVIDENCIA_SOLICITUD] || null}
          setFile={(f) => onDocumentoChange(DOCUMENTO_EVIDENCIA_SOLICITUD, f)}
          accept="application/pdf,image/*"
          helperText="Acepta foto o PDF legible."
          error={errores[DOCUMENTO_EVIDENCIA_SOLICITUD]}
        />
        <FileUpload
          label={DOCUMENTO_EVIDENCIA_ADICIONAL}
          file={form.documentos[DOCUMENTO_EVIDENCIA_ADICIONAL] || null}
          setFile={(f) => onDocumentoChange(DOCUMENTO_EVIDENCIA_ADICIONAL, f)}
          accept="application/pdf,image/*"
          helperText="Opcional: puedes anexar otro documento medico o foto del dispositivo de asistencia."
        />
      </div>
    ) : null}

    <div className="form-actions two-columns">
      <IonButton fill="outline" onClick={onAtras}>
        Atras
      </IonButton>
      <IonButton onClick={onSiguiente} disabled={!puedeAvanzar}>
        Siguiente
      </IonButton>
    </div>
  </div>
);

export const PasoDocumentos = ({
  form,
  errores,
  documentosRequeridos,
  modoEdicion,
  puedeAvanzar,
  onDocumentoChange,
  onAtras,
  onSiguiente,
}: {
  form: SolicitudFormState;
  errores: SolicitudFormErrors;
  documentosRequeridos: string[];
  modoEdicion: boolean;
  puedeAvanzar: boolean;
  onDocumentoChange: DocumentoChangeHandler;
  onAtras: () => void;
  onSiguiente: () => void;
}) => (
  <div className="form-section-card">
    <h3>Documentos requeridos</h3>
    <p className="section-copy">
      Adjunta solo los documentos solicitados para este apoyo.
      {modoEdicion ? " Al guardar, se reemplazaran los archivos anteriores por estos nuevos." : ""}
    </p>

    <div className="documentos-requeridos-lista">
      {documentosRequeridos.map((documento) => (
        <FileUpload
          key={documento}
          label={documento}
          file={form.documentos[documento] || null}
          setFile={(f) => onDocumentoChange(documento, f)}
          accept={obtenerAcceptDocumento(documento)}
          helperText={obtenerHelperDocumento(documento)}
          error={errores[documento]}
        />
      ))}
    </div>

    {documentosRequeridos.some((documento) => documento.toLowerCase().includes("curp")) ? (
      <p className="doc-extra-note">
        Si no cuentas con CURP, puedes tramitarla en el portal oficial:{" "}
        <a href="https://www.gob.mx/curp/" target="_blank" rel="noreferrer">
          gob.mx/curp
        </a>
      </p>
    ) : null}

    <div className="form-actions two-columns">
      <IonButton fill="outline" onClick={onAtras}>
        Atras
      </IonButton>
      <IonButton onClick={onSiguiente} disabled={!puedeAvanzar}>
        Revisar
      </IonButton>
    </div>
  </div>
);

export const PasoRevision = ({
  form,
  apoyoSeleccionado,
  documentosRequeridos,
  requiereEvidenciaSolicitud,
  submitError,
  loading,
  puedeEnviarSolicitud,
  onAtras,
  onEnviar,
}: {
  form: SolicitudFormState;
  apoyoSeleccionado?: ApoyoSeleccionadoPayload | null;
  documentosRequeridos: string[];
  requiereEvidenciaSolicitud: boolean;
  submitError: string;
  loading: boolean;
  puedeEnviarSolicitud: boolean;
  onAtras: () => void;
  onEnviar: () => void;
}) => (
  <div className="form-section-card">
    <h3>Revision final</h3>
    <p className="section-copy">Confirma tus datos antes de enviar la solicitud.</p>

    <div className="review-card">
      <p><strong>Nombre:</strong> {form.nombre}</p>
      <p><strong>Apoyo solicitado:</strong> {apoyoSeleccionado?.nombre || "No seleccionado"}</p>
      <p><strong>Telefono:</strong> {form.telefono}</p>
      <p><strong>Direccion:</strong> {form.direccion}</p>
      <p><strong>Ingreso del hogar:</strong> {form.ingresoHogar}</p>
      <p><strong>Dependientes:</strong> {form.dependientes}</p>
      <p><strong>Situacion laboral:</strong> {form.situacionLaboral}</p>
      <p><strong>Vivienda:</strong> {form.tipoVivienda}</p>
      <p><strong>Servicios basicos:</strong> {form.serviciosBasicos}</p>
      <p><strong>Apoyo adicional:</strong> {form.apoyoAdicional}</p>
      <p><strong>Motivo:</strong> {form.mensaje}</p>
      {requiereEvidenciaSolicitud ? (
        <>
          <p>
            <strong>{DOCUMENTO_EVIDENCIA_SOLICITUD}:</strong>{" "}
            {form.documentos[DOCUMENTO_EVIDENCIA_SOLICITUD]?.name || "No cargado"}
          </p>
          <p>
            <strong>{DOCUMENTO_EVIDENCIA_ADICIONAL}:</strong>{" "}
            {form.documentos[DOCUMENTO_EVIDENCIA_ADICIONAL]?.name || "No cargado"}
          </p>
        </>
      ) : null}
      {documentosRequeridos.map((documento) => (
        <p key={documento}>
          <strong>{documento}:</strong> {form.documentos[documento]?.name || "No cargado"}
        </p>
      ))}
    </div>

    {submitError ? <p className="form-warning">{submitError}</p> : null}

    <div className="form-actions two-columns">
      <IonButton fill="outline" onClick={onAtras}>
        Atras
      </IonButton>
      <IonButton expand="block" onClick={onEnviar} disabled={loading || !puedeEnviarSolicitud}>
        {loading ? "Enviando..." : "Enviar solicitud"}
      </IonButton>
    </div>
  </div>
);
