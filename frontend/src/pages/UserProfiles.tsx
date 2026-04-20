import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import UserMetaCard from "../components/UserProfile/UserMetaCard";
import UserInfoCard from "../components/UserProfile/UserInfoCard";
import UserUniversityCard from "../components/UserProfile/UserUniversityCard";
import PageMeta from "../components/common/PageMeta";
import Alert from "../components/ui/alert/Alert";
import { getMe, User } from "../api/auth";

export default function UserProfiles() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const location = useLocation();
  const requiresProfileCompletion = (location.state as { requiresProfileCompletion?: boolean })?.requiresProfileCompletion ?? false;

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await getMe();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (message: string) => {
    await fetchUser();
    window.dispatchEvent(new Event('profileUpdated'));
    setAlertMessage(message);
    setTimeout(() => {
      setAlertMessage(null);
    }, 4000); // Alert hilang otomatis setelah 4 detik
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-brand-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Profil Pengguna"
        description="Informasi profil pengguna"
      />
      <PageBreadcrumb pageTitle="Profil Pengguna" />
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <div className="space-y-6">
          {alertMessage && (
            <div className="animate-fade-in">
              <Alert variant="success" title="Sukses!" message={alertMessage} />
            </div>
          )}

          {requiresProfileCompletion && (
            <div className="p-4 rounded-2xl bg-warning-50 border border-warning-200 dark:bg-warning-500/10 dark:border-warning-500/20 animate-fade-in">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning-100 dark:bg-warning-500/20 flex items-center justify-center text-warning-600 dark:text-warning-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-warning-800 dark:text-warning-300 mb-1">Lengkapi Profil Anda Terlebih Dahulu</h5>
                  <p className="text-sm text-warning-700 dark:text-warning-400 leading-relaxed">
                    Sebelum menggunakan fitur aplikasi, mohon lengkapi data pribadi Anda meliputi <strong>jenis kelamin, umur, universitas, jurusan, semester, dan status tempat tinggal</strong>. Data ini diperlukan untuk keakuratan penelitian.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-brand-50/50 border border-brand-100 dark:bg-brand-500/5 dark:border-brand-500/10">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-brand-900 dark:text-brand-300 mb-1">Informasi Penting</h5>
                <p className="text-sm text-brand-700 dark:text-brand-400 leading-relaxed">
                  Bantu kami mendapatkan hasil riset yang akurat dengan melengkapi data pribadi Anda. Jangan khawatir, keamanan dan privasi data Anda adalah prioritas utama kami dan hanya digunakan untuk kepentingan analisis penelitian.
                </p>
              </div>
            </div>
          </div>

          <UserMetaCard user={user} onUpdate={() => handleUpdate("Foto profil Anda berhasil diperbarui.")} />
          <UserInfoCard user={user} onUpdate={() => handleUpdate("Informasi pribadi Anda berhasil diperbarui.")} />
          {(user?.role === "student" || user?.role === "pa") && (
            <UserUniversityCard user={user} onUpdate={() => handleUpdate("Informasi universitas berhasil diperbarui.")} />
          )}
        </div>
      </div>
    </>
  );
}
