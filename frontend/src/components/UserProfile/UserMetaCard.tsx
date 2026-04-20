import React, { useState, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import { User, uploadProfilePicture } from "../../api/auth";

interface UserMetaCardProps {
  user: User | null;
  onUpdate: () => void;
}

export default function UserMetaCard({ user, onUpdate }: UserMetaCardProps) {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getProfileImageUrl = () => {
    if (user?.profile_picture) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      return `${baseUrl}${user.profile_picture}`;
    }
    return "/images/defaultfoto.png";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Harap pilih file dengan format JPG, JPEG, PNG, atau WEBP.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran foto maksimal adalah 5MB.");
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setIsUploading(true);
      await uploadProfilePicture(selectedFile);
      onUpdate();
      window.dispatchEvent(new Event('profileUpdated'));
      closeModal();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Gagal mengunggah foto profil");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    closeModal();
  };

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              <img
                src={getProfileImageUrl()}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.name || "Loading..."}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role === "pa" ? "Dosen" : user?.role === "student" ? "Mahasiswa" : user?.role}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between xl:flex-col xl:items-end xl:gap-2">
            <button
              onClick={openModal}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ubah Foto Profil
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={handleCancel} className="max-w-[400px] m-4">
        <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8">
          <div className="text-center mb-6">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Ubah Foto Profil
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Unggah foto terbaru untuk profil Anda.
            </p>
          </div>

          <form className="flex flex-col items-center" onSubmit={handleUpload}>
            <div className="mb-6 relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 overflow-hidden border-2 border-dashed border-gray-300 rounded-full dark:border-gray-700 flex items-center justify-center relative bg-gray-50 dark:bg-gray-800/50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <img src={getProfileImageUrl()} alt="Current" className="w-full h-full object-cover opacity-50" />
                )}

                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <svg className="w-8 h-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-white text-xs font-medium">Pilih Foto</span>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />
            </div>

            <div className="flex w-full items-center gap-3 mt-4">
              <Button type="button" size="sm" variant="outline" onClick={handleCancel} className="w-full">
                Batal
              </Button>
              <Button type="submit" size="sm" disabled={!selectedFile || isUploading} className="w-full">
                {isUploading ? "Mengunggah..." : "Simpan Foto"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
