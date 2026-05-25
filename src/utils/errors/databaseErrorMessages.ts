const normalizarMensaje = (mensaje: string) =>
  mensaje.replace(/\+/g, " ").trim().toLowerCase();

export const getFriendlyDatabaseErrorMessage = (
  error: unknown,
  fallback = "No se pudo completar la accion. Intenta de nuevo en unos momentos."
) => {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const message = normalizarMensaje(rawMessage);

  if (!message) return fallback;

  if (
    message.includes("violates foreign key constraint") &&
    message.includes("solicitudes_apoyo_id_fkey")
  ) {
    return "No se puede eliminar este apoyo porque ya tiene solicitudes relacionadas.";
  }

  if (message.includes("violates foreign key constraint")) {
    return "No se puede completar la accion porque este registro esta relacionado con otros datos.";
  }

  if (message.includes("duplicate key value violates unique constraint")) {
    return "Ya existe un registro con esos datos.";
  }

  if (message.includes("null value in column")) {
    return "Falta completar un dato obligatorio.";
  }

  if (message.includes("violates not-null constraint")) {
    return "Falta completar un dato obligatorio.";
  }

  if (message.includes("violates check constraint")) {
    return "Uno de los datos no cumple con el formato permitido.";
  }

  if (message.includes("permission denied") || message.includes("row-level security")) {
    return "No tienes permiso para realizar esta accion.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("fetch failed") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  ) {
    return "No se pudo conectar. Revisa tu internet e intenta de nuevo.";
  }

  return fallback;
};
