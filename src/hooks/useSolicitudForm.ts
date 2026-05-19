import { useState } from "react";
import { ApoyoSeleccionadoPayload } from "../services/apoyosService";
import { supabase } from "../services/supabaseClient";

export const useSolicitudForm = () => {

  const [loading, setLoading] = useState(false);

  const subirArchivo = async (file: File, carpeta: string) => {

    if (!file) return null;

    const nombreArchivo = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("documentos")
      .upload(`${carpeta}/${nombreArchivo}`, file);

    if (error) return null;

    const { data } = supabase.storage
      .from("documentos")
      .getPublicUrl(`${carpeta}/${nombreArchivo}`);

    return data.publicUrl;
  };

  const eliminarArchivoSiExiste = async (url?: string | null) => {
    const ruta = obtenerRutaStorage(url);

    if (!ruta) return;

    await supabase.storage.from("documentos").remove([ruta]);
  };

  const enviar = async (
    form: any,
    apoyoSeleccionado?: ApoyoSeleccionadoPayload | null,
    solicitudId?: string | null,
    documentosActuales?: Array<{ id?: string; url: string; tipo_documento: string }>
  ) => {

    setLoading(true);

    try {

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("municipio_id, comunidad_id")
        .eq("user_id", user.id)
        .single();

      if (!perfil) {
        throw new Error("No se encontro el perfil del usuario");
      }

      if (!apoyoSeleccionado?.id || !apoyoSeleccionado?.nombre) {
        throw new Error("No se encontro el apoyo seleccionado para esta solicitud");
      }

      const payloadBase = {
        usuario_id: user.id,
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
        mensaje: construirMensajeCompleto(form),
        municipio_id: perfil.municipio_id,
        comunidad_id: perfil.comunidad_id,
      };

      const payloadConApoyo = {
        ...payloadBase,
        apoyo_id: apoyoSeleccionado?.id || null,
        apoyo_nombre: apoyoSeleccionado?.nombre || null,
      };

      let solicitudError = null;
      let solicitud = null;

      if (solicitudId) {
        const actualizacionConApoyo = await supabase
          .from("solicitudes")
          .update(payloadConApoyo)
          .eq("id", solicitudId)
          .eq("usuario_id", user.id)
          .eq("estado", "pendiente")
          .select()
          .single();

        solicitud = actualizacionConApoyo.data;
        solicitudError = actualizacionConApoyo.error;

      } else {
        const insercionConApoyo = await supabase
          .from("solicitudes")
          .insert(payloadConApoyo)
          .select()
          .single();

        solicitud = insercionConApoyo.data;
        solicitudError = insercionConApoyo.error;

      }

      if (solicitudError) {
        if (faltaColumnaApoyo(solicitudError.message)) {
          throw new Error("Faltan las columnas apoyo_id y apoyo_nombre en la tabla solicitudes");
        }

        throw solicitudError;
      }

      if (!solicitud) {
        throw new Error("No se pudo crear la solicitud");
      }

      const documentos = Object.entries(form.documentos || {}).filter(([, file]) => Boolean(file));

      if (documentos.length === 0) {
        throw new Error("No se adjuntaron documentos");
      }

      if (solicitudId) {
        await Promise.all((documentosActuales || []).map((documento) => eliminarArchivoSiExiste(documento.url)));

        const { error: deleteDocsError } = await supabase
          .from("documentos")
          .delete()
          .eq("solicitud_id", solicitudId);

        if (deleteDocsError) {
          throw deleteDocsError;
        }
      }

      const documentosSubidos = await Promise.all(
        documentos.map(async ([tipoDocumento, file]) => {
          const carpeta = normalizarNombreDocumento(tipoDocumento);
          const url = await subirArchivo(file as File, carpeta);

          if (!url) {
            throw new Error(`No se pudo subir el documento ${tipoDocumento}`);
          }

          return {
            solicitud_id: solicitud.id,
            url,
            tipo_documento: tipoDocumento,
          };
        })
      );

      const { error: documentosError } = await supabase.from("documentos").insert(documentosSubidos);

      if (documentosError) {
        throw documentosError;
      }

      return true;

    } catch (err) {
      console.log(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { enviar, loading };
};

const faltaColumnaApoyo = (message?: string) => {
  const texto = (message || "").toLowerCase();
  return texto.includes("apoyo_id") || texto.includes("apoyo_nombre");
};

const construirMensajeCompleto = (form: any) => {
  const resumen = [
    "Resumen socioeconomico:",
    `Ingreso del hogar: ${form.ingresoHogar || "No especificado"}`,
    `Dependientes: ${form.dependientes || "No especificado"}`,
    `Situacion laboral: ${form.situacionLaboral || "No especificada"}`,
    `Tipo de vivienda: ${form.tipoVivienda || "No especificado"}`,
    `Servicios basicos: ${form.serviciosBasicos || "No especificado"}`,
    `Apoyo adicional: ${form.apoyoAdicional || "No especificado"}`,
  ].join("\n");

  return `${form.mensaje}\n\n${resumen}`.trim();
};

const normalizarNombreDocumento = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "documento";

const obtenerRutaStorage = (url?: string | null) => {
  if (!url) return null;

  const marcador = "/storage/v1/object/public/documentos/";
  const indice = url.indexOf(marcador);

  if (indice === -1) return null;

  return url.slice(indice + marcador.length);
};
