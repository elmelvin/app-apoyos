import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

type Documento = {
  url: string;
  tipo_documento: string;
};

type Solicitud = {
  id: string;
  nombre: string;
  telefono: string | null;
  direccion: string | null;
  mensaje: string | null;
  estado: string | null;
  created_at: string;
  apoyo_id?: string | null;
  apoyo_nombre?: string | null;
  documentos: Documento[];
};

export const useSolicitudes = () => {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);

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
      .select("solicitud_id, url, tipo_documento")
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

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  return { solicitudes, loading, cargarSolicitudes };
};

const faltaColumnaApoyo = (message?: string) => {
  const texto = (message || "").toLowerCase();
  return texto.includes("apoyo_id") || texto.includes("apoyo_nombre");
};
