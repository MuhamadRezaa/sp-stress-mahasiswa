import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import { getMyStudents, StudentStatus } from "../../api/pa";
import { DataTable, Column } from "../../components/ui/table/DataTable";

export default function PAMahasiswa() {
  const [students, setStudents] = useState<StudentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentData = await getMyStudents();
        setStudents(studentData);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Columns for DataTable
  const columns: Column<StudentStatus>[] = [
    {
      header: "Nama",
      accessor: "name",
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white text-sm">
              {row.name}
            </p>
            <p className="text-xs text-gray-400">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Program Studi",
      accessor: "major",
      sortable: true,
      render: (row) => <span>{row.major || "-"}</span>,
    },
    {
      header: "Semester",
      accessor: "semester",
      sortable: true,
      align: "center" as const,
      render: (row) => <span>{row.semester || "-"}</span>,
    },
    {
      header: "Aksi",
      accessor: "id",
      align: "center" as const,
      render: (row) => (
        <button
          onClick={() => navigate(`/pa/students/${row.id}`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-500 bg-brand-50 hover:bg-brand-100 rounded-lg dark:bg-brand-500/10 dark:hover:bg-brand-500/20 transition-colors"
        >
          Detail
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ),
    },
  ];

  // Custom filter helper to support search by name, major or email
  const globalFilter = (row: StudentStatus, query: string) => {
    const name = row.name.toLowerCase();
    const major = (row.major || "").toLowerCase();
    const email = row.email.toLowerCase();
    return name.includes(query) || major.includes(query) || email.includes(query);
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
      <PageMeta title="Daftar Mahasiswa | Stress Prediction System" description="Daftar Mahasiswa Bimbingan Dosen PA" />

      <div className="space-y-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Daftar Mahasiswa Bimbingan
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Kelola dan pantau detail kondisi harian mahasiswa bimbingan Anda
            </p>
          </div>
        </div>

        {/* Student List Table Card */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <DataTable
            columns={columns}
            data={students}
            globalFilterFn={globalFilter}
            searchPlaceholder="Cari nama, email, prodi..."
            defaultRowsPerPage={10}
          />
        </div>
      </div>
    </>
  );
}
