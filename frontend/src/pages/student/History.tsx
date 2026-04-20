import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { http } from "../../api/http";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table";

export interface DigitalData {
  activity_date: string;
  day_type?: string;
  smartphone_duration_hours: string;
  social_media_access_count: string;
  social_media_duration_hours: string;
  course_count: string;
  task_count: string;
}

export interface PhysioData {
  activity_date: string;
  heart_rate_avg: number;
  heart_rate_min: number;
  heart_rate_max: number;
  step_count: number;
  sleep_duration_hours: number;
}

export interface PSS10Data {
  activity_date: string;
  total_score: number;
  stress_level: string;
  answers: Record<string, number>;
}

export interface HistoryItem {
  date: string;
  stress_level: string | null;
  total_score: number | null;
  digital: DigitalData | null;
  physio: PhysioData | null;
  pss10: PSS10Data | null;
}

export default function History() {
  const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Standard default
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
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

        const dateMap = new Map<string, HistoryItem>();

        pss10Data.forEach((item) => {
          dateMap.set(item.activity_date, {
            date: item.activity_date,
            stress_level: item.stress_level,
            total_score: item.total_score,
            digital: null,
            physio: null,
            pss10: item,
          });
        });

        digitalData.forEach((item) => {
          const existing = dateMap.get(item.activity_date);
          if (existing) {
            existing.digital = item;
          } else {
            dateMap.set(item.activity_date, {
              date: item.activity_date,
              stress_level: null,
              total_score: null,
              digital: item,
              physio: null,
              pss10: null,
            });
          }
        });

        physioData.forEach((item) => {
          const existing = dateMap.get(item.activity_date);
          if (existing) {
            existing.physio = item;
          } else {
            dateMap.set(item.activity_date, {
              date: item.activity_date,
              stress_level: null,
              total_score: null,
              digital: null,
              physio: item,
              pss10: null,
            });
          }
        });

        const combined = Array.from(dateMap.values()).sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setHistoryData(combined);
      } catch {
        setError("Gagal memuat data history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(dateObj);
    const [year, month, day] = dateString.split("-");
    return `${dayName}, ${day}-${month}-${year}`;
  };

  const getStressLevelLabel = (level: string | null) => {
    switch (level) {
      case "low": return "Rendah";
      case "medium": return "Sedang";
      case "high": return "Tinggi";
      default: return "";
    }
  };

  const getStressLevelBadge = (level: string | null) => {
    if (!level) return null;
    const config = {
      low: { label: "Rendah", color: "bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-400" },
      medium: { label: "Sedang", color: "bg-warning-100 text-warning-700 dark:bg-warning-500/20 dark:text-warning-400" },
      high: { label: "Tinggi", color: "bg-error-100 text-error-700 dark:bg-error-500/20 dark:text-error-400" },
    };
    const cfg = config[level as keyof typeof config];
    return cfg ? (
      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${cfg.color}`}>
        {cfg.label}
      </span>
    ) : null;
  };

  // Filter Data Berdasarkan Search
  const filteredData = historyData.filter((item) => {
    const formattedDate = formatDate(item.date).toLowerCase();
    const stressLabel = getStressLevelLabel(item.stress_level).toLowerCase();
    return formattedDate.includes(searchTerm.toLowerCase()) ||
      stressLabel.includes(searchTerm.toLowerCase());
  });

  // Logika Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        title="Riwayat Data"
        description="Riwayat data dan hasil prediksi"
      />

      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Riwayat Data
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola dan pantau hasil prediksi stres harian Anda
            </p>
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Controls: Show Entries & Search */}
          <div className="flex flex-col px-6 py-5 gap-4 border-b border-gray-100 dark:border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 text-nowrap">Show</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="pl-3 pr-8 py-1.5 text-sm bg-transparent border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">entries</span>
            </div>

            <div className="relative max-w-xs w-full">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 text-sm bg-transparent border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
              />
            </div>
          </div>

          {filteredData.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-500 dark:text-gray-400">Data tidak ditemukan</p>
            </div>
          ) : (
            <>
              <div className="max-w-full overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-none">
                      <TableCell isHeader className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          Tanggal
                          <div className="flex flex-col text-gray-300 dark:text-gray-600">
                            <svg className="w-2 h-2 mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z" /></svg>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z" /></svg>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell isHeader className="px-6 py-4 text-nowrap">
                        <div className="flex items-center gap-2">
                          Jenis Hari
                          <div className="flex flex-col text-gray-300 dark:text-gray-600">
                            <svg className="w-2 h-2 mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z" /></svg>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z" /></svg>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell isHeader className="px-6 py-4 text-nowrap">
                        <div className="flex items-center gap-2">
                          Skor PSS-10
                          <div className="flex flex-col text-gray-300 dark:text-gray-600">
                            <svg className="w-2 h-2 mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z" /></svg>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z" /></svg>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell isHeader className="px-6 py-4 text-nowrap">
                        <div className="flex items-center gap-2">
                          Tingkat Stres
                          <div className="flex flex-col text-gray-300 dark:text-gray-600">
                            <svg className="w-2 h-2 mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16l-8-8z" /></svg>
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4l8 8z" /></svg>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell isHeader className="px-6 py-4">Aksi</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {currentRows.map((item) => (
                      <TableRow key={item.date} className="border-none hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400 text-theme-sm">
                          {formatDate(item.date)}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400 text-theme-sm">
                          {item.digital?.day_type === "ujian" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                              Ujian
                            </span>
                          ) : item.digital?.day_type === "perkuliahan" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Kuliah
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400 text-theme-sm">
                          {item.total_score !== null ? `${item.total_score}/40` : "-"}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {getStressLevelBadge(item.stress_level) || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <button
                            onClick={() => navigate(`/student/history/${item.date}`, { state: { item } })}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
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

              {/* Pagination Controls */}
              <div className="flex flex-col items-center justify-between gap-4 px-6 py-5 border-t border-gray-100 dark:border-white/[0.05] sm:flex-row">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing <span className="font-medium text-gray-800 dark:text-white">{indexOfFirstRow + 1}</span> to <span className="font-medium text-gray-800 dark:text-white">{Math.min(indexOfLastRow, filteredData.length)}</span> of <span className="font-medium text-gray-800 dark:text-white">{filteredData.length}</span> entries
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`flex items-center justify-center w-10 h-10 text-sm font-medium transition-colors rounded-lg border ${currentPage === page
                        ? "bg-brand-500 text-white border-brand-500 shadow-theme-xs"
                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center justify-center w-10 h-10 text-gray-500 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
