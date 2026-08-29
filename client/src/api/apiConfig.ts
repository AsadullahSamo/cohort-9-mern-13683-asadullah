function stripTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === "/") end--;
  return url.slice(0, end);
}

export const API_BASE_URL = stripTrailingSlashes(import.meta.env.VITE_API_BASE_URL || "/api");
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "/";