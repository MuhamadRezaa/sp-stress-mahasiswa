import { http } from "./http";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  gender?: "L" | "P";
  age?: number;
  university?: string;
  major?: string;
  semester?: number;
  residential_status?: string;
}

export interface LoginResponse {
  access_token: string;
}

export const login = async (email: string, password: string): Promise<string> => {
  const response = await http.post<LoginResponse>("/auth/login", { email, password });
  const { access_token } = response.data;
  localStorage.setItem("access_token", access_token);
  return access_token;
};

export const getMe = async (): Promise<User> => {
  const response = await http.get<{ success: boolean; user: User }>("/auth/me");
  return response.data.user;
};

export const logout = (): void => {
  localStorage.removeItem("access_token");
  window.location.href = "/signin";
};

export const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
