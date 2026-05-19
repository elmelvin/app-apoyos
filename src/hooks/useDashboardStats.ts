import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export interface DashboardSolicitudReciente {
  id: string;
  nombre: string;
  telefono: string | null;
  estado: string | null;
  created_at: string;
  apoyo_nombre?: string | null;
  municipio_id?: string | null;
  comunidad_id?: string | null;
  municipio: string | null;
  comunidad: string | null;
}

export interface DashboardTimelinePoint {
  day: string;
  total: number;
  pendientes: number;
  aprobados: number;
  rechazados: number;
}

export const useDashboardStats = () => {
  const [total, setTotal] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [aprobados, setAprobados] = useState(0);
  const [rechazados, setRechazados] = useState(0);

  const [recientes, setRecientes] = useState<DashboardSolicitudReciente[]>([]);
  const [solicitudes, setSolicitudes] = useState<DashboardSolicitudReciente[]>([]);
  const [timeline, setTimeline] = useState<DashboardTimelinePoint[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarStats = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("solicitudes")
      .select(`
        id,
        nombre,
        telefono,
        estado,
        created_at,
        apoyo_nombre,
        municipio_id,
        comunidad_id,
        municipios:municipio_id(nombre),
        comunidades:comunidad_id(nombre)
      `)
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.log(error);
      setTotal(0);
      setPendientes(0);
      setAprobados(0);
      setRechazados(0);
      setRecientes([]);
      setSolicitudes([]);
      setTimeline([]);
      setLoading(false);
      return;
    }

    const normalizadas = (data as DashboardSolicitudRaw[]).map((solicitud) => ({
      ...solicitud,
      estado: solicitud.estado || "pendiente",
      municipio: obtenerNombreRelacion(solicitud.municipios),
      comunidad: obtenerNombreRelacion(solicitud.comunidades),
    }));

    setTotal(normalizadas.length);
    setPendientes(
      normalizadas.filter((s) => (s.estado || "pendiente") === "pendiente").length
    );
    setAprobados(normalizadas.filter((s) => s.estado === "aprobado").length);
    setRechazados(normalizadas.filter((s) => s.estado === "rechazado").length);

    setRecientes(normalizadas.slice(0, 5));
    setSolicitudes(normalizadas);
    setTimeline(construirTimeline(normalizadas));

    setLoading(false);
  };

  useEffect(() => {
    cargarStats();
  }, []);

  return {
    total,
    pendientes,
    aprobados,
    rechazados,
    recientes,
    solicitudes,
    timeline,
    loading,
  };
};

const construirTimeline = (data: DashboardSolicitudReciente[]): DashboardTimelinePoint[] => {
  const formatter = new Intl.DateTimeFormat("es-MX", { weekday: "short" });
  const hoy = new Date();
  const dias = Array.from({ length: 7 }, (_, index) => {
    const fecha = new Date(hoy);
    fecha.setHours(0, 0, 0, 0);
    fecha.setDate(hoy.getDate() - (6 - index));

    return {
      key: fecha.toISOString().slice(0, 10),
      day: capitalizar(formatter.format(fecha).replace(".", "")),
      total: 0,
      pendientes: 0,
      aprobados: 0,
      rechazados: 0,
    };
  });

  const mapa = new Map(dias.map((dia) => [dia.key, dia]));

  data.forEach((solicitud) => {
    const fecha = new Date(solicitud.created_at);
    fecha.setHours(0, 0, 0, 0);
    const key = fecha.toISOString().slice(0, 10);
    const dia = mapa.get(key);

    if (!dia) return;

    dia.total += 1;
    if ((solicitud.estado || "pendiente") === "pendiente") {
      dia.pendientes += 1;
    } else if (solicitud.estado === "aprobado") {
      dia.aprobados += 1;
    } else if (solicitud.estado === "rechazado") {
      dia.rechazados += 1;
    }
  });

  return dias.map((dia) => ({
    day: dia.day,
    total: dia.total,
    pendientes: dia.pendientes,
    aprobados: dia.aprobados,
    rechazados: dia.rechazados,
  }));
};

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

type RelacionNombre =
  | {
      nombre?: string | null;
    }
  | Array<{
      nombre?: string | null;
    }>
  | undefined
  | null;

type DashboardSolicitudRaw = Omit<
  DashboardSolicitudReciente,
  "municipio" | "comunidad"
> & {
  municipios?: RelacionNombre;
  comunidades?: RelacionNombre;
};

const obtenerNombreRelacion = (relacion: RelacionNombre) => {
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre || null;
  }

  return relacion?.nombre || null;
};
