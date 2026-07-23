import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import {
  getStressTrend,
  getStressDistribution,
  StressTrendItem,
  StressDistribution,
} from "../../api/admin";
import DonutPieChartTwo from "../../components/charts/pie/DonutPieChartTwo";

export default function AdminDashboard() {
  const [trendData, setTrendData] = useState<StressTrendItem[]>([]);
  const [distribution, setDistribution] = useState<(StressDistribution & { total_students: number }) | null>(null);
  const [trendPeriod, setTrendPeriod] = useState<"7" | "30">("7");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [trend, dist] = await Promise.all([getStressTrend(), getStressDistribution()]);
        setTrendData(trend);
        setDistribution(dist);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getFilledTrendData = (rawData: StressTrendItem[], period: "7" | "30") => {
    const dataMap = new Map<string, StressTrendItem>();
    rawData.forEach((item) => {
      dataMap.set(item.date, item);
    });

    const filledData: StressTrendItem[] = [];
    const today = new Date();

    if (period === "7") {
      // Current Calendar Week (Monday to Sunday)
      const day = today.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMonday);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        const existing = dataMap.get(dateStr);
        if (existing) {
          filledData.push(existing);
        } else {
          filledData.push({
            date: dateStr,
            avg_score: 0,
            low: 0,
            medium: 0,
            high: 0,
          });
        }
      }
    } else {
      // Current Calendar Month (1st to last day of current month)
      const year = today.getFullYear();
      const month = today.getMonth();
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= totalDays; i++) {
        const d = new Date(year, month, i);
        
        const yearStr = d.getFullYear();
        const monthStr = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

        const existing = dataMap.get(dateStr);
        if (existing) {
          filledData.push(existing);
        } else {
          filledData.push({
            date: dateStr,
            avg_score: 0,
            low: 0,
            medium: 0,
            high: 0,
          });
        }
      }
    }

    return filledData;
  };

  const displayedTrendData = getFilledTrendData(trendData, trendPeriod);

  const trendOptions: ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    colors: ["#22C55E", "#F97316", "#EF4444"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 3,
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"]
    },
    xaxis: {
      categories: displayedTrendData.map((d) => {
        try {
          const dateObj = new Date(d.date);
          const formatOptions: Intl.DateTimeFormatOptions =
            trendPeriod === "7"
              ? { day: "numeric", month: "short" }
              : { day: "numeric" };
          return dateObj.toLocaleDateString("id-ID", formatOptions);
        } catch {
          return d.date;
        }
      }),
      labels: { style: { colors: "#9CA3AF", fontSize: "11px" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9CA3AF" } } },
    grid: { borderColor: "#F3F4F6", strokeDashArray: 4 },
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "12px",
      fontFamily: "Inter, sans-serif",
    },
    tooltip: {
      y: {
        formatter: (v) => `${v} Data`
      }
    },
  };
  const trendSeries = [
    { name: "Stress Rendah", data: displayedTrendData.map((d) => d.low) },
    { name: "Stress Sedang", data: displayedTrendData.map((d) => d.medium) },
    { name: "Stress Tinggi", data: displayedTrendData.map((d) => d.high) },
  ];

  return (
    <>
      <PageMeta title="Dashboard Admin | Stress Prediction System" description="Analytics stress mahasiswa" />
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-brand-500 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Dashboard</h1>
          <p className="text-indigo-200 text-sm">Ringkasan dan analitik kondisi stress mahasiswa</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            {distribution && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Mahasiswa", value: distribution.total_students, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10" },
                  { label: "Stress Rendah", value: distribution.low, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
                  { label: "Stress Sedang", value: distribution.medium, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
                  { label: "Stress Tinggi", value: distribution.high, color: "text-error-600", bg: "bg-error-50 dark:bg-error-500/10" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-2xl border border-gray-200 ${item.bg} p-5 dark:border-gray-800`}>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {/* Trend Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Tren Tingkat Stress Mahasiswa</h2>
                    {trendPeriod === "30" && (
                      <span className="text-xs text-gray-400 font-normal block mt-0.5">
                        Bulan {new Date().toLocaleDateString("id-ID", { month: "long" })}
                      </span>
                    )}
                  </div>
                  <select
                    value={trendPeriod}
                    onChange={(e) => setTrendPeriod(e.target.value as "7" | "30")}
                    className="text-xs bg-gray-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  >
                    <option value="7">Minggu Ini</option>
                    <option value="30">Bulan Ini</option>
                  </select>
                </div>
                {displayedTrendData.length > 0 ? (
                  <Chart options={trendOptions} series={trendSeries} type="bar" height={250} />
                ) : (
                  <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Belum ada data trend</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donut Distribution */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Tingkat Stress</h2>
                {distribution && (distribution.low + distribution.medium + distribution.high) > 0 ? (
                  <DonutPieChartTwo
                    series={[distribution.low, distribution.medium, distribution.high]}
                    labels={["Rendah", "Sedang", "Tinggi"]}
                    colors={["#22C55E", "#F97316", "#EF4444"]}
                    totalLabel="Tingkat Stress Mahasiswa"
                    unit="Data"
                  />
                ) : (
                  <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Belum ada data distribusi</div>
                )}
              </div>
            </div>

            {/* Mock Section: Insights & Urgent Action */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Urgent Action List */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Mahasiswa Butuh Penanganan Segera</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Krisis
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="pb-3 font-medium">Nama</th>
                        <th className="pb-3 font-medium">Prodi</th>
                        <th className="pb-3 font-medium">Stress</th>
                        <th className="pb-3 font-medium text-right">Dosen PA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800/50 text-sm">
                      {[
                        { name: "Ahmad Fauzi", prodi: "Teknik Informatika", level: "Tinggi", sem: 6, pa: "Dr. Eng. Heri" },
                        { name: "Siti Rahma", prodi: "Sistem Informasi", level: "Tinggi", sem: 8, pa: "Indah Lestari, M.T." },
                        { name: "Budi Santoso", prodi: "Teknik Elektro", level: "Tinggi", sem: 4, pa: "Dr. Ahmad Yusuf" },
                      ].map((student, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01]">
                          <td className="py-3 font-medium text-gray-800 dark:text-gray-200">
                            {student.name}
                            <span className="text-xs text-gray-400 block font-normal">Semester {student.sem}</span>
                          </td>
                          <td className="py-3 text-gray-500 dark:text-gray-400">{student.prodi}</td>
                          <td className="py-3">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                              {student.level}
                            </span>
                          </td>
                          <td className="py-3 text-right text-gray-500 dark:text-gray-400 font-medium">
                            {student.pa}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Correlation Stats (Faktor Fisik vs Stress) */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Analisis Faktor Kesehatan (Rata-rata)</h2>
                <div className="space-y-4">
                  {[
                    { label: "Waktu Tidur Harian", unit: "Jam/Hari", high: "4.8 jam", low: "7.2 jam", desc: "Mahasiswa stress tinggi memiliki waktu tidur 33% lebih sedikit." },
                    { label: "Penggunaan Smartphone", unit: "Jam/Hari", high: "6.5 jam", low: "3.8 jam", desc: "Aktivitas digital lebih tinggi ditemukan pada kelompok stress tinggi." },
                    { label: "Aktivitas Langkah Kaki", unit: "Langkah/Hari", high: "3,200 lkh", low: "6,500 lkh", desc: "Tingkat aktivitas fisik kelompok stress rendah jauh lebih aktif." }
                  ].map((factor, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-gray-800/40">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{factor.label}</h4>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">{factor.unit}</span>
                        </div>
                        <div className="flex gap-3 text-xs font-bold">
                          <span className="text-red-600 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded">High: {factor.high}</span>
                          <span className="text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">Low: {factor.low}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{factor.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div >
    </>
  );
}
