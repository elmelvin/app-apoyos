import { SolicitudFormState } from "./types";

export const initialSolicitudFormState: SolicitudFormState = {
  nombre: "",
  telefono: "",
  direccion: "",
  ingresoHogar: "",
  dependientes: "",
  situacionLaboral: "",
  tipoVivienda: "",
  serviciosBasicos: "",
  apoyoAdicional: "",
  mensaje: "",
  documentos: {},
};

export const PASOS_SOLICITUD = [
  "Datos personales",
  "Estudio socioeconomico",
  "Descripcion",
  "Documentos",
  "Revision final",
];

export const OPCIONES_INGRESO = [
  "Menos de 3,000 pesos",
  "De 3,000 a 6,000 pesos",
  "De 6,001 a 10,000 pesos",
  "Mas de 10,000 pesos",
];

export const OPCIONES_DEPENDIENTES = [
  "Ninguno",
  "1 a 2 personas",
  "3 a 4 personas",
  "5 o mas personas",
];

export const OPCIONES_LABORALES = [
  "Sin empleo",
  "Trabajo eventual",
  "Trabajo formal",
  "Negocio propio",
];

export const OPCIONES_VIVIENDA = [
  "Prestada",
  "Rentada",
  "Propia",
  "Compartida con familiares",
];

export const OPCIONES_SERVICIOS = [
  "Todos los servicios basicos",
  "Falta uno",
  "Faltan varios",
  "Servicio limitado o irregular",
];

export const OPCIONES_APOYO = [
  "No recibe apoyos",
  "Si recibe apoyo gubernamental",
  "Si recibe apoyo familiar",
];

export const DOCUMENTOS_POR_DEFECTO = [
  "INE",
  "CURP",
  "Comprobante de domicilio",
];

export const DOCUMENTO_EVIDENCIA_SOLICITUD = "Evidencia de la solicitud";
export const DOCUMENTO_EVIDENCIA_ADICIONAL = "Evidencia adicional opcional";
