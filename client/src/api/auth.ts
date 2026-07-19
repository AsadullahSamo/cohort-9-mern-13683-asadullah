import { api } from "./client";

export async function signup(email: string, password: string) {
  const res = await api.post("/auth/signup", { email, password });
  return res.data;
}

export async function login(email: string, password: string) {
  const res = await api.post("/auth/login", { email, password });
  return res.data;
}

export async function logout() {
  const res = await api.post("/auth/logout");
  return res.data;
}

export async function refresh() {
  const res = await api.post("/auth/refresh");
  return res.data;
}