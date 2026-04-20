import { useLocation, useNavigate, useParams } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";

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
  day_type?: string;
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
    <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${cfg.cls}`}>{cfg.label}</span>
  ) : (
    <span className="text-gray-400">-</span>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | number }) => (
  <p className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
    <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-800 dark:text-white">{value ?? "-"}</span>
  </p>
);

export default function AdminDataDetail() {
  const navigate = useNavigate();
  const { date } = useParams<{ date: string }>();
  const location = useLocation();
  const row = location.state?.row as DataRow | undefined;

  if (!row) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => navigate("/admin/data")}
          className="flex items-center gap-2 text-brand-500 hover:underline text-sm"
        >
          ← Kembali ke Data Mahasiswa
        </button>
        <div className="p-6 rounded-2xl border border-error-200 bg-error-50 dark:bg-error-500/10 dark:border-error-500/30 text-error-600 text-sm">
          Data tidak ditemukan. Silakan kembali dan pilih ulang dari tabel.
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Detail Data ${row.student_name} – ${date} | Admin`}
        description="Detail data harian mahasiswa"
      />

      <div className="space-y-6">
        {/* Back + Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/data")}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            title="Kembali"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Detail Data Harian</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {row.student_name}
              {row.major ? ` · ${row.major}` : ""}
              {row.semester ? ` Sem ${row.semester}` : ""}
              {row.pa_name ? ` · PA: ${row.pa_name}` : ""}
              {" · "}
              <span className="font-medium text-gray-700 dark:text-gray-200">{date}</span>
            </p>
          </div>
        </div>

        {/* Summary strip */}
        <div className="flex flex-wrap gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600 font-bold text-sm">
              {row.student_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-gray-400">Mahasiswa</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">{row.student_name}</p>
              <p className="text-xs text-gray-400">{row.student_email}</p>
              {row.gender && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {row.gender === "L" ? "Laki-laki" : row.gender === "P" ? "Perempuan" : row.gender}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-4 flex flex-col justify-center">
            <p className="text-xs text-gray-400 mb-1">Tanggal</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-800 dark:text-white font-mono">{date}</p>
              {row.day_type === "ujian" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  Ujian
                </span>
              ) : row.day_type === "perkuliahan" ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Kuliah
                </span>
              ) : null}
            </div>
          </div>

          {row.pss10_total_score !== "" && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-4">
              <p className="text-xs text-gray-400 mb-1">Skor PSS-10</p>
              <p className="text-2xl font-bold text-brand-500">{row.pss10_total_score}<span className="text-sm font-normal text-gray-400">/40</span></p>
            </div>
          )}

          {row.pss10_stress_level && (
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-4 flex items-center">
              <div>
                <p className="text-xs text-gray-400 mb-1.5">Level Stress</p>
                {stressBadge(row.pss10_stress_level)}
              </div>
            </div>
          )}
        </div>

        {/* 3 Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Aktivitas Digital */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-base">
              <span className="text-xl">📱</span> Aktivitas Digital
            </h3>
            {row.smartphone_duration_hours !== "" ? (
              <div>
                <InfoRow label="Durasi Smartphone" value={row.smartphone_duration_hours} />
                <InfoRow label="Akses Medsos" value={row.social_media_access_count} />
                <InfoRow label="Durasi Medsos" value={row.social_media_duration_hours} />
                <InfoRow label="Mata Kuliah" value={row.course_count} />
                <InfoRow label="Tugas" value={row.task_count} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada data</p>
            )}
          </div>

          {/* Data Fisiologis */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-base">
              <span className="text-xl">❤️</span> Data Fisiologis
            </h3>
            {row.heart_rate_avg !== "" ? (
              <div>
                <InfoRow label="Heart Rate Avg" value={`${row.heart_rate_avg} bpm`} />
                <InfoRow label="Heart Rate Min" value={`${row.heart_rate_min} bpm`} />
                <InfoRow label="Heart Rate Max" value={`${row.heart_rate_max} bpm`} />
                <InfoRow label="Langkah" value={row.step_count} />
                <InfoRow label="Durasi Tidur" value={`${row.sleep_duration_hours} jam`} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada data</p>
            )}
          </div>

          {/* PSS-10 */}
          <div className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-base">
              <span className="text-xl">📋</span> PSS-10
            </h3>
            {row.pss10_total_score !== "" ? (
              <div className="space-y-3">
                <div className="grid grid-cols-5 gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map((q) => (
                    <div key={q} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <p className="text-xs text-gray-400 mb-1">Q{q}</p>
                      <p className="font-medium text-sm text-gray-800 dark:text-white">
                        {(row as unknown as Record<string, string | number>)[`pss10_q${q}`] !== ""
                          ? (row as unknown as Record<string, string | number>)[`pss10_q${q}`]
                          : "-"}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <p className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Skor</span>
                    <span className="font-bold text-brand-500">{row.pss10_total_score}/40</span>
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Level Stress</span>
                    {stressBadge(row.pss10_stress_level)}
                  </p>
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
