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

export default function AdminDashboard() {
  const [trendData, setTrendData] = useState<StressTrendItem[]>([]);
  const [distribution, setDistribution] = useState<(StressDistribution & { total_students: number }) | null>(null);
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

  const trendOptions: ApexOptions = {
    chart: { type: "line", toolbar: { show: false }, fontFamily: "Inter, sans-serif" },
    stroke: { curve: "smooth", width: 3, colors: ["#6366F1"] },
    markers: { size: 5, colors: ["#6366F1"], strokeColors: "#fff", strokeWidth: 2 },
    xaxis: {
      categories: trendData.map((d) => d.date),
      labels: { style: { colors: "#9CA3AF", fontSize: "11px" }, rotate: -45 },
      axisBorder: { show: false },
    },
    yaxis: { min: 0, max: 40, labels: { style: { colors: "#9CA3AF" } } },
    grid: { borderColor: "#E5E7EB", strokeDashArray: 4 },
    tooltip: { y: { formatter: (v) => `Rata-rata: ${v}` } },
  };
  const trendSeries = [{ name: "Avg PSS-10", data: trendData.map((d) => d.avg_score) }];

  const donutOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif" },
    labels: ["Rendah", "Sedang", "Tinggi", "Belum Ada Data"],
    colors: ["#10B981", "#F59E0B", "#EF4444", "#9CA3AF"],
    legend: { position: "bottom" },
    dataLabels: { enabled: true, formatter: (val) => `${Math.round(Number(val))}%` },
    plotOptions: { pie: { donut: { size: "65%" } } },
  };
  const donutSeries = distribution
    ? [distribution.low, distribution.medium, distribution.high, distribution.no_data]
    : [];

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Chart */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Rata-rata PSS-10 (30 Hari Terakhir)</h2>
                {trendData.length > 0 ? (
                  <Chart options={trendOptions} series={trendSeries} type="line" height={250} />
                ) : (
                  <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Belum ada data trend</div>
                )}
              </div>

              {/* Donut Distribution */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Distribusi Tingkat Stress</h2>
                {distribution && (distribution.low + distribution.medium + distribution.high + distribution.no_data) > 0 ? (
                  <Chart options={donutOptions} series={donutSeries} type="donut" height={250} />
                ) : (
                  <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Belum ada data distribusi</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
