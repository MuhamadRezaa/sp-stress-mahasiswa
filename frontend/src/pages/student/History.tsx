import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { http } from "../../api/http";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
export interface DigitalData {
  activity_date: string;
  smartphone_duration_hours: number;
  social_media_access_count: number;
  social_media_duration_hours: number;
  course_count: number;
  task_count: number;
}

export interface PhysioData {
  activity_date: string;
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  step_count: number;
  sleep_duration_hours: number;
}

export interface PSS10Data {
  activity_date: string;
  total_score: number;
  stress_level: string;
  answers: Record<string, number>;
}

export interface HistoryItem {
  date: string;
  stress_level: string | null;
  total_score: number | null;
  digital: DigitalData | null;
  physio: PhysioData | null;
  pss10: PSS10Data | null;
}

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [digitalRes, physioRes, pss10Res] = await Promise.all([
          http.get<{ success: boolean; data: DigitalData[] }>("/student/digital/history"),
          http.get<{ success: boolean; data: PhysioData[] }>("/student/physio/history"),
          http.get<{ success: boolean; data: PSS10Data[] }>("/student/pss10/history"),
        ]);

        const digitalData = digitalRes.data.data || [];
        const physioData = physioRes.data.data || [];
        const pss10Data = pss10Res.data.data || [];

        // Combine data by date
        const dateMap = new Map<string, HistoryItem>();

        // Add PSS10 data first (as it has stress level)
        pss10Data.forEach((item) => {
          dateMap.set(item.activity_date, {
            date: item.activity_date,
            stress_level: item.stress_level,
            total_score: item.total_score,
            digital: null,
            physio: null,
            pss10: item,
          });
        });

        // Add digital data
        digitalData.forEach((item) => {
          const existing = dateMap.get(item.activity_date);
          if (existing) {
            existing.digital = item;
          } else {
            dateMap.set(item.activity_date, {
              date: item.activity_date,
              stress_level: null,
              total_score: null,
              digital: item,
              physio: null,
              pss10: null,
            });
          }
        });

        // Add physio data
        physioData.forEach((item) => {
          const existing = dateMap.get(item.activity_date);
          if (existing) {
            existing.physio = item;
          } else {
            dateMap.set(item.activity_date, {
              date: item.activity_date,
              stress_level: null,
              total_score: null,
              digital: null,
              physio: item,
              pss10: null,
            });
          }
        });

        // Convert to array and sort by date descending
        const combined = Array.from(dateMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setHistoryData(combined);
      } catch {
        setError("Gagal memuat data history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStressLevelBadge = (level: string | null) => {
    if (!level) return null;
    const config = {
      low: { label: "Rendah", color: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400" },
      medium: { label: "Sedang", color: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400" },
      high: { label: "Tinggi", color: "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-400" },
    };
    const cfg = config[level as keyof typeof config];
    return cfg ? (
      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${cfg.color}`}>
        {cfg.label}
      </span>
    ) : null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Riwayat Data | Stress Prediction System"
        description="Riwayat data dan hasil prediksi stress"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Riwayat Data
          </h1>
        </div>

        {error && (
          <div className="p-4 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
            {error}
          </div>
        )}

        {historyData.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-gray-500 dark:text-gray-400">Belum ada data riwayat</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Tanggal
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Skor PSS-10
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Tingkat Stres
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                    >
                      Aksi
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {historyData.map((item) => (
                    <React.Fragment key={item.date}>
                      <TableRow>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.date}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {item.total_score !== null ? `${item.total_score}/40` : "-"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          {getStressLevelBadge(item.stress_level) || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-start">
                          <button
                            onClick={() => navigate(`/student/history/${item.date}`, { state: { item } })}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                          >
                            Detail
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
