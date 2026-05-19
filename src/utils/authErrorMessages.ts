const normalizeMessage = (message: string) =>
  message.replace(/\+/g, " ").trim().toLowerCase();

export const getFriendlyAuthErrorMessage = (
  error: unknown,
  fallback = "No se pudo completar la accion. Intenta de nuevo en unos momentos."
) => {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";

  const message = normalizeMessage(rawMessage);

  if (!message) return fallback;

  if (
    message.includes("email rate limit exceeded") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  ) {
    return "Se enviaron demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo.";
  }

  if (
    message.includes("error sending confirmation email") ||
    message.includes("error sending recovery email") ||
    message.includes("error sending magic link") ||
    message.includes("failed to send")
  ) {
    return "No pudimos enviar el correo. Revisa que el correo este bien escrito e intenta nuevamente.";
  }

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials") ||
    message.includes("invalid email or password")
  ) {
    return "El correo o la contrasena no son correctos. Revisa los datos e intenta de nuevo.";
  }

  if (message.includes("email not confirmed")) {
    return "Primero confirma tu correo. Revisa tu bandeja de entrada o solicita un nuevo enlace.";
  }

  if (
    message.includes("user already registered") ||
    message.includes("already registered") ||
    message.includes("already exists")
  ) {
    return "Ese correo ya tiene una cuenta registrada. Inicia sesion o recupera tu contrasena.";
  }

  if (
    message.includes("signup disabled") ||
    message.includes("signups not allowed")
  ) {
    return "El registro esta desactivado por el momento. Intenta mas tarde.";
  }

  if (
    message.includes("weak password") ||
    message.includes("password should") ||
    message.includes("password must") ||
    message.includes("password is too")
  ) {
    return "La contrasena no cumple con los requisitos. Usa una contrasena mas segura.";
  }

  if (
    message.includes("new password should be different") ||
    message.includes("same password")
  ) {
    return "La nueva contrasena debe ser diferente a la anterior.";
  }

  if (
    message.includes("invalid jwt") ||
    message.includes("invalid token") ||
    message.includes("token has expired") ||
    message.includes("otp expired") ||
    message.includes("expired")
  ) {
    return "El enlace ya no es valido. Solicita uno nuevo e intenta otra vez.";
  }

  if (
    message.includes("auth session missing") ||
    message.includes("session missing") ||
    message.includes("no current user")
  ) {
    return "La sesion ya no esta activa. Inicia sesion nuevamente.";
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
