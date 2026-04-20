import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  assignPA,
  getStressTrend,
  getStressDistribution,
  exportData,
  AdminUser,
  StressTrendItem,
  StressDistribution,
} from "../../api/admin";

type TabType = "users" | "assign" | "export" | "analytics";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // User form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    university: "",
    major: "",
    semester: "",
  });

  // Assign PA state
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedPaId, setSelectedPaId] = useState<number | null>(null);
  const [assignSuccess, setAssignSuccess] = useState("");

  // Export state
  const [exportStart, setExportStart] = useState("");
  const [exportEnd, setExportEnd] = useState("");

  // Analytics state
  const [trendData, setTrendData] = useState<StressTrendItem[]>([]);
  const [distribution, setDistribution] = useState<(StressDistribution & { total_students: number }) | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await listUsers(roleFilter || undefined);
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [trend, dist] = await Promise.all([getStressTrend(), getStressDistribution()]);
      setTrendData(trend);
      setDistribution(dist);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  useEffect(() => {
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab]);

  const students = users.filter((u) => u.role === "student");
  const paList = users.filter((u) => u.role === "pa");

  const handleCreateSubmit = async () => {
    try {
      await createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        university: formData.university || undefined,
        major: formData.major || undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
      });
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (e) {
      alert("Gagal membuat user");
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editUser) return;
    try {
      await updateUser(editUser.id, {
        name: formData.name,
        university: formData.university || undefined,
        major: formData.major || undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
      });
      setEditUser(null);
      resetForm();
      fetchUsers();
    } catch (e) {
      alert("Gagal memperbarui user");
    }
  };

  const handleDelete = async (userId: number, name: string) => {
    if (!confirm(`Hapus user "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteUser(userId);
      fetchUsers();
    } catch (e) {
      alert("Gagal menghapus user");
    }
  };

  const handleAssign = async () => {
    if (!selectedPaId || selectedStudents.length === 0) {
      alert("Pilih PA dan setidaknya satu mahasiswa");
      return;
    }
    try {
      await assignPA(selectedStudents, selectedPaId);
      setAssignSuccess(`${selectedStudents.length} mahasiswa berhasil di-assign ke PA`);
      setSelectedStudents([]);
      fetchUsers();
    } catch (e) {
      alert("Gagal assign PA");
    }
  };

  const openEdit = (user: AdminUser) => {
    setEditUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      university: user.university || "",
      major: user.major || "",
      semester: user.semester?.toString() || "",
    });
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", password: "", role: "student", university: "", major: "", semester: "" });
  };

  // Chart: Trend Line
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

  // Chart: Donut Distribution
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

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "users", label: "Manajemen User", icon: "👥" },
    { id: "assign", label: "Assign PA", icon: "🔗" },
    { id: "analytics", label: "Analytics", icon: "📊" },
    { id: "export", label: "Export Data", icon: "📥" },
  ];

  return (
    <>
      <PageMeta title="Admin Dashboard | Stress Prediction System" description="Halaman admin untuk manajemen user dan monitoring stress" />

      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">⚙️ Admin Dashboard</h1>
          <p className="text-indigo-200 text-sm">Kelola pengguna, assign PA, dan ekspor data riset</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: User Management ───────────────────────────────────────── */}
        {activeTab === "users" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Daftar Pengguna</h2>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                >
                  <option value="">Semua Role</option>
                  <option value="student">Mahasiswa</option>
                  <option value="pa">Dosen PA</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                onClick={() => { resetForm(); setShowCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Tambah User
              </button>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Nama</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">PA Bimbingan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Universitas</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-800 dark:text-white">{u.name}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === "admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" :
                            u.role === "pa" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" :
                            "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          }`}>
                            {u.role === "pa" ? "Dosen PA" : u.role === "student" ? "Mahasiswa" : "Admin"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.pa_name || "-"}</td>
                        <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.university || "-"}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => openEdit(u)}
                            className="text-brand-500 hover:text-brand-700 dark:text-brand-400 text-xs font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-error-500 hover:text-error-700 dark:text-error-400 text-xs font-medium"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="text-center py-10 text-gray-400">Tidak ada data pengguna.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Assign PA ─────────────────────────────────────────────── */}
        {activeTab === "assign" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🔗 Assign Dosen PA ke Mahasiswa</h2>

            {assignSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-success-50 border border-success-200 text-success-700 text-sm">
                ✅ {assignSuccess}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pilih PA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pilih Dosen PA</label>
                <select
                  value={selectedPaId ?? ""}
                  onChange={(e) => setSelectedPaId(e.target.value ? Number(e.target.value) : null)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="">-- Pilih Dosen PA --</option>
                  {paList.map((pa) => (
                    <option key={pa.id} value={pa.id}>{pa.name} ({pa.email})</option>
                  ))}
                </select>
              </div>

              {/* Action */}
              <div className="flex items-end">
                <button
                  onClick={handleAssign}
                  disabled={!selectedPaId || selectedStudents.length === 0}
                  className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Assign {selectedStudents.length > 0 ? `(${selectedStudents.length} dipilih)` : ""}
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pilih Mahasiswa</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onChange={(e) => setSelectedStudents(e.target.checked ? students.map((s) => s.id) : [])}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400">Nama</th>
                      <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400">Email</th>
                      <th className="text-left py-2 px-3 text-gray-500 dark:text-gray-400">PA Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {students.map((s) => (
                      <tr key={s.id} className={`transition-colors ${selectedStudents.includes(s.id) ? "bg-brand-50 dark:bg-brand-500/10" : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"}`}>
                        <td className="py-2.5 px-3">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(s.id)}
                            onChange={(e) =>
                              setSelectedStudents(e.target.checked
                                ? [...selectedStudents, s.id]
                                : selectedStudents.filter((id) => id !== s.id)
                              )
                            }
                            className="rounded"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-white">{s.name}</td>
                        <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400">{s.email}</td>
                        <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400">
                          {s.pa_name ? (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-xs">{s.pa_name}</span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600">Belum di-assign</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Analytics ─────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            {analyticsLoading ? (
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
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">📈 Rata-rata PSS-10 (30 Hari)</h2>
                    {trendData.length > 0 ? (
                      <Chart options={trendOptions} series={trendSeries} type="line" height={250} />
                    ) : (
                      <div className="flex items-center justify-center h-60 text-gray-400 text-sm">Belum ada data trend</div>
                    )}
                  </div>

                  {/* Distribution Donut */}
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">🍩 Distribusi Tingkat Stress</h2>
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
        )}

        {/* ── Tab: Export ────────────────────────────────────────────────── */}
        {activeTab === "export" && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">📥 Export Data Riset</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Export data flattened (CSV) yang menggabungkan identitas mahasiswa, PSS-10, data fisiologis, dan aktivitas digital dalam satu baris per hari.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Mulai</label>
                <input
                  type="date"
                  value={exportStart}
                  onChange={(e) => setExportStart(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Akhir</label>
                <input
                  type="date"
                  value={exportEnd}
                  onChange={(e) => setExportEnd(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => exportData(exportStart || undefined, exportEnd || undefined)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV
              </button>
              <button
                onClick={() => { setExportStart(""); setExportEnd(""); }}
                className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
              >
                Reset Filter
              </button>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">📋 Kolom yang diekspor:</h3>
              <div className="flex flex-wrap gap-2">
                {["student_id", "student_name", "university", "major", "semester", "gender", "age", "pa_name",
                  "activity_date", "pss10_q1..10", "pss10_total_score", "pss10_stress_level",
                  "heart_rate_avg/min/max", "step_count", "sleep_duration_hours",
                  "smartphone_duration_hours", "social_media_access/duration", "course_count", "task_count"
                ].map((col) => (
                  <span key={col} className="px-2 py-0.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-600 dark:text-gray-300">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal: Create / Edit User ────────────────────────────────────── */}
      {(showCreateModal || editUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              {editUser ? "Edit User" : "Tambah User Baru"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Nama lengkap"
                />
              </div>
              {!editUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      placeholder="email@contoh.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    >
                      <option value="student">Mahasiswa</option>
                      <option value="pa">Dosen PA</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Universitas</label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Nama universitas"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Program Studi</label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    placeholder="Prodi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                  <input
                    type="number"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    placeholder="1-14"
                    min={1} max={14}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowCreateModal(false); setEditUser(null); resetForm(); }}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Batal
              </button>
              <button
                onClick={editUser ? handleUpdateSubmit : handleCreateSubmit}
                className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl"
              >
                {editUser ? "Simpan" : "Buat User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
