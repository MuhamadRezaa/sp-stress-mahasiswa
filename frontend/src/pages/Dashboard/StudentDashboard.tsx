import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { http } from "../../api/http";
import { getMe, User } from "../../api/auth";

interface DashboardStats {
  digitalCount: number;
  physioCount: number;
  pss10Count: number;
  lastStressLevel: string | null;
  lastPSS10Score: number | null;
}

interface PSS10HistoryItem {
  activity_date: string;
  total_score: number;
  stress_level: string;
}

interface DailyStatus {
  date: string;
  status: {
    digital_activity: boolean;
    physiological: boolean;
    pss10: boolean;
    all_complete: boolean;
  };
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    digitalCount: 0,
    physioCount: 0,
    pss10Count: 0,
    lastStressLevel: null,
    lastPSS10Score: null,
  });
  const [chartData, setChartData] = useState<{ dates: string[]; levels: number[] }>({
    dates: [],
    levels: [],
  });
  const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user info
        const userData = await getMe();
        setUser(userData);

        // Fetch daily status + history
        const [digitalRes, physioRes, pss10Res, statusRes] = await Promise.all([
          http.get<{ success: boolean; data: unknown[] }>("/student/digital/history"),
          http.get<{ success: boolean; data: unknown[] }>("/student/physio/history"),
          http.get<{ success: boolean; data: PSS10HistoryItem[] }>("/student/pss10/history"),
          http.get<{ success: boolean; date: string; status: DailyStatus["status"] }>("/student/daily-status"),
        ]);

        const digitalData = digitalRes.data.data || [];
        const physioData = physioRes.data.data || [];
        const pss10Data = pss10Res.data.data || [];

        setStats({
          digitalCount: digitalData.length,
          physioCount: physioData.length,
          pss10Count: pss10Data.length,
          lastStressLevel: pss10Data.length > 0 ? pss10Data[0].stress_level : null,
          lastPSS10Score: pss10Data.length > 0 ? pss10Data[0].total_score : null,
        });

        setDailyStatus({
          date: statusRes.data.date,
          status: statusRes.data.status,
        });

        // Prepare chart data (reverse to show oldest first, last 7 days)
        const reversedData = [...pss10Data].reverse().slice(-7);
        const levelToNumber = (level: string) => {
          if (level === "low") return 1;
          if (level === "medium") return 2;
          return 3;
        };
        setChartData({
          dates: reversedData.map((item) => formatDate(item.activity_date)),
          levels: reversedData.map((item) => levelToNumber(item.stress_level)),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${day}-${month}-${year}`;
  };

  const getStressLevelColor = (level: string | null) => {
    switch (level) {
      case "low":
        return "text-success-500 bg-success-50 dark:bg-success-500/10";
      case "medium":
        return "text-warning-500 bg-warning-50 dark:bg-warning-500/10";
      case "high":
        return "text-error-500 bg-error-50 dark:bg-error-500/10";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-800";
    }
  };

  const getStressLevelLabel = (level: string | null) => {
    switch (level) {
      case "low":
        return "Rendah";
      case "medium":
        return "Sedang";
      case "high":
        return "Tinggi";
      default:
        return "Belum Ada Data";
    }
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 280,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    stroke: {
      curve: "smooth",
      width: 3,
      colors: ["#6366F1"],
    },
    markers: {
      size: 8,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 10 },
      discrete: chartData.levels.map((level, index) => ({
        seriesIndex: 0,
        dataPointIndex: index,
        fillColor: level === 1 ? "#10B981" : level === 2 ? "#F59E0B" : "#EF4444",
        strokeColor: "#fff",
        size: 8,
      })),
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        if (val === 1) return "Rendah";
        if (val === 2) return "Sedang";
        if (val === 3) return "Tinggi";
        return "";
      },
      style: {
        fontSize: "10px",
        fontWeight: 600,
        colors: ["#374151"],
      },
      background: {
        enabled: true,
        foreColor: "#fff",
        borderRadius: 4,
        padding: 4,
      },
      offsetY: -10,
    },
    legend: { show: false },
    xaxis: {
      categories: chartData.dates,
      labels: {
        style: { colors: "#9CA3AF", fontSize: "11px" },
        rotate: -45,
        rotateAlways: chartData.dates.length > 4,
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      max: 4,
      tickAmount: 3,
      labels: {
        style: { colors: "#9CA3AF", fontSize: "12px" },
        formatter: (val) => {
          if (val === 1) return "Rendah";
          if (val === 2) return "Sedang";
          if (val === 3) return "Tinggi";
          return "";
        },
      },
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val) => {
          if (val === 1) return "Stress Rendah";
          if (val === 2) return "Stress Sedang";
          if (val === 3) return "Stress Tinggi";
          return "";
        },
      },
    },
  };

  const chartSeries = [
    {
      name: "Tingkat Stress",
      data: chartData.levels,
    },
  ];

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
        title="Dashboard"
        description="Dashboard mahasiswa"
      />

      <div className="space-y-6">

        {/* Welcome Section */}
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-brand-500 to-brand-600 p-6 dark:border-gray-800">
          <h1 className="text-2xl font-bold text-white mb-2">
            Selamat Datang, {user?.name || "Mahasiswa"}! 👋
          </h1>
          <p className="text-brand-100">
            Pantau Stres Anda dengan mencatat aktivitas Digital, Fisiologis dari Smartwatch/Smartband dan mengisi kuesioner PSS-10.
          </p>
        </div>

        {/* Daily Progress Tracker */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">

          <div className={`rounded-2xl border-2 p-5 transition-all ${dailyStatus?.status.all_complete
            ? "border-success-200 bg-success-50/50 dark:border-success-500/20 dark:bg-success-500/5"
            : "border-dashed border-brand-300 bg-brand-50/30 hover:bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5 dark:hover:bg-brand-500/10"
            }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`flex items-center justify-center w-14 h-14 rounded-xl shrink-0 shadow-theme-xs transition-colors ${dailyStatus?.status.all_complete
                  ? "bg-success-500 text-white"
                  : "bg-brand-500 text-white"
                  }`}>
                  {dailyStatus?.status.all_complete ? (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    {dailyStatus?.status.all_complete ? "Laporan Hari Ini Selesai!" : "Lengkapi Data Hari Ini"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {dailyStatus?.status.all_complete
                      ? "Luar biasa! Anda sudah mencatat semua data kesehatan dan kuesioner hari ini."
                      : "Anda belum mencatat data hari ini. Yuk, isi sekarang untuk memantau tingkat stres Anda!"}
                  </p>
                </div>
              </div>

              {!dailyStatus?.status.all_complete && (
                <Link
                  to="/student/input"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white transition-all rounded-xl bg-brand-500 hover:bg-brand-600 shadow-theme-xs hover:shadow-theme-sm active:scale-95 whitespace-nowrap gap-2"
                >
                  Isi Laporan Sekarang
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {dailyStatus?.status.all_complete && (
                <div className="flex items-center gap-2 px-4 py-2 bg-success-50 dark:bg-success-500/10 rounded-lg border border-success-100 dark:border-success-500/20 whitespace-nowrap">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success-500"></span>
                  </span>
                  <span className="text-xs font-medium text-success-700 dark:text-success-400">
                    Terisi: {formatDate(dailyStatus.date)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Total Form Filled Count */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengisian Data</p>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">
                  {stats.pss10Count}
                </h3>
                <p className="text-xs text-gray-400 mt-1">kali mengisi kuisioner harian</p>
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-500/10">
                <svg className="w-6 h-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Last Stress Level */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tingkat Stress Terakhir</p>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStressLevelColor(stats.lastStressLevel)}`}>
                  {getStressLevelLabel(stats.lastStressLevel)}
                </div>
                {stats.lastPSS10Score !== null && (
                  <p className="text-xs text-gray-400 mt-1">Skor PSS-10: {stats.lastPSS10Score}/40</p>
                )}
              </div>
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stress Level Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Grafik Perubahan Tingkat Stress
          </h2>
          {chartData.levels.length > 0 ? (
            <Chart options={chartOptions} series={chartSeries} type="line" height={280} />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p>Belum ada data untuk ditampilkan. Mulai isi PSS-10 untuk melihat grafik.</p>
            </div>
          )}
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success-500"></span>
              <span className="text-gray-500">Rendah</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-warning-500"></span>
              <span className="text-gray-500">Sedang</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error-500"></span>
              <span className="text-gray-500">Tinggi</span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            💡 Tips Mengelola Stress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">🌙 Tidur Cukup</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Usahakan tidur 7-9 jam setiap malam untuk menurunkan kadar hormon stres dan meredakan ketegangan.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">📱 Batasi Screen Time</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Kurangi penggunaan smartphone terutama sebelum tidur untuk kualitas istirahat lebih baik.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">🚶 Jalan Kaki</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Target 10.000 langkah sehari dapat membantu mengurangi tingkat stress.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">🧘 Meditasi</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Luangkan 5-10 menit untuk bernapas dalam dan menenangkan pikiran.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
