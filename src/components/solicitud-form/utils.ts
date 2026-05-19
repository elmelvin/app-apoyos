import { ApoyoSeleccionadoPayload } from "../../services/apoyosService";

export const descomponerMensajeCompleto = (mensajeCompleto: string) => {
  const secciones = mensajeCompleto.split("\n\nResumen socioeconomico:\n");
  const mensaje = secciones[0]?.trim() || "";
  const resumen = secciones[1] || "";
  const lineas = resumen.split("\n");

  const extraerValor = (etiqueta: string) =>
    lineas.find((linea) => linea.startsWith(`${etiqueta}:`))?.split(":").slice(1).join(":").trim() || "";

  return {
    mensaje,
    ingresoHogar: extraerValor("Ingreso del hogar"),
    dependientes: extraerValor("Dependientes"),
    situacionLaboral: extraerValor("Situacion laboral"),
    tipoVivienda: extraerValor("Tipo de vivienda"),
    serviciosBasicos: extraerValor("Servicios basicos"),
    apoyoAdicional: extraerValor("Apoyo adicional"),
  };
};

export const obtenerAcceptDocumento = (documento: string) => {
  const nombre = documento.toLowerCase();

  if (nombre.includes("foto") || nombre.includes("imagen")) {
    return "image/*";
  }

  return "application/pdf";
};

export const obtenerHelperDocumento = (documento: string) => {
  const nombre = documento.toLowerCase();

  if (nombre.includes("foto") || nombre.includes("imagen")) {
    return "Sube una imagen clara y legible.";
  }

  if (nombre.includes("comprobante")) {
    return "Recibo reciente, constancia o archivo equivalente en PDF.";
  }

  return "Sube el documento en PDF legible.";
};

export const esApoyoMedicoODiscapacidad = (apoyo?: ApoyoSeleccionadoPayload | null) => {
  const texto = normalizarTexto(`${apoyo?.nombre || ""} ${apoyo?.descripcion || ""}`);

  return [
    "discapacidad",
    "medic",
    "salud",
    "tratamiento",
    "terapia",
    "consulta",
    "medicamento",
    "estudio",
    "analisis",
    "cirugia",
    "silla de ruedas",
    "andadera",
    "muleta",
    "baston",
    "protesis",
    "aparato auditivo",
    "movilidad",
  ].some((termino) => texto.includes(termino));
};

export const quitarDocumentosMedicos = (documentos: string[]) =>
  documentos.filter((documento) => !esDocumentoMedico(documento));

const esDocumentoMedico = (documento: string) => {
  const texto = normalizarTexto(documento);

  return [
    "documento medico",
    "certificado medico",
    "constancia medica",
    "diagnostico medico",
  ].some((termino) => texto.includes(termino));
};

const normalizarTexto = (texto: string) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
