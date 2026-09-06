import axiosInstance from "./axiosInstance";

export async function signup(name, email, password) {
  const response = await axiosInstance.post("/api/auth/signup", { name, email, password });
  return response.data;
}

export async function login(email, password) {
  const response = await axiosInstance.post("/api/auth/login", { email, password });
  return response.data;
}