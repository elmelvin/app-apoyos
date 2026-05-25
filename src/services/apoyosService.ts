import { supabase } from "./supabaseClient";
import { getFriendlyDatabaseErrorMessage } from "../utils/errors";

export interface Apoyo {
  id: string;
  nombre: string;
  descripcion: string | null;
  requisitos?: string | null;
  municipio_id?: string | null;
  activo?: boolean | null;
  fecha_creacion?: string | null;
}

export type ApoyoSeleccionadoPayload = {
  id: string;
  nombre: string;
  descripcion?: string | null;
  requisitos?: string[];
};

export type MunicipioOption = {
  id: string;
  nombre: string;
};

export const getApoyos = async (municipioId?: string | null) => {
  let query = supabase
    .from("apoyos")
    .select("id, nombre, descripcion, requisitos, municipio_id, activo")
    .eq("activo", true)
    .order("nombre");

  query = municipioId
    ? query.or(`municipio_id.is.null,municipio_id.eq.${municipioId}`)
    : query.is("municipio_id", null);

  const { data, error } = await query;

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudieron cargar los apoyos.")
    );
  }

  return (data || []) as Apoyo[];
};

export const getAdminApoyos = async () => {
  const { data, error } = await supabase
    .from("apoyos")
    .select(
      "id, nombre, descripcion, requisitos, municipio_id, activo, fecha_creacion, municipios:municipio_id(nombre)"
    )
    .order("fecha_creacion", { ascending: false });

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudieron cargar los apoyos.")
    );
  }

  return (data || []).map((apoyo) => ({
    id: apoyo.id,
    nombre: apoyo.nombre,
    descripcion: apoyo.descripcion,
    requisitos: apoyo.requisitos,
    municipio_id: apoyo.municipio_id,
    activo: apoyo.activo,
    fecha_creacion: apoyo.fecha_creacion,
    municipio_nombre: obtenerNombreRelacion(apoyo.municipios),
  })) as Array<Apoyo & { municipio_nombre?: string | null }>;
};

export const getMunicipios = async () => {
  const { data, error } = await supabase
    .from("municipios")
    .select("id, nombre")
    .order("nombre");

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudieron cargar los municipios.")
    );
  }

  return (data || []) as MunicipioOption[];
};

export const crearApoyo = async (payload: {
  nombre: string;
  descripcion: string;
  requisitos: string;
  municipio_id: string | null;
}) => {
  const { error } = await supabase.from("apoyos").insert({
    nombre: payload.nombre,
    descripcion: payload.descripcion,
    requisitos: payload.requisitos,
    municipio_id: payload.municipio_id,
    activo: true,
  });

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudo crear el apoyo.")
    );
  }
};

export const actualizarApoyo = async (
  id: string,
  payload: {
    nombre: string;
    descripcion: string;
    requisitos: string;
    municipio_id: string | null;
  }
) => {
  const { error } = await supabase
    .from("apoyos")
    .update({
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      requisitos: payload.requisitos,
      municipio_id: payload.municipio_id,
    })
    .eq("id", id);

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudo actualizar el apoyo.")
    );
  }
};

export const eliminarApoyo = async (id: string) => {
  const { error } = await supabase.from("apoyos").delete().eq("id", id);

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudo eliminar el apoyo.")
    );
  }
};

export const cambiarEstadoApoyo = async (id: string, activo: boolean) => {
  const { error } = await supabase
    .from("apoyos")
    .update({ activo })
    .eq("id", id);

  if (error) {
    throw new Error(
      getFriendlyDatabaseErrorMessage(error, "No se pudo actualizar el estado del apoyo.")
    );
  }
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
