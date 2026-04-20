import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import { getMyStudents, getPAStressDistribution, StudentStatus, PAStressDistribution } from "../../api/pa";

export default function PADashboard() {
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [distribution, setDistribution] = useState<PAStressDistribution | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  const stressColor = (level: string | null) => {
    if (level === "low") return "text-success-600 bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/30";
    if (level === "medium") return "text-warning-600 bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/30";
    if (level === "high") return "text-error-600 bg-error-50 dark:bg-error-500/10 border-error-200 dark:border-error-500/30";
    return "text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  };

  const stressLabel = (level: string | null) => {
    if (level === "low") return "Rendah";
    if (level === "medium") return "Sedang";
    if (level === "high") return "Tinggi";
    return "Belum ada data";
  };

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
          <h1 className="text-2xl font-bold text-white mb-1">🎓 Dashboard Dosen PA</h1>
          <p className="text-blue-100 text-sm">Pantau kondisi stress mahasiswa bimbingan Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Mahasiswa", value: students.length, color: "text-brand-500", bg: "bg-brand-50 dark:bg-brand-500/10", icon: "👥" },
            { label: "Lengkap Hari Ini", value: completedToday, color: "text-success-600", bg: "bg-success-50 dark:bg-success-500/10", icon: "✅" },
            { label: "Stress Tinggi", value: highStress, color: "text-error-600", bg: "bg-error-50 dark:bg-error-500/10", icon: "⚠️" },
            { label: "Belum Isi Hari Ini", value: students.filter((s) => !s.today_status.all_complete).length, color: "text-warning-600", bg: "bg-warning-50 dark:bg-warning-500/10", icon: "📋" },
          ].map((item) => (
            <div key={item.label} className={`rounded-2xl border border-gray-200 ${item.bg} p-5 dark:border-gray-800`}>
              <span className="text-2xl">{item.icon}</span>
              <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📋 Daftar Mahasiswa Bimbingan</h2>

            {students.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p>Belum ada mahasiswa yang di-assign ke Anda.</p>
                <p className="text-sm mt-1">Hubungi Admin untuk assignment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {students.map((student) => (
                  <div key={student.id} className="rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          student.last_stress.level === "high" ? "bg-error-100 text-error-600" :
                          student.last_stress.level === "medium" ? "bg-warning-100 text-warning-600" :
                          student.last_stress.level === "low" ? "bg-success-100 text-success-600" :
                          "bg-gray-100 text-gray-500"
                        }`}>
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {student.name}
                            {student.last_stress.level === "high" && (
                              <span className="ml-2 text-xs text-error-500">🚨 High Stress</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{student.major || student.email} {student.semester ? `• Sem ${student.semester}` : ""}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status chips */}
                        <div className="hidden sm:flex items-center gap-1.5">
                          <div title="Aktivitas Digital" className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${student.today_status.digital_activity ? "bg-success-100 text-success-600" : "bg-gray-100 text-gray-400"}`}>
                            {student.today_status.digital_activity ? "✓" : "–"}
                          </div>
                          <div title="Data Fisiologis" className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${student.today_status.physiological ? "bg-success-100 text-success-600" : "bg-gray-100 text-gray-400"}`}>
                            {student.today_status.physiological ? "✓" : "–"}
                          </div>
                          <div title="PSS-10" className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${student.today_status.pss10 ? "bg-success-100 text-success-600" : "bg-gray-100 text-gray-400"}`}>
                            {student.today_status.pss10 ? "✓" : "–"}
                          </div>
                        </div>

                        {/* Stress Level Badge */}
                        {student.last_stress.level && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${stressColor(student.last_stress.level)}`}>
                            {stressLabel(student.last_stress.level)}
                          </span>
                        )}

                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === student.id ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded: Trend Chart */}
                    {expandedId === student.id && (
                      <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/30">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                          <div>
                            <p className="text-gray-400 text-xs">Email</p>
                            <p className="text-gray-700 dark:text-gray-200">{student.email}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Skor PSS-10 Terakhir</p>
                            <p className="text-gray-700 dark:text-gray-200">
                              {student.last_stress.score !== null ? `${student.last_stress.score}/40` : "Belum ada data"}
                              {student.last_stress.date && <span className="text-gray-400 ml-1 text-xs">({student.last_stress.date})</span>}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Status Hari Ini</p>
                            <div className="flex gap-1.5 mt-0.5">
                              {["digital_activity", "physiological", "pss10"].map((key) => (
                                <span key={key} className={`px-2 py-0.5 rounded text-xs ${(student.today_status as Record<string, boolean>)[key] ? "bg-success-100 text-success-600" : "bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"}`}>
                                  {key === "digital_activity" ? "Digital" : key === "physiological" ? "Physio" : "PSS-10"}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Mini trend chart */}
                        {student.trend.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Trend Stress (30 hari)</p>
                            <Chart
                              options={{
                                chart: { type: "line", toolbar: { show: false }, sparkline: { enabled: false } },
                                stroke: { curve: "smooth", width: 2, colors: ["#6366F1"] },
                                markers: {
                                  size: 4,
                                  colors: student.trend.map((t) => t.level === "low" ? "#10B981" : t.level === "medium" ? "#F59E0B" : "#EF4444"),
                                  strokeColors: "#fff", strokeWidth: 1,
                                },
                                xaxis: {
                                  categories: student.trend.map((t) => t.date),
                                  labels: { style: { colors: "#9CA3AF", fontSize: "9px" } },
                                  axisBorder: { show: false },
                                },
                                yaxis: {
                                  min: 0, max: 40,
                                  labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
                                },
                                grid: { borderColor: "#E5E7EB", strokeDashArray: 3 },
                                tooltip: { y: { formatter: (v) => `PSS-10: ${v}` } },
                              }}
                              series={[{ name: "Skor PSS-10", data: student.trend.map((t) => t.score) }]}
                              type="line"
                              height={120}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                  { label: "Rendah (0-13)", value: distribution.low, color: "bg-success-500" },
                  { label: "Sedang (14-26)", value: distribution.medium, color: "bg-warning-500" },
                  { label: "Tinggi (27-40)", value: distribution.high, color: "bg-error-500" },
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
