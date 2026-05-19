import { ApoyoSeleccionadoPayload } from "../services/apoyosService";

const APOYO_SELECCIONADO_STORAGE_KEY = "app-apoyos:apoyo-seleccionado";

const esBrowser = () => typeof window !== "undefined" && Boolean(window.sessionStorage);

export const guardarApoyoSeleccionado = (apoyo: ApoyoSeleccionadoPayload) => {
  if (!esBrowser()) return;

  window.sessionStorage.setItem(APOYO_SELECCIONADO_STORAGE_KEY, JSON.stringify(apoyo));
};

export const leerApoyoSeleccionado = () => {
  if (!esBrowser()) return null;

  const guardado = window.sessionStorage.getItem(APOYO_SELECCIONADO_STORAGE_KEY);

  if (!guardado) return null;

  try {
    const apoyo = JSON.parse(guardado) as ApoyoSeleccionadoPayload;

    if (!apoyo?.id || !apoyo?.nombre) {
      return null;
    }

    return apoyo;
  } catch {
    return null;
  }
};

export const limpiarApoyoSeleccionado = () => {
  if (!esBrowser()) return;

  window.sessionStorage.removeItem(APOYO_SELECCIONADO_STORAGE_KEY);
};
