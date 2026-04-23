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

  const enviar = async (form: any, apoyoSeleccionado?: ApoyoSeleccionadoPayload | null) => {

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

      const payloadBase = {
        usuario_id: user.id,
        nombre: form.nombre,
        telefono: form.telefono,
        direccion: form.direccion,
        mensaje: form.mensaje,
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

      const insercionConApoyo = await supabase
        .from("solicitudes")
        .insert(payloadConApoyo)
        .select()
        .single();

      solicitud = insercionConApoyo.data;
      solicitudError = insercionConApoyo.error;

      if (solicitudError && faltaColumnaApoyo(solicitudError.message)) {
        const insercionLegacy = await supabase
          .from("solicitudes")
          .insert(payloadBase)
          .select()
          .single();

        solicitud = insercionLegacy.data;
        solicitudError = insercionLegacy.error;
      }

      if (solicitudError) {
        throw solicitudError;
      }

      if (!solicitud) {
        throw new Error("No se pudo crear la solicitud");
      }

      const urls = await Promise.all([
        subirArchivo(form.ine, "ine"),
        subirArchivo(form.curp, "curp"),
        subirArchivo(form.comprobante, "comprobante"),
        subirArchivo(form.foto, "foto"),
      ]);

      if (urls.some((url) => !url)) {
        throw new Error("No se pudieron subir todos los documentos");
      }

      const { error: documentosError } = await supabase.from("documentos").insert([
        { solicitud_id: solicitud.id, url: urls[0], tipo_documento: "ine" },
        { solicitud_id: solicitud.id, url: urls[1], tipo_documento: "curp" },
        { solicitud_id: solicitud.id, url: urls[2], tipo_documento: "comprobante" },
        { solicitud_id: solicitud.id, url: urls[3], tipo_documento: "foto" }
      ]);

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
