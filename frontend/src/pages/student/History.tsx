import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { http } from "../../api/http";
import { DataTable, Column } from "../../components/ui/table/DataTable";

export interface DigitalData {
  activity_date: string;
  day_type?: string;
  smartphone_duration_hours: string;
  social_media_access_count: string;
  social_media_duration_hours: string;
  course_count: string;
  task_count: string;
}

export interface PhysioData {
  activity_date: string;
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  step_count: number;
  sleep_duration_hours: number;
  hrv_avg: number | null;
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
        setIsLoading(true);
        const [digitalRes, physioRes, pss10Res] = await Promise.all([
          http.get<{ success: boolean; data: DigitalData[] }>("/student/digital/history"),
          http.get<{ success: boolean; data: PhysioData[] }>("/student/physio/history"),
          http.get<{ success: boolean; data: PSS10Data[] }>("/student/pss10/history"),
        ]);

        const digitalData = digitalRes.data.data || [];
        const physioData = physioRes.data.data || [];
        const pss10Data = pss10Res.data.data || [];

        const dateMap = new Map<string, HistoryItem>();

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

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(dateObj);
    const [year, month, day] = dateString.split("-");
    return `${dayName}, ${day}-${month}-${year}`;
  };

  const getStressLevelLabel = (level: string | null) => {
    switch (level) {
      case "low": return "Rendah";
      case "medium": return "Sedang";
      case "high": return "Tinggi";
      default: return "";
    }
  };

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

  // Define Columns for DataTable
  const columns: Column<HistoryItem>[] = [
    {
      header: "Tanggal",
      accessor: "date",
      sortable: true,
      render: (row) => formatDate(row.date),
    },
    {
      header: "Jenis Hari",
      accessor: "digital.day_type",
      sortable: true,
      render: (row) => {
        if (row.digital?.day_type === "ujian") {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Ujian
            </span>
          );
        } else if (row.digital?.day_type === "perkuliahan") {
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Kuliah
            </span>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      header: "Skor PSS-10",
      accessor: "total_score",
      sortable: true,
      render: (row) => (row.total_score !== null ? `${row.total_score}/40` : "-"),
    },
    {
      header: "Tingkat Stres",
      accessor: "stress_level",
      sortable: true,
      render: (row) => getStressLevelBadge(row.stress_level) || <span className="text-gray-400">-</span>,
    },
    {
      header: "Aksi",
      accessor: "date",
      render: (row) => (
        <button
          onClick={() => navigate(`/student/history/${row.date}`, { state: { item: row } })}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
        >
          Detail
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ),
    },
  ];

  // Custom filter to support searching formatted date or stress levels
  const globalFilter = (row: HistoryItem, query: string) => {
    const formattedDate = formatDate(row.date).toLowerCase();
    const stressLabel = getStressLevelLabel(row.stress_level).toLowerCase();
    const dayType = (row.digital?.day_type || "").toLowerCase();
    return formattedDate.includes(query) || stressLabel.includes(query) || dayType.includes(query);
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
        title="Riwayat Data"
        description="Riwayat data dan hasil prediksi"
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Riwayat Data
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola dan pantau hasil prediksi stres harian Anda
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <DataTable
            columns={columns}
            data={historyData}
            globalFilterFn={globalFilter}
            searchPlaceholder="Cari tanggal, tingkat stres..."
            defaultRowsPerPage={10}
          />
        </div>
      </div>
    </>
  );
}
