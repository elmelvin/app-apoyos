import { supabase } from "./supabaseClient";

export const registerUser = async (
  email: string,
  password: string,
  nombre: string
) => {

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre: nombre
      }
    }
  });

  if (error) throw error;

  if (!data.user) throw new Error("No se pudo crear el usuario");

  return data.user;
};

// LOGIN
export const loginUser = async (email: string, password: string) => {

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data.user;
};

// PERFIL
export const getProfile = async (userId: string) => {

  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("user_id", userId) // ✅ CORRECTO
    .maybeSingle();        // ✅ EVITA ERROR JSON

  if (error) throw error;

  if (!data) {
    throw new Error("Perfil no encontrado");
  }

  return data;
};