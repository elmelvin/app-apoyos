import { useCallback, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { getFriendlyDatabaseErrorMessage } from "../utils/errors";

export type Documento = {
  url: string;
  tipo_documento: string;
};

export type SolicitudAdmin = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  mensaje: string | null;
  comentario_admin: string | null;
  estado: string | null;
  created_at: string;
  usuario_id: string;
  apoyo_id?: string | null;
  apoyo_nombre?: string | null;
  municipio_id?: string | null;
  comunidad_id?: string | null;
  municipio: string | null;
  comunidad: string | null;
  documentos: Documento[];
};

const ESTADO_INICIAL = "pendiente";

type ActualizarEstadoResultado = {
  ok: boolean;
  error?: string;
};

export const useAdminSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const cargarSolicitudes = useCallback(async (options?: { force?: boolean }) => {
    const force = options?.force ?? false;

    if (!force && solicitudes.length > 0) {
      return;
    }

    setLoading(true);

    let data = null;
    let error = null;

    const consultaConApoyo = await supabase
      .from("solicitudes")
      .select(`
        id,
        usuario_id,
        nombre,
        telefono,
        direccion,
        mensaje,
        comentario_admin,
        estado,
        created_at,
        apoyo_id,
        apoyo_nombre,
        municipio_id,
        comunidad_id,
        documentos(url, tipo_documento),
        municipios:municipio_id(nombre),
        comunidades:comunidad_id(nombre)
      `)
      .order("created_at", { ascending: false });

    data = consultaConApoyo.data;
    error = consultaConApoyo.error;

    if (error && faltaColumnaApoyo(error.message)) {
      const consultaLegacy = await supabase
        .from("solicitudes")
        .select(`
          id,
          usuario_id,
          nombre,
          telefono,
          direccion,
          mensaje,
          comentario_admin,
          estado,
          created_at,
          municipio_id,
          comunidad_id,
          documentos(url, tipo_documento),
          municipios:municipio_id(nombre),
          comunidades:comunidad_id(nombre)
        `)
        .order("created_at", { ascending: false });

      data = consultaLegacy.data;
      error = consultaLegacy.error;
    }

    if (error || !data) {
      console.log(error);
      setSolicitudes([]);
      setLoading(false);
      return;
    }

    const solicitudesBase = data as SolicitudAdminRaw[];
    const solicitudesSinUbicacion = solicitudesBase.filter(
      (solicitud) => !obtenerNombreRelacion(solicitud.municipios) || !obtenerNombreRelacion(solicitud.comunidades)
    );
    const usuarioIds = [
      ...new Set(solicitudesSinUbicacion.map((solicitud) => solicitud.usuario_id)),
    ];

    const { data: perfilesData, error: perfilesError } = usuarioIds.length
      ? await supabase
          .from("perfiles")
          .select("user_id, municipios(nombre), comunidades(nombre)")
          .in("user_id", usuarioIds)
      : { data: [], error: null };

    if (perfilesError) {
      console.log(perfilesError);
    }

    const ubicacionPorUsuario = (perfilesData || []).reduce<
      Record<string, { municipio: string | null; comunidad: string | null }>
    >((acc, perfil) => {
        acc[perfil.user_id] = {
          municipio: obtenerNombreRelacion(perfil.municipios),
          comunidad: obtenerNombreRelacion(perfil.comunidades),
        };
        return acc;
      },
      {}
    );

    setSolicitudes(
      solicitudesBase.map((solicitud) => ({
        ...solicitud,
        estado: solicitud.estado || ESTADO_INICIAL,
        municipio: obtenerNombreRelacion(solicitud.municipios) ||
          ubicacionPorUsuario[solicitud.usuario_id]?.municipio ||
          null,
        comunidad: obtenerNombreRelacion(solicitud.comunidades) ||
          ubicacionPorUsuario[solicitud.usuario_id]?.comunidad ||
          null,
        documentos: normalizarDocumentos(solicitud.documentos),
      }))
    );

    setLoading(false);
  }, [solicitudes.length]);

  const actualizarEstado = useCallback(async (
    solicitudId: string,
    estado: string
  ): Promise<ActualizarEstadoResultado> => {
    setUpdatingId(solicitudId);

    const { error } = await supabase
      .from("solicitudes")
      .update({ estado })
      .eq("id", solicitudId);

    if (error) {
      console.log(error);
      setUpdatingId(null);
      return {
        ok: false,
        error: getFriendlyDatabaseErrorMessage(
          error,
          "No se pudo actualizar el estado de la solicitud."
        ),
      };
    }

    setSolicitudes((actuales) =>
      actuales.map((solicitud) =>
        solicitud.id === solicitudId ? { ...solicitud, estado } : solicitud
      )
    );

    const { error: pushError } = await supabase.functions.invoke("send-push", {
      body: {
        solicitudId,
        estado,
      },
    });

    if (pushError) {
      console.log("No se pudo enviar la notificacion push.", pushError.message);
    }

    setUpdatingId(null);
    return { ok: true };
  }, []);

  const actualizarComentario = useCallback(async (
    solicitudId: string,
    comentario: string
  ): Promise<ActualizarEstadoResultado> => {
    setUpdatingId(solicitudId);

    const comentarioNormalizado = comentario.trim() || null;
    const { error } = await supabase
      .from("solicitudes")
      .update({ comentario_admin: comentarioNormalizado })
      .eq("id", solicitudId);

    if (error) {
      console.log(error);
      setUpdatingId(null);
      return {
        ok: false,
        error: getFriendlyDatabaseErrorMessage(
          error,
          "No se pudo guardar el comentario de la solicitud."
        ),
      };
    }

    setSolicitudes((actuales) =>
      actuales.map((solicitud) =>
        solicitud.id === solicitudId
          ? { ...solicitud, comentario_admin: comentarioNormalizado }
          : solicitud
      )
    );

    setUpdatingId(null);
    return { ok: true };
  }, []);

  useEffect(() => {
    cargarSolicitudes();
  }, [cargarSolicitudes]);

  return {
    solicitudes,
    loading,
    updatingId,
    cargarSolicitudes,
    actualizarEstado,
    actualizarComentario,
  };
};

type RelacionNombre =
  | {
      nombre?: string | null;
    }
  | Array<{
      nombre?: string | null;
    }>
  | undefined
  | null;

const obtenerNombreRelacion = (relacion: RelacionNombre) => {
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre || null;
  }

  return relacion?.nombre || null;
};

type SolicitudAdminRaw = Omit<SolicitudAdmin, "municipio" | "comunidad" | "documentos"> & {
  documentos?: Documento[] | null;
  municipios?: RelacionNombre;
  comunidades?: RelacionNombre;
};

const normalizarDocumentos = (documentos?: Documento[] | null) =>
  Array.isArray(documentos) ? documentos : [];

const faltaColumnaApoyo = (message?: string) => {
  const texto = (message || "").toLowerCase();
  return texto.includes("apoyo_id") || texto.includes("apoyo_nombre");
};
