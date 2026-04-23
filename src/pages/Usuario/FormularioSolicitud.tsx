import {
  IonButton,
  IonContent,
  IonHeader,
  IonPage,
  IonProgressBar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import FileUpload from "../../components/form/FileUpload";
import InputField from "../../components/form/InputField";
import { useSolicitudForm } from "../../hooks/useSolicitudForm";
import { ApoyoSeleccionadoPayload } from "../../services/apoyosService";
import { supabase } from "../../services/supabaseClient";
import "./FormularioSolicitud.css";

type FormularioLocationState = {
  apoyoSeleccionado?: ApoyoSeleccionadoPayload;
};

type SolicitudFormState = {
  nombre: string;
  telefono: string;
  direccion: string;
  mensaje: string;
  ine: File | null;
  curp: File | null;
  comprobante: File | null;
  foto: File | null;
};

const initialFormState: SolicitudFormState = {
  nombre: "",
  telefono: "",
  direccion: "",
  mensaje: "",
  ine: null,
  curp: null,
  comprobante: null,
  foto: null,
};

const PASOS = [
  "Datos personales",
  "Descripcion",
  "Documentos",
  "Revision final",
];

const FormularioSolicitud: React.FC = () => {
  const location = useLocation<FormularioLocationState>();
  const { enviar, loading } = useSolicitudForm();
  const [form, setForm] = useState<SolicitudFormState>(initialFormState);
  const [paso, setPaso] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [loadingPrefill, setLoadingPrefill] = useState(true);
  const [prefillMessage, setPrefillMessage] = useState("");
  const apoyoSeleccionado = location.state?.apoyoSeleccionado || null;

  const handleChange = <K extends keyof SolicitudFormState>(
    campo: K,
    valor: SolicitudFormState[K]
  ) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoadingPrefill(true);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadingPrefill(false);
          return;
        }

        const { data: perfil } = await supabase
          .from("perfiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        const { data: ultimaSolicitud } = await supabase
          .from("solicitudes")
          .select("nombre, telefono, direccion")
          .eq("usuario_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const nombrePrefill =
          perfil?.nombre ||
          user.user_metadata?.nombre ||
          ultimaSolicitud?.nombre ||
          "";
        const telefonoPrefill =
          perfil?.telefono || ultimaSolicitud?.telefono || "";
        const direccionPrefill =
          perfil?.direccion || ultimaSolicitud?.direccion || "";

        setForm((actual) => ({
          ...actual,
          nombre: actual.nombre || nombrePrefill,
          telefono: actual.telefono || telefonoPrefill,
          direccion: actual.direccion || direccionPrefill,
        }));

        if (nombrePrefill || telefonoPrefill || direccionPrefill) {
          setPrefillMessage(
            "Precargamos tus datos disponibles para que completes la solicitud mas rapido."
          );
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingPrefill(false);
      }
    };

    cargarDatosIniciales();
  }, []);

  const erroresPaso1 = useMemo(() => {
    const errores: Record<string, string> = {};

    if (!form.nombre.trim()) {
      errores.nombre = "Ingresa el nombre completo.";
    }

    const telefonoLimpio = form.telefono.replace(/\D/g, "");
    if (!telefonoLimpio) {
      errores.telefono = "Ingresa un numero de telefono.";
    } else if (telefonoLimpio.length < 10) {
      errores.telefono = "El telefono debe tener al menos 10 digitos.";
    }

    if (!form.direccion.trim()) {
      errores.direccion = "Ingresa la direccion del solicitante.";
    }

    return errores;
  }, [form.direccion, form.nombre, form.telefono]);

  const erroresPaso2 = useMemo(() => {
    const errores: Record<string, string> = {};

    if (!form.mensaje.trim()) {
      errores.mensaje = "Describe la necesidad del apoyo.";
    } else if (form.mensaje.trim().length < 15) {
      errores.mensaje = "Agrega un poco mas de detalle para revisar la solicitud.";
    }

    return errores;
  }, [form.mensaje]);

  const erroresPaso3 = useMemo(() => {
    const errores: Record<string, string> = {};

    if (!form.ine) errores.ine = "Adjunta la identificacion oficial.";
    if (!form.curp) errores.curp = "Adjunta la CURP.";
    if (!form.comprobante) errores.comprobante = "Adjunta el comprobante de domicilio.";
    if (!form.foto) errores.foto = "Adjunta una foto de apoyo para la solicitud.";

    return errores;
  }, [form.comprobante, form.curp, form.foto, form.ine]);

  const puedeAvanzarPaso1 = Object.keys(erroresPaso1).length === 0;
  const puedeAvanzarPaso2 = Object.keys(erroresPaso2).length === 0;
  const puedeAvanzarPaso3 = Object.keys(erroresPaso3).length === 0;
  const formularioCompleto =
    puedeAvanzarPaso1 && puedeAvanzarPaso2 && puedeAvanzarPaso3;

  const enviarSolicitud = async () => {
    setSubmitError("");

    if (!formularioCompleto) {
      setSubmitError("Completa todos los datos y documentos antes de enviar.");
      return;
    }

    const ok = await enviar(form, apoyoSeleccionado);

    if (ok) {
      alert("Solicitud enviada correctamente");
      setForm(initialFormState);
      setPaso(1);
      setSubmitError("");
    } else {
      setSubmitError(
        "No se pudo enviar la solicitud. Verifica tus documentos e intenta de nuevo."
      );
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Solicitud de Apoyo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding formulario-page">
        <div className="formulario-shell">
          <div className="formulario-header-card">
            <p className="pasos-texto">
              Paso {paso} de {PASOS.length}: {PASOS[paso - 1]}
            </p>
            <IonProgressBar value={paso / PASOS.length} />
            <div className="stepper-modern">
              {PASOS.map((titulo, index) => (
                <div
                  key={titulo}
                  className={`step-item ${paso >= index + 1 ? "active" : ""}`}
                >
                  <div className="step-circle">{index + 1}</div>
                  <span>{titulo}</span>
                </div>
              ))}
            </div>
          </div>

          {loadingPrefill ? (
            <div className="prefill-banner">
              <IonSpinner name="crescent" />
              <span>Cargando tus datos guardados...</span>
            </div>
          ) : prefillMessage ? (
            <div className="prefill-banner prefill-success">
              <span>{prefillMessage}</span>
            </div>
          ) : null}

          {apoyoSeleccionado ? (
            <div className="apoyo-seleccionado-card">
              <p className="apoyo-seleccionado-card__eyebrow">Apoyo seleccionado</p>
              <h3>{apoyoSeleccionado.nombre}</h3>
              <p className="section-copy">
                {apoyoSeleccionado.descripcion ||
                  "Continua con tu solicitud para este apoyo."}
              </p>

              {apoyoSeleccionado.requisitos?.length ? (
                <div className="apoyo-seleccionado-card__requisitos">
                  <span>Documentos que te pediran</span>
                  <ul>
                    {apoyoSeleccionado.requisitos.map((requisito) => (
                      <li key={requisito}>{requisito}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {paso === 1 ? (
            <div className="form-section-card">
              <h3>Datos del solicitante</h3>
              <p className="section-copy">
                Captura los datos principales para identificar y contactar al solicitante.
              </p>

              <InputField
                label="Nombre completo"
                value={form.nombre}
                onChange={(v) => handleChange("nombre", v)}
                helperText="Escribe nombre y apellidos."
                error={erroresPaso1.nombre}
              />
              <InputField
                label="Telefono"
                value={form.telefono}
                onChange={(v) => handleChange("telefono", v)}
                helperText="Debe incluir 10 digitos para poder contactarte."
                error={erroresPaso1.telefono}
                type="tel"
                inputmode="tel"
              />
              <InputField
                label="Direccion"
                value={form.direccion}
                onChange={(v) => handleChange("direccion", v)}
                helperText="Incluye calle, numero, colonia y referencias si aplica."
                error={erroresPaso1.direccion}
              />

              <div className="form-actions">
                <IonButton
                  expand="block"
                  onClick={() => setPaso(2)}
                  disabled={!puedeAvanzarPaso1}
                >
                  Siguiente
                </IonButton>
              </div>
            </div>
          ) : null}

          {paso === 2 ? (
            <div className="form-section-card">
              <h3>Descripcion de la solicitud</h3>
              <p className="section-copy">
                Explica en pocas palabras que apoyo necesitas y por que.
              </p>

              {apoyoSeleccionado ? (
                <p className="context-helper">
                  Estas solicitando: <strong>{apoyoSeleccionado.nombre}</strong>
                </p>
              ) : null}

              <InputField
                label="Motivo de la solicitud"
                value={form.mensaje}
                onChange={(v) => handleChange("mensaje", v)}
                helperText="Ejemplo: necesito una andadera porque tengo dificultad para caminar."
                error={erroresPaso2.mensaje}
              />

              <div className="form-actions two-columns">
                <IonButton fill="outline" onClick={() => setPaso(1)}>
                  Atras
                </IonButton>
                <IonButton
                  onClick={() => setPaso(3)}
                  disabled={!puedeAvanzarPaso2}
                >
                  Siguiente
                </IonButton>
              </div>
            </div>
          ) : null}

          {paso === 3 ? (
            <div className="form-section-card">
              <h3>Documentos requeridos</h3>
              <p className="section-copy">
                Adjunta los archivos para validar tu solicitud. PDF para documentos y foto en imagen.
              </p>

              <FileUpload
                label="INE"
                file={form.ine}
                setFile={(f) => handleChange("ine", f)}
                helperText="PDF o imagen legible."
                error={erroresPaso3.ine}
              />
              <FileUpload
                label="CURP"
                file={form.curp}
                setFile={(f) => handleChange("curp", f)}
                helperText="PDF o imagen legible."
                error={erroresPaso3.curp}
              />
              <p className="doc-extra-note">
                Si no cuentas con CURP, puedes tramitarla en el portal oficial:{" "}
                <a
                  href="https://www.gob.mx/curp/"
                  target="_blank"
                  rel="noreferrer"
                >
                  gob.mx/curp
                </a>
              </p>
              <FileUpload
                label="Comprobante de domicilio"
                file={form.comprobante}
                setFile={(f) => handleChange("comprobante", f)}
                helperText="Recibo reciente o constancia."
                error={erroresPaso3.comprobante}
              />
              <FileUpload
                label="Foto de apoyo"
                file={form.foto}
                setFile={(f) => handleChange("foto", f)}
                accept="image/*"
                helperText="Sube una foto clara relacionada con la solicitud."
                error={erroresPaso3.foto}
              />

              <div className="form-actions two-columns">
                <IonButton fill="outline" onClick={() => setPaso(2)}>
                  Atras
                </IonButton>
                <IonButton
                  onClick={() => setPaso(4)}
                  disabled={!puedeAvanzarPaso3}
                >
                  Revisar
                </IonButton>
              </div>
            </div>
          ) : null}

          {paso === 4 ? (
            <div className="form-section-card">
              <h3>Revision final</h3>
              <p className="section-copy">
                Confirma tus datos antes de enviar la solicitud.
              </p>

              <div className="review-card">
                {apoyoSeleccionado ? (
                  <p><strong>Apoyo:</strong> {apoyoSeleccionado.nombre}</p>
                ) : null}
                <p><strong>Nombre:</strong> {form.nombre}</p>
                <p><strong>Telefono:</strong> {form.telefono}</p>
                <p><strong>Direccion:</strong> {form.direccion}</p>
                <p><strong>Motivo:</strong> {form.mensaje}</p>
                <p><strong>INE:</strong> {form.ine?.name || "No cargado"}</p>
                <p><strong>CURP:</strong> {form.curp?.name || "No cargado"}</p>
                <p>
                  <strong>Comprobante:</strong> {form.comprobante?.name || "No cargado"}
                </p>
                <p><strong>Foto:</strong> {form.foto?.name || "No cargada"}</p>
              </div>

              {submitError ? <p className="form-warning">{submitError}</p> : null}

              <div className="form-actions two-columns">
                <IonButton fill="outline" onClick={() => setPaso(3)}>
                  Atras
                </IonButton>

                <IonButton
                  expand="block"
                  onClick={enviarSolicitud}
                  disabled={loading || !formularioCompleto}
                >
                  {loading ? "Enviando..." : "Enviar solicitud"}
                </IonButton>
              </div>
            </div>
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FormularioSolicitud;
