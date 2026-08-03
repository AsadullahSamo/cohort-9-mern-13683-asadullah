let currentToken: string | null = null;
let onTokenRefreshed: ((token: string | null) => void) | null = null;

export function setToken(token: string | null) {
  currentToken = token;
}

export function getToken() {
  return currentToken;
}

export function setTokenRefreshHandler(handler: (token: string | null) => void) {
  onTokenRefreshed = handler;
}

export function notifyTokenRefreshed(token: string | null) {
  onTokenRefreshed?.(token);
}