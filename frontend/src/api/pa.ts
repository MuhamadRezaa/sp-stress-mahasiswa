import { http } from "./http";

export interface StudentStatus {
  id: number;
  name: string;
  email: string;
  university?: string;
  major?: string;
  semester?: number;
  today_status: {
    digital_activity: boolean;
    physiological: boolean;
    pss10: boolean;
    all_complete: boolean;
  };
  last_stress: {
    date: string | null;
    score: number | null;
    level: "low" | "medium" | "high" | null;
  };
  trend: Array<{
    date: string;
    score: number;
    level: "low" | "medium" | "high";
  }>;
}

export interface PAStressDistribution {
  low: number;
  medium: number;
  high: number;
  no_data: number;
}

export const getMyStudents = async (): Promise<StudentStatus[]> => {
  const res = await http.get<{ success: boolean; data: StudentStatus[] }>("/pa/students");
  return res.data.data;
};

export const getPAStressDistribution = async (): Promise<PAStressDistribution> => {
  const res = await http.get<{ success: boolean; data: PAStressDistribution }>("/pa/stats/stress-distribution");
  return res.data.data;
};
