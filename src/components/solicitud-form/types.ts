export type SolicitudFormState = {
  nombre: string;
  telefono: string;
  direccion: string;
  ingresoHogar: string;
  dependientes: string;
  situacionLaboral: string;
  tipoVivienda: string;
  serviciosBasicos: string;
  apoyoAdicional: string;
  mensaje: string;
  documentos: Record<string, File | null>;
};

export type SolicitudFormErrors = Record<string, string>;
