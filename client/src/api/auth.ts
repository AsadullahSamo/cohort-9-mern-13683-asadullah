import { api } from "./client";

export interface AuthResponse {
  accessToken: string;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/signup", { email, password });
  return res.data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function refresh(): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>("/auth/refresh");
  return res.data;
}