import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { http } from "../../api/http";
import { HistoryItem, DigitalData, PhysioData, PSS10Data } from "./History";

export default function HistoryDetail() {
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateItem = location.state?.item as HistoryItem | undefined;

  const [item, setItem] = useState<HistoryItem | null>(stateItem || null);
  const [isLoading, setIsLoading] = useState(!stateItem);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item && item.date === date) {
      return;
    }

    // Fetch if state is missing
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

        // Build object only for current date
        const targetItem: HistoryItem = {
          date: date || "",
          stress_level: null,
          total_score: null,
          digital: digitalData.find((d) => d.activity_date === date) || null,
          physio: physioData.find((p) => p.activity_date === date) || null,
          pss10: pss10Data.find((p) => p.activity_date === date) || null,
        };

        if (targetItem.pss10) {
          targetItem.stress_level = targetItem.pss10.stress_level;
          targetItem.total_score = targetItem.pss10.total_score;
        }

        if (!targetItem.digital && !targetItem.physio && !targetItem.pss10) {
          setError("Data tidak ditemukan untuk tanggal ini.");
        } else {
          setItem(targetItem);
        }
      } catch {
        setError("Gagal memuat data detail.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [date, item]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(dateObj);
    const [year, month, day] = dateString.split("-");
    return `${dayName}, ${day}-${month}-${year}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="p-6">
        <button onClick={() => navigate("/student/history")} className="mb-4 text-brand-500 hover:underline">
          &larr; Kembali ke Riwayat
        </button>
        <div className="p-4 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
          {error || "Data tidak ditemukan."}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Detail Riwayat - ${date ? formatDate(date) : ""}`}
        description="Detail riwayat data"
      />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/student/history")}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl dark:hover:bg-gray-800 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Detail Riwayat Data
            </h1>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal: {item.date ? formatDate(item.date) : ""}</p>
              {item.digital?.day_type === "ujian" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  Minggu Ujian
                </span>
              ) : item.digital?.day_type === "perkuliahan" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Kuliah Biasa
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* 3 Columns Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Digital Activity */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
              <span className="text-brand-500 text-xl">📱</span> Aktivitas Digital
            </h3>
            {item.digital ? (
              <div className="space-y-3">
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Durasi Smartphone</span>
                  <span className="font-medium text-gray-800 dark:text-white text-right">{item.digital.smartphone_duration_hours}</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Akses Medsos</span>
                  <span className="font-medium text-gray-800 dark:text-white text-right">{item.digital.social_media_access_count}</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Durasi Medsos</span>
                  <span className="font-medium text-gray-800 dark:text-white text-right">{item.digital.social_media_duration_hours}</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Mata Kuliah</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.digital.course_count}</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Tugas Kuliah</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.digital.task_count}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada data</p>
            )}
          </div>

          {/* Physiological Data */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
              <span className="text-success-500 text-xl">❤️</span> Data Fisiologis
            </h3>
            {item.physio ? (
              <div className="space-y-3">
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Heart Rate Avg</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.physio.heart_rate_avg} bpm</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Heart Rate Min</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.physio.heart_rate_min} bpm</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Heart Rate Max</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.physio.heart_rate_max} bpm</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Langkah</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.physio.step_count}</span>
                </p>
                <p className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Durasi Tidur</span>
                  <span className="font-medium text-gray-800 dark:text-white">{item.physio.sleep_duration_hours} jam</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada data</p>
            )}
          </div>

          {/* PSS-10 Data */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-lg">
              <span className="text-warning-500 text-xl">📋</span> PSS-10
            </h3>
            {item.pss10 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((q) => (
                    <div key={q} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-400 mb-1">Q{q}</p>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {item.pss10?.answers?.[`q${q}`] ?? "-"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="flex justify-between items-center text-lg">
                    <span className="text-gray-500 dark:text-gray-400">Total Skor</span>
                    <span className="font-bold text-brand-500">{item.pss10.total_score}/40</span>
                  </p>
                  {item.stress_level && (
                    <p className="flex justify-between items-center mt-2">
                      <span className="text-gray-500 dark:text-gray-400">Level Stres</span>
                      <span className="font-medium capitalize text-gray-800 dark:text-white">
                        {item.stress_level === "low" ? "Rendah" : item.stress_level === "medium" ? "Sedang" : item.stress_level === "high" ? "Tinggi" : item.stress_level}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada data</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
