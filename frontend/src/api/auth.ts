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
  phone?: string;
  profile_picture?: string;
}

export interface LoginResponse {
  access_token: string;
}

export const login = async (email: string, password: string, remember: boolean = true): Promise<string> => {
  const response = await http.post<LoginResponse>("/auth/login", { email, password });
  const { access_token } = response.data;
  
  if (remember) {
    localStorage.setItem("access_token", access_token);
    sessionStorage.removeItem("access_token");
  } else {
    sessionStorage.setItem("access_token", access_token);
    localStorage.removeItem("access_token");
  }
  
  return access_token;
};

export const signUp = async (data: { name: string; email: string; password: string; role: string }): Promise<{ user: User; access_token: string }> => {
  const response = await http.post<{ success: boolean; user: User; access_token: string; message: string }>("/auth/register", data);
  const { access_token } = response.data;
  localStorage.setItem("access_token", access_token);
  return response.data;
};

export const googleLogin = async (token: string): Promise<string> => {
  const response = await http.post<{ success: boolean; access_token: string; user: User; message: string }>("/auth/google", { token });
  const { access_token } = response.data;
  localStorage.setItem("access_token", access_token);
  return access_token;
};

export const getMe = async (): Promise<User> => {
  const response = await http.get<{ success: boolean; user: User }>("/auth/me");
  return response.data.user;
};

export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await http.patch<{ success: boolean; user: User; message: string }>("/auth/profile", data);
  return response.data.user;
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post<{ success: boolean; profile_picture: string; message: string }>("/auth/profile-picture", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.profile_picture;
};

export const logout = (): void => {
  localStorage.removeItem("access_token");
  sessionStorage.removeItem("access_token");
  window.location.href = "/signin";
};

export const getToken = (): string | null => {
  return localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};
