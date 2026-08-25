import axios from "axios";
import { getToken, setToken, notifyTokenRefreshed } from "../context/tokenStore";
import { API_BASE_URL } from "./apiConfig";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE_URL}/auth/refresh`, null, { withCredentials: true })
          .then((res) => res.data.accessToken)
          .finally(() => {
            refreshPromise = null;
          });
      }

      const newToken = await refreshPromise;
      setToken(newToken);
      notifyTokenRefreshed(newToken);

      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      setToken(null);
      notifyTokenRefreshed(null);
      return Promise.reject(refreshError);
    }
  }
);