import React, { useState, useEffect } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { User, updateProfile } from "../../api/auth";

interface UserUniversityCardProps {
  user: User | null;
  onUpdate: () => void;
}

export default function UserUniversityCard({ user, onUpdate }: UserUniversityCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    university: "",
    major: "",
    semester: 0,
    residential_status: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        university: user.university || "",
        major: user.major || "",
        semester: user.semester || 0,
        residential_status: user.residential_status || "",
      });
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        university: formData.university,
        major: formData.major,
        semester: formData.semester,
        residential_status: formData.residential_status,
      });
      onUpdate();
      closeModal();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update university information");
    }
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Informasi Universitas
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Universitas
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.university || "-"}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  Jurusan
                </p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {user?.major || "-"}
                </p>
              </div>

              {user?.role === "student" && (
                <>
                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Semester
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user?.semester || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                      Status Tempat Tinggal
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user?.residential_status || "-"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Edit
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white no-scrollbar rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Ubah Informasi Universitas
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Perbarui informasi universitas Anda
            </p>
          </div>
          <form className="flex flex-col" onSubmit={handleSave}>
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Universitas</Label>
                  <Input
                    type="text"
                    value={formData.university}
                    onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Jurusan</Label>
                  <Input
                    type="text"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>

                {user?.role === "student" && (
                  <>
                    <div>
                      <Label>Semester</Label>
                      <Input
                        type="number"
                        value={formData.semester.toString()}
                        onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <Label>Status Tempat Tinggal</Label>
                      <div className="relative">
                        <select
                          value={formData.residential_status}
                          onChange={(e) => setFormData({ ...formData, residential_status: e.target.value })}
                          className="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                        >
                          <option value="" disabled className="dark:bg-gray-900">Pilih Status</option>
                          <option value="Kos" className="dark:bg-gray-900">Kos</option>
                          <option value="Rumah Orang Tua" className="dark:bg-gray-900">Rumah Orang Tua</option>
                          <option value="Asrama" className="dark:bg-gray-900">Asrama</option>
                          <option value="Lainnya" className="dark:bg-gray-900">Lainnya</option>
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button type="button" size="sm" variant="outline" onClick={closeModal}>
                Tutup
              </Button>
              <Button type="submit" size="sm">
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
