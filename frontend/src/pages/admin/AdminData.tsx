import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import PageMeta from "../../components/common/PageMeta";
import { http } from "../../api/http";
import { exportData } from "../../api/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

interface DataRow {
  student_id: number;
  student_name: string;
  student_email: string;
  gender: string;
  university: string;
  major: string;
  semester: string | number;
  pa_name: string;
  activity_date: string;
  day_type: string;
  pss10_total_score: string | number;
  pss10_stress_level: string;
  pss10_q1: string | number;
  pss10_q2: string | number;
  pss10_q3: string | number;
  pss10_q4: string | number;
  pss10_q5: string | number;
  pss10_q6: string | number;
  pss10_q7: string | number;
  pss10_q8: string | number;
  pss10_q9: string | number;
  pss10_q10: string | number;
  heart_rate_avg: string | number;
  heart_rate_min: string | number;
  heart_rate_max: string | number;
  step_count: string | number;
  sleep_duration_hours: string | number;
  smartphone_duration_hours: string | number;
  social_media_access_count: string | number;
  social_media_duration_hours: string | number;
  course_count: string | number;
  task_count: string | number;
}

const stressBadge = (level: string) => {
  const map: Record<string, { label: string; cls: string }> = {
    low: { label: "Rendah", cls: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400" },
    medium: { label: "Sedang", cls: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400" },
    high: { label: "Tinggi", cls: "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-400" },
  };
  const cfg = map[level];
  return cfg ? (
    <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${cfg.cls}`}>{cfg.label}</span>
  ) : (
    <span className="text-gray-400">-</span>
  );
};

const toIso = (d: Date) =>
  new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

const formatDisplay = (range: DateRange | undefined) => {
  if (!range?.from) return "Pilih rentang tanggal";
  if (!range.to) return toIso(range.from);
  return `${toIso(range.from)} → ${toIso(range.to)}`;
};

export default function AdminData() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<DataRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [range, setRange] = useState<DateRange | undefined>(undefined);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openModal = () => {
    setTempRange(range); // restore last applied range
    setShowModal(true);
  };

  const applyRange = () => {
    setRange(tempRange);
    setShowModal(false);
    fetchData(tempRange);
  };

  const cancelModal = () => {
    setTempRange(range); // discard changes
    setShowModal(false);
  };

  const fetchData = async (r?: DateRange) => {
    const activeRange = r ?? range;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ format: "json" });
      if (activeRange?.from) params.append("start_date", toIso(activeRange.from));
      if (activeRange?.to) params.append("end_date", toIso(activeRange.to));
      const res = await http.get<{ success: boolean; count: number; data: DataRow[] }>(
        `/admin/export?${params.toString()}`
      );
      setRows(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleReset = () => {
    setRange(undefined);
    setTempRange(undefined);
    setSearchQuery("");
    fetchData(undefined);
  };

  const filteredRows = rows.filter(
    (r) =>
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.activity_date.includes(searchQuery) ||
      (r.pa_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const goToDetail = (row: DataRow) => {
    navigate(`/admin/data/${row.student_id}/${row.activity_date}`, { state: { row } });
  };

  return (
    <>
      <PageMeta title="Data Mahasiswa | Admin" description="Data inputan harian mahasiswa" />
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-brand-500 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Data Mahasiswa</h1>
          <p className="text-indigo-200 text-sm">Lihat dan ekspor data inputan harian mahasiswa</p>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex flex-wrap gap-4 items-end">

            {/* Range Date Picker trigger button */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Rentang Tanggal
              </label>
              <button
                onClick={openModal}
                className={`flex items-center gap-2 px-4 py-2.5 border rounded-xl text-sm transition-colors min-w-[230px] text-left ${range?.from
                  ? "border-brand-400 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 dark:border-brand-500/40"
                  : "border-gray-200 text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                  }`}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 truncate">{formatDisplay(range)}</span>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Cari</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nama, email, PA, tanggal..."
                className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 w-52"
              />
            </div>

            <button
              onClick={() => fetchData()}
              className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Terapkan
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Reset
            </button>

            <div className="ml-auto">
              <button
                onClick={() => exportData(
                  range?.from ? toIso(range.from) : undefined,
                  range?.to ? toIso(range.to) : undefined
                )}
                className="flex items-center gap-2 px-5 py-2.5 bg-success-500 hover:bg-success-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          {!isLoading && (
            <p className="text-xs text-gray-400 mt-3">
              Menampilkan{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-200">{filteredRows.length}</span>{" "}
              dari {rows.length} baris data
              {range?.from && range?.to && (
                <span className="ml-1 text-brand-500">
                  ({toIso(range.from)} → {toIso(range.to)})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {isLoading ? (
            <div className="flex justify-center items-center h-60">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-500"></div>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-60 text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p>Tidak ada data yang sesuai filter.</p>
            </div>
          ) : (
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    {["Tanggal", "Jenis Hari", "Mahasiswa", "Prodi / Sem", "Dosen PA", "Level Stress", "Aksi"].map((h) => (
                      <TableCell
                        key={h}
                        isHeader
                        className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap"
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {filteredRows.map((row, idx) => (
                    <TableRow key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 font-mono whitespace-nowrap">
                        {row.activity_date}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {row.day_type === "ujian" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Ujian
                          </span>
                        ) : row.day_type === "perkuliahan" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            Kuliah
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <p className="font-medium text-gray-800 dark:text-white text-sm">{row.student_name}</p>
                        <p className="text-xs text-gray-400">{row.student_email}</p>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {row.major || "-"}{row.semester ? ` · Sem ${row.semester}` : ""}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-gray-500 text-theme-sm dark:text-gray-400 whitespace-nowrap">
                        {row.pa_name || "-"}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        {stressBadge(row.pss10_stress_level)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-start">
                        <button
                          onClick={() => goToDetail(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
                        >
                          Detail
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal Date Picker ───────────────────────────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={cancelModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                Pilih Rentang Tanggal
              </h3>
              <button
                onClick={cancelModal}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={setTempRange}
              disabled={{ after: new Date() }}
              numberOfMonths={1}
            />

            {/* Info + Action */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-2 flex items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tempRange?.from && tempRange?.to
                  ? `${toIso(tempRange.from)} → ${toIso(tempRange.to)}`
                  : tempRange?.from
                    ? `Mulai: ${toIso(tempRange.from)} — pilih tanggal akhir`
                    : "Pilih tanggal mulai"}
              </p>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => { setTempRange(undefined); }}
                  className="px-4 py-2 text-sm text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 rounded-xl transition-colors"
                >
                  Hapus
                </button>
                <button
                  onClick={cancelModal}
                  className="px-4 py-2 text-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={applyRange}
                  disabled={!tempRange?.from || !tempRange?.to}
                  className="px-4 py-2 text-sm bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
