import { http } from "./http";
import { User } from "./auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminUser extends User {
  created_at: string;
  pa_name?: string;
}

export interface StressTrendItem {
  date: string;
  avg_score: number;
  count: number;
}

export interface StressDistribution {
  low: number;
  medium: number;
  high: number;
  no_data: number;
}

// ─── User Management ─────────────────────────────────────────────────────────

export const listUsers = async (role?: string): Promise<AdminUser[]> => {
  const params = role ? `?role=${role}` : "";
  const res = await http.get<{ success: boolean; data: AdminUser[] }>(`/admin/users${params}`);
  return res.data.data;
};

export const createUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: string;
  university?: string;
  major?: string;
  semester?: number;
}): Promise<AdminUser> => {
  const res = await http.post<{ success: boolean; data: AdminUser }>("/admin/users", payload);
  return res.data.data;
};

export const updateUser = async (userId: number, payload: Partial<AdminUser & { password?: string }>): Promise<AdminUser> => {
  const res = await http.patch<{ success: boolean; data: AdminUser }>(`/admin/users/${userId}`, payload);
  return res.data.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await http.delete(`/admin/users/${userId}`);
};

// ─── PA Assignment ────────────────────────────────────────────────────────────

export const assignPA = async (studentIds: number[], paId: number | null): Promise<void> => {
  await http.post("/admin/assign-pa", { student_ids: studentIds, pa_id: paId });
};

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getStressTrend = async (): Promise<StressTrendItem[]> => {
  const res = await http.get<{ success: boolean; data: StressTrendItem[] }>("/admin/stats/stress-trend");
  return res.data.data;
};

export const getStressDistribution = async (): Promise<StressDistribution & { total_students: number }> => {
  const res = await http.get<{ success: boolean; data: StressDistribution; total_students: number }>("/admin/stats/stress-distribution");
  return { ...res.data.data, total_students: res.data.total_students };
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const exportData = (startDate?: string, endDate?: string): void => {
  const token = localStorage.getItem("access_token");
  const params = new URLSearchParams();
  if (startDate) params.append("start_date", startDate);
  if (endDate) params.append("end_date", endDate);

  // Buat link download langsung
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const url = `${baseUrl}/admin/export?${params.toString()}`;

  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", "");

  // Fetch dengan auth header lalu trigger download
  fetch(url, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => res.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.click();
      URL.revokeObjectURL(objectUrl);
    });
};
