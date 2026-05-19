import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

type Documento = {
  id?: string;
  url: string;
  tipo_documento: string;
};

export type Solicitud = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  mensaje: string | null;
  comentario_admin: string | null;
  estado: string | null;
  created_at: string;
  apoyo_id?: string | null;
  apoyo_nombre?: string | null;
  documentos: Documento[];
};

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const cargarSolicitudes = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSolicitudes([]);
      setLoading(false);
      return;
    }

    let data = null;
    let error = null;

    const consultaConApoyo = await supabase
      .from("solicitudes")
      .select(`
        id,
        nombre,
        telefono,
        direccion,
        mensaje,
        comentario_admin,
        estado,
        created_at,
        apoyo_id,
        apoyo_nombre
      `)
      .eq("usuario_id", user.id)
      .order("created_at", { ascending: false });

    data = consultaConApoyo.data;
    error = consultaConApoyo.error;

    if (error && faltaColumnaApoyo(error.message)) {
      const consultaLegacy = await supabase
        .from("solicitudes")
        .select(`
          id,
          nombre,
          telefono,
          direccion,
          mensaje,
          comentario_admin,
          estado,
          created_at
        `)
        .eq("usuario_id", user.id)
        .order("created_at", { ascending: false });

      data = consultaLegacy.data;
      error = consultaLegacy.error;
    }

    if (error || !data) {
      setSolicitudes([]);
      setLoading(false);
      return;
    }

    const solicitudIds = data.map((solicitud) => solicitud.id);

    if (solicitudIds.length === 0) {
      setSolicitudes([]);
      setLoading(false);
      return;
    }

    const { data: documentosData, error: documentosError } = await supabase
      .from("documentos")
      .select("id, solicitud_id, url, tipo_documento")
      .in("solicitud_id", solicitudIds);

    if (documentosError) {
      console.log(documentosError);
    }

    const documentosPorSolicitud = (documentosData || []).reduce<Record<string, Documento[]>>(
      (acc, documento) => {
        if (!acc[documento.solicitud_id]) {
          acc[documento.solicitud_id] = [];
        }

        acc[documento.solicitud_id].push({
          id: documento.id,
          url: documento.url,
          tipo_documento: documento.tipo_documento,
        });

        return acc;
      },
      {}
    );

    const normalizadas = data.map((solicitud) => ({
      ...solicitud,
      documentos: documentosPorSolicitud[solicitud.id] || [],
    }));

    setSolicitudes(normalizadas);

    setLoading(false);
  };

  const cancelarSolicitud = async (solicitudId: string) => {
    try {
      setUpdatingId(solicitudId);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("No se encontro la sesion del usuario.");
      }

      const { error } = await supabase
        .from("solicitudes")
        .update({ estado: "cancelada" })
        .eq("id", solicitudId)
        .eq("usuario_id", user.id)
        .eq("estado", "pendiente");

      if (error) {
        throw error;
      }

      await cargarSolicitudes();
      return { ok: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cancelar la solicitud.";
      return { ok: false, error: message };
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  return { solicitudes, loading, updatingId, cargarSolicitudes, cancelarSolicitud };
};

const faltaColumnaApoyo = (message?: string) => {
  const texto = (message || "").toLowerCase();
  return texto.includes("apoyo_id") || texto.includes("apoyo_nombre");
};
