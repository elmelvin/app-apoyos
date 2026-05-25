import { supabase } from "./supabaseClient";
import { getAuthRedirectTo, getFriendlyAuthErrorMessage } from "../utils/auth";

export const getHomeRouteByRole = (rol?: string | null) =>
  rol === "admin" ? "/admin/dashboard" : "/usuario/home";

const normalizeAuthError = (error: unknown) => {
  return new Error(getFriendlyAuthErrorMessage(error));
};

export const registerUser = async (
  email: string,
  password: string,
  nombre: string,
  telefono: string
) => {

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectTo("/email-confirmed?source=auth"),
      data: {
        nombre: nombre,
        telefono: telefono
      }
    }
  });

  if (error) throw error;

  if (!data.user) throw new Error("No se pudo crear el usuario");

  return data.user;
};

// LOGIN
export const loginUser = async (email: string, password: string) => {

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data.user;
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const getActiveSessionHomeRoute = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) throw normalizeAuthError(error);
  if (!session?.user) return null;

  const profile = await getProfile(session.user.id);

  return getHomeRouteByRole(profile.rol);
};

export const requestPasswordReset = async (email: string) => {
  const redirectTo = getAuthRedirectTo("/reset-password");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) throw error;
};

export const changeUserPassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user?.email) {
    throw new Error("No se encontro la sesion activa del usuario.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    throw new Error("La contrasena actual no es correcta.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) throw updateError;
};

export const updateRecoveredPassword = async (newPassword: string) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
};

// PERFIL
export const getProfile = async (userId: string) => {

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", userId) 
    .maybeSingle();        

  if (error) throw error;

  if (!data) {
    throw new Error("Perfil no encontrado");
  }

  return data;
};
