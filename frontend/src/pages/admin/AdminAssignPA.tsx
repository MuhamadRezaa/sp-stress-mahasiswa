import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import { listUsers, assignPA, AdminUser } from "../../api/admin";

export default function AdminAssignPA() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectedPaId, setSelectedPaId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const students = users.filter((u) => u.role === "student");
  const paList = users.filter((u) => u.role === "pa");

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedPaId || selectedStudents.length === 0) {
      alert("Pilih Dosen PA dan setidaknya satu mahasiswa.");
      return;
    }
    try {
      await assignPA(selectedStudents, selectedPaId);
      setSuccessMsg(`${selectedStudents.length} mahasiswa berhasil di-assign.`);
      setSelectedStudents([]);
      fetchUsers();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch { alert("Gagal assign PA"); }
  };

  const handleUnassign = async (studentId: number) => {
    if (!confirm("Lepas assignment PA dari mahasiswa ini?")) return;
    try {
      await assignPA([studentId], null as unknown as number);
      fetchUsers();
    } catch { alert("Gagal melepas assignment"); }
  };

  return (
    <>
      <PageMeta title="Assign PA | Admin" description="Assign Dosen PA ke mahasiswa bimbingan" />
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-brand-500 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Assign Dosen PA</h1>
          <p className="text-indigo-200 text-sm">Tetapkan Dosen Pembimbing Akademik untuk mahasiswa</p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-xl bg-success-50 border border-success-200 dark:bg-success-500/10 dark:border-success-500/30 text-success-700 dark:text-success-300 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMsg}
          </div>
        )}

        {/* Assignment Panel */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Pilih PA */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pilih Dosen PA
              </label>
              <select
                value={selectedPaId ?? ""}
                onChange={(e) => setSelectedPaId(e.target.value ? Number(e.target.value) : null)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              >
                <option value="">-- Pilih Dosen PA --</option>
                {paList.map((pa) => (
                  <option key={pa.id} value={pa.id}>{pa.name}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cari Mahasiswa
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama atau email..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Tombol Assign */}
            <div className="lg:col-span-1 flex items-end">
              <button
                onClick={handleAssign}
                disabled={!selectedPaId || selectedStudents.length === 0}
                className="w-full px-4 py-3 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
              >
                {selectedStudents.length > 0
                  ? `Assign ${selectedStudents.length} Mahasiswa`
                  : "Assign Mahasiswa"}
              </button>
            </div>
          </div>

          {/* Tabel Mahasiswa */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={(e) =>
                          setSelectedStudents(e.target.checked ? filteredStudents.map((s) => s.id) : [])
                        }
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Mahasiswa</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Program Studi</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Dosen PA Saat Ini</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      className={`transition-colors ${selectedStudents.includes(s.id)
                        ? "bg-brand-50 dark:bg-brand-500/10"
                        : "hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                        }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(s.id)}
                          onChange={(e) =>
                            setSelectedStudents(
                              e.target.checked
                                ? [...selectedStudents, s.id]
                                : selectedStudents.filter((id) => id !== s.id)
                            )
                          }
                          className="rounded"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-gray-800 dark:text-white">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">
                        {s.major || "-"} {s.semester ? `(Sem ${s.semester})` : ""}
                      </td>
                      <td className="py-3 px-4">
                        {s.pa_name ? (
                          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 rounded-full text-xs font-medium">
                            {s.pa_name}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600 text-xs">Belum di-assign</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {s.pa_name && (
                          <button
                            onClick={() => handleUnassign(s.id)}
                            className="text-xs text-error-500 hover:text-error-700 font-medium"
                          >
                            Lepas
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-10 text-gray-400">
                  {searchQuery ? "Tidak ada mahasiswa yang cocok." : "Belum ada data mahasiswa."}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
