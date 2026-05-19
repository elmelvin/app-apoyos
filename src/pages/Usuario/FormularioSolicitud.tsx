import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonProgressBar,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { chevronBackOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  DOCUMENTO_EVIDENCIA_SOLICITUD,
  DOCUMENTOS_POR_DEFECTO,
  initialSolicitudFormState,
  PASOS_SOLICITUD,
} from "../../components/solicitud-form/constants";
import {
  PasoDatosPersonales,
  PasoDescripcion,
  PasoDocumentos,
  PasoRevision,
  PasoSocioeconomico,
} from "../../components/solicitud-form/SolicitudFormSteps";
import { SolicitudFormState } from "../../components/solicitud-form/types";
import {
  descomponerMensajeCompleto,
  esApoyoMedicoODiscapacidad,
  quitarDocumentosMedicos,
} from "../../components/solicitud-form/utils";
import { Solicitud } from "../../hooks/useSolicitudes";
import { useSolicitudForm } from "../../hooks/useSolicitudForm";
import { ApoyoSeleccionadoPayload } from "../../services/apoyosService";
import { supabase } from "../../services/supabaseClient";
import {
  leerApoyoSeleccionado,
  limpiarApoyoSeleccionado,
} from "../../utils/apoyoSeleccionadoStorage";
import "./FormularioSolicitud.css";

type FormularioLocationState = {
  apoyoSeleccionado?: ApoyoSeleccionadoPayload;
  solicitudEditar?: Solicitud;
};

const FormularioSolicitud: React.FC = () => {
  const history = useHistory();
  const location = useLocation<FormularioLocationState>();
  const { enviar, loading } = useSolicitudForm();
  const [form, setForm] = useState<SolicitudFormState>(initialSolicitudFormState);
  const [paso, setPaso] = useState(1);
  const [submitError, setSubmitError] = useState("");
  const [loadingPrefill, setLoadingPrefill] = useState(true);
  const [prefillMessage, setPrefillMessage] = useState("");
  const solicitudEditar = location.state?.solicitudEditar || null;
  const modoEdicion = Boolean(solicitudEditar?.id);
  const rutaSalida = modoEdicion ? "/usuario/solicitudes" : "/usuario/apoyos";
  const apoyoSeleccionado = useMemo(() => {
    if (location.state?.apoyoSeleccionado) {
      return location.state.apoyoSeleccionado;
    }

    if (solicitudEditar?.apoyo_id && solicitudEditar?.apoyo_nombre) {
      return {
        id: solicitudEditar.apoyo_id,
        nombre: solicitudEditar.apoyo_nombre,
      };
    }

    return leerApoyoSeleccionado();
  }, [location.state, solicitudEditar]);
  const requiereEvidenciaSolicitud = useMemo(
    () => esApoyoMedicoODiscapacidad(apoyoSeleccionado),
    [apoyoSeleccionado]
  );
  const documentosRequeridos = useMemo(
    () => {
      const requisitosBase = apoyoSeleccionado?.requisitos?.length
        ? apoyoSeleccionado.requisitos
        : solicitudEditar?.documentos?.length
        ? solicitudEditar.documentos.map((documento) => documento.tipo_documento)
        : DOCUMENTOS_POR_DEFECTO;

      const requisitosSinDuplicados = requiereEvidenciaSolicitud
        ? quitarDocumentosMedicos(requisitosBase)
        : requisitosBase;

      return requisitosSinDuplicados.map((documento) => documento.trim()).filter(Boolean);
    },
    [apoyoSeleccionado, requiereEvidenciaSolicitud, solicitudEditar]
  );

  const handleChange = <K extends keyof SolicitudFormState>(
    campo: K,
    valor: SolicitudFormState[K]
  ) => {
    setForm((actual) => ({ ...actual, [campo]: valor }));
  };

  const handleDocumentoChange = (documento: string, file: File | null) => {
    setForm((actual) => ({
      ...actual,
      documentos: {
        ...actual.documentos,
        [documento]: file,
      },
    }));
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setLoadingPrefill(true);

      if (solicitudEditar) {
        const datosSolicitud = descomponerMensajeCompleto(solicitudEditar.mensaje || "");

        setForm((actual) => ({
          ...actual,
          nombre: solicitudEditar.nombre || actual.nombre,
          telefono: solicitudEditar.telefono || "",
          direccion: solicitudEditar.direccion || "",
          ingresoHogar: datosSolicitud.ingresoHogar,
          dependientes: datosSolicitud.dependientes,
          situacionLaboral: datosSolicitud.situacionLaboral,
          tipoVivienda: datosSolicitud.tipoVivienda,
          serviciosBasicos: datosSolicitud.serviciosBasicos,
          apoyoAdicional: datosSolicitud.apoyoAdicional,
          mensaje: datosSolicitud.mensaje,
        }));

        setPrefillMessage(
          "Precargamos tu solicitud pendiente para que puedas corregir los datos y volver a subir documentos."
        );
        setLoadingPrefill(false);
        return;
      }

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
          perfil?.telefono ||
          user.user_metadata?.telefono ||
          ultimaSolicitud?.telefono ||
          "";
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
  }, [solicitudEditar]);

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

    if (!form.ingresoHogar) errores.ingresoHogar = "Selecciona el ingreso del hogar.";
    if (!form.dependientes) errores.dependientes = "Selecciona cuantas personas dependen del ingreso.";
    if (!form.situacionLaboral) errores.situacionLaboral = "Selecciona la situacion laboral.";
    if (!form.tipoVivienda) errores.tipoVivienda = "Selecciona el tipo de vivienda.";
    if (!form.serviciosBasicos) errores.serviciosBasicos = "Selecciona la disponibilidad de servicios.";
    if (!form.apoyoAdicional) errores.apoyoAdicional = "Selecciona si recibe algun apoyo adicional.";

    return errores;
  }, [
    form.apoyoAdicional,
    form.dependientes,
    form.ingresoHogar,
    form.serviciosBasicos,
    form.situacionLaboral,
    form.tipoVivienda,
  ]);

  const erroresPaso3 = useMemo(() => {
    const errores: Record<string, string> = {};

    if (!form.mensaje.trim()) {
      errores.mensaje = "Describe la necesidad del apoyo.";
    } else if (form.mensaje.trim().length < 15) {
      errores.mensaje = "Agrega un poco mas de detalle para revisar la solicitud.";
    }

    if (requiereEvidenciaSolicitud && !form.documentos[DOCUMENTO_EVIDENCIA_SOLICITUD]) {
      errores[DOCUMENTO_EVIDENCIA_SOLICITUD] =
        "Adjunta una evidencia que ayude a verificar la solicitud.";
    }

    return errores;
  }, [form.documentos, form.mensaje, requiereEvidenciaSolicitud]);

  const erroresPaso4 = useMemo(() => {
    const errores: Record<string, string> = {};

    documentosRequeridos.forEach((documento) => {
      if (!form.documentos[documento]) {
        errores[documento] = `Adjunta ${documento.toLowerCase()}.`;
      }
    });

    return errores;
  }, [documentosRequeridos, form.documentos]);

  const puedeAvanzarPaso1 = Object.keys(erroresPaso1).length === 0;
  const puedeAvanzarPaso2 = Object.keys(erroresPaso2).length === 0;
  const puedeAvanzarPaso3 = Object.keys(erroresPaso3).length === 0;
  const puedeAvanzarPaso4 = Object.keys(erroresPaso4).length === 0;
  const formularioCompleto =
    puedeAvanzarPaso1 && puedeAvanzarPaso2 && puedeAvanzarPaso3 && puedeAvanzarPaso4;
  const puedeEnviarSolicitud = formularioCompleto && Boolean(apoyoSeleccionado?.id);

  const salirFormulario = () => {
    if (!modoEdicion) {
      limpiarApoyoSeleccionado();
    }

    history.replace(rutaSalida);
  };

  const enviarSolicitud = async () => {
    setSubmitError("");

    if (!apoyoSeleccionado?.id) {
      setSubmitError("Selecciona un apoyo antes de enviar la solicitud.");
      return;
    }

    if (!formularioCompleto) {
      setSubmitError("Completa todos los datos y documentos antes de enviar.");
      return;
    }

    const ok = await enviar(
      form,
      apoyoSeleccionado,
      solicitudEditar?.id,
      solicitudEditar?.documentos
    );

    if (ok) {
      setForm(initialSolicitudFormState);
      setPaso(1);
      setSubmitError("");
      limpiarApoyoSeleccionado();
      history.replace("/usuario/solicitudes", {
        feedback: {
          type: "success",
          title: modoEdicion ? "Solicitud actualizada" : "Solicitud enviada",
          message: modoEdicion
            ? "Guardamos los cambios y tus documentos quedaron listos para revision."
            : "Recibimos tu solicitud. Puedes consultar el avance desde este historial.",
        },
      });
    } else {
      setSubmitError(
        modoEdicion
          ? "No se pudo actualizar la solicitud. Verifica tus documentos e intenta de nuevo."
          : "No se pudo enviar la solicitud. Verifica tus documentos e intenta de nuevo."
      );
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton
              className="toolbar-back-button"
              fill="clear"
              color="medium"
              onClick={salirFormulario}
            >
              <IonIcon slot="start" icon={chevronBackOutline} />
              {modoEdicion ? "Cancelar" : "Volver"}
            </IonButton>
          </IonButtons>
          <IonTitle>Solicitud de Apoyo</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding formulario-page">
        <div className="formulario-shell">
          <div className="formulario-header-card">
            <div className="formulario-header-top">
              <div>
                <p className="pasos-texto">
                  {modoEdicion ? "Edicion de solicitud" : "Avance de la solicitud"}
                </p>
                <h2>{PASOS_SOLICITUD[paso - 1]}</h2>
              </div>
              <span className="pasos-actual">Paso {paso} de {PASOS_SOLICITUD.length}</span>
            </div>
            <IonProgressBar value={paso / PASOS_SOLICITUD.length} />
            <div className="stepper-modern">
              {PASOS_SOLICITUD.map((titulo, index) => (
                <div
                  key={titulo}
                  className={`step-item ${paso > index + 1 ? "complete" : ""} ${
                    paso === index + 1 ? "current" : ""
                  }`}
                  title={titulo}
                >
                  <div className="step-circle">{index + 1}</div>
                  <span className="step-label">{titulo}</span>
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
              <span>Apoyo seleccionado</span>
              <strong>{apoyoSeleccionado.nombre}</strong>
              {apoyoSeleccionado.descripcion ? <p>{apoyoSeleccionado.descripcion}</p> : null}
            </div>
          ) : (
            <div className="apoyo-seleccionado-card apoyo-seleccionado-card--warning">
              <span>Apoyo pendiente</span>
              <strong>No se detecto un apoyo seleccionado</strong>
              <p>Regresa al catalogo y elige el apoyo que quieres solicitar.</p>
            </div>
          )}

          {paso === 1 ? (
            <PasoDatosPersonales
              form={form}
              errores={erroresPaso1}
              modoEdicion={modoEdicion}
              puedeAvanzar={puedeAvanzarPaso1}
              onFieldChange={handleChange}
              onCancelar={salirFormulario}
              onSiguiente={() => setPaso(2)}
            />
          ) : null}

          {paso === 2 ? (
            <PasoSocioeconomico
              form={form}
              errores={erroresPaso2}
              puedeAvanzar={puedeAvanzarPaso2}
              onFieldChange={handleChange}
              onAtras={() => setPaso(1)}
              onSiguiente={() => setPaso(3)}
            />
          ) : null}

          {paso === 3 ? (
            <PasoDescripcion
              form={form}
              errores={erroresPaso3}
              requiereEvidenciaSolicitud={requiereEvidenciaSolicitud}
              puedeAvanzar={puedeAvanzarPaso3}
              onFieldChange={handleChange}
              onDocumentoChange={handleDocumentoChange}
              onAtras={() => setPaso(2)}
              onSiguiente={() => setPaso(4)}
            />
          ) : null}

          {paso === 4 ? (
            <PasoDocumentos
              form={form}
              errores={erroresPaso4}
              documentosRequeridos={documentosRequeridos}
              modoEdicion={modoEdicion}
              puedeAvanzar={puedeAvanzarPaso4}
              onDocumentoChange={handleDocumentoChange}
              onAtras={() => setPaso(3)}
              onSiguiente={() => setPaso(5)}
            />
          ) : null}

          {paso === 5 ? (
            <PasoRevision
              form={form}
              apoyoSeleccionado={apoyoSeleccionado}
              documentosRequeridos={documentosRequeridos}
              requiereEvidenciaSolicitud={requiereEvidenciaSolicitud}
              submitError={submitError}
              loading={loading}
              puedeEnviarSolicitud={puedeEnviarSolicitud}
              onAtras={() => setPaso(4)}
              onEnviar={enviarSolicitud}
            />
          ) : null}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default FormularioSolicitud;
