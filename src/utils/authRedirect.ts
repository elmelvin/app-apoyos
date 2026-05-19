const DEFAULT_PUBLIC_ORIGIN = "https://app-apoyos-dif.web.app";

const getConfiguredOrigin = () =>
  import.meta.env.VITE_AUTH_REDIRECT_ORIGIN?.replace(/\/$/, "");

const isLocalOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
  origin === "capacitor://localhost" ||
  origin === "ionic://localhost";

export const getAuthRedirectTo = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const configuredOrigin = getConfiguredOrigin();
  const currentOrigin = window.location.origin;
  const origin =
    configuredOrigin ||
    (isLocalOrigin(currentOrigin) ? DEFAULT_PUBLIC_ORIGIN : currentOrigin);

  return `${origin}${normalizedPath}`;
};
