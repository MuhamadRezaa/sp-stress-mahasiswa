import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { getMyStudents, getPAStressDistribution, StudentStatus, PAStressDistribution } from "../../api/pa";

export default function PADashboard() {
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [distribution, setDistribution] = useState<PAStressDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentData, distData] = await Promise.all([
          getMyStudents(),
          getPAStressDistribution(),
        ]);
        setStudents(studentData);
        setDistribution(distData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Donut chart
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

  const completedToday = students.filter((s) => s.today_status.all_complete).length;
  const highStress = students.filter((s) => s.last_stress.level === "high").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Dashboard PA | Stress Prediction System" description="Dashboard Dosen PA untuk monitoring stress mahasiswa bimbingan" />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard Dosen Pembimbing Akademik</h1>
          <p className="text-blue-100 text-sm">Pantau kondisi stress mahasiswa bimbingan</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Mahasiswa", value: students.length, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10" },
            { label: "Lengkap Hari Ini", value: completedToday, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10" },
            { label: "Stress Tinggi", value: highStress, color: "text-error-600", bg: "bg-error-50 dark:bg-error-500/10" },
            { label: "Belum Isi Hari Ini", value: students.filter((s) => !s.today_status.all_complete).length, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10" },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border border-gray-200 ${item.bg} p-5 dark:border-gray-800`}>
              <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Information Panel */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">💡 Panduan Pemantauan Akademik</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Sebagai Dosen Pembimbing Akademik (PA), Anda memiliki peran penting dalam memantau kesehatan mental mahasiswa bimbingan Anda. Sistem ini menggunakan data kuesioner PSS-10, aktivitas digital, serta data wearable device untuk memberikan prediksi tingkat stress harian mahasiswa.
              </p>
              <div className="space-y-3">
                <div className="flex gap-3 items-start">
                  <span className="text-lg">🚨</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Tindakan Segera untuk Stress Tinggi</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Hubungi mahasiswa secara pribadi jika mereka berada di tingkat stress tinggi secara terus-menerus guna memberikan arahan bimbingan akademik atau konseling kampus.</p>
                  </div>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="text-lg">📅</span>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white">Kelengkapan Data Harian</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pastikan mahasiswa bimbingan Anda aktif menginput aktivitas harian mereka untuk menjaga akurasi hasil analisis prediksi tingkat stress.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-400">
              *Data diperbarui secara berkala sesuai dengan pengisian mandiri mahasiswa.
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🍩 Distribusi Stress</h2>
            {distribution && (distribution.low + distribution.medium + distribution.high + distribution.no_data) > 0 ? (
              <Chart options={donutOptions} series={donutSeries} type="donut" height={280} />
            ) : (
              <div className="flex items-center justify-center h-60 text-gray-400 text-sm text-center">
                Belum ada data untuk ditampilkan.
              </div>
            )}

            {/* Legend detail */}
            {distribution && (
              <div className="mt-4 space-y-2">
                {[
                  { label: "Rendah (0-13)", value: distribution.low, color: "bg-[#10B981]" },
                  { label: "Sedang (14-26)", value: distribution.medium, color: "bg-[#F59E0B]" },
                  { label: "Tinggi (27-40)", value: distribution.high, color: "bg-[#EF4444]" },
                  { label: "Belum Ada Data", value: distribution.no_data, color: "bg-gray-400" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                    </div>
                    <span className="font-semibold text-gray-800 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
