import { supabase } from "./supabaseClient";

export const getApoyos = async () => {

  const { data, error } = await supabase
    .from("apoyos")
    .select("*")
    .eq("activo", true);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};