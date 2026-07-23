import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  AdminUser,
} from "../../api/admin";

import { Modal } from "../../components/ui/modal";
import { ConfirmationModal } from "../../components/ui/modal/ConfirmationModal";

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "student",
    university: "", major: "", semester: "",
    gender: "", age: "", phone: "", residential_status: "", wearable_device: "",
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await listUsers(roleFilter || undefined);
      // Urutkan: Admin -> PA -> Student
      const roleOrder: Record<string, number> = { admin: 1, pa: 2, student: 3 };
      const sortedData = [...data].sort((a, b) =>
        (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99)
      );
      setUsers(sortedData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [roleFilter]);

  const resetForm = () =>
    setFormData({
      name: "", email: "", password: "", role: "student",
      university: "", major: "", semester: "",
      gender: "", age: "", phone: "", residential_status: "", wearable_device: "",
    });

  const handleCreate = async () => {
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
    } catch { alert("Gagal membuat user"); }
  };

  const handleUpdate = async () => {
    if (!editUser) return;
    try {
      await updateUser(editUser.id, {
        name: formData.name,
        role: formData.role,
        university: formData.university || undefined,
        major: formData.major || undefined,
        semester: formData.semester ? parseInt(formData.semester) : undefined,
        gender: (formData.gender as "L" | "P") || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        phone: formData.phone || undefined,
        residential_status: formData.residential_status || undefined,
        wearable_device: formData.wearable_device || undefined,
      });
      setEditUser(null);
      resetForm();
      fetchUsers();
    } catch { alert("Gagal memperbarui user"); }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      await deleteUser(userToDelete.id);
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch {
      alert("Gagal menghapus user");
    } finally {
      setIsProcessing(false);
    }
  };

  const openDeleteConfirm = (u: AdminUser) => {
    setUserToDelete(u);
    setShowDeleteModal(true);
  };

  const openEdit = (u: AdminUser) => {
    setEditUser(u);
    setFormData({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      university: u.university || "",
      major: u.major || "",
      semester: u.semester?.toString() || "",
      gender: u.gender || "",
      age: u.age?.toString() || "",
      phone: u.phone || "",
      residential_status: u.residential_status || "",
      wearable_device: u.wearable_device || "",
    });
  };

  return (
    <>
      <PageMeta title="Manajemen User | Admin" description="Kelola akun pengguna sistem" />
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-2xl bg-brand-500 p-6">
          <h1 className="text-2xl font-bold text-white mb-1">Manajemen User</h1>
          <p className="text-indigo-200 text-sm">Tambah, edit, dan hapus akun pengguna</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
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
                    <th className="text-left py-3 px-4 font-semibold text-gray-500 dark:text-gray-400">Dosen PA</th>
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
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === "admin" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" :
                          u.role === "pa" ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" :
                            "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300"
                          }`}>
                          {u.role === "pa" ? "Dosen PA" : u.role === "student" ? "Mahasiswa" : "Admin"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.pa_name || "-"}</td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-400">{u.university || "-"}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {u.role !== "admin" ? (
                          <>
                            <button
                              onClick={() => openEdit(u)}
                              className="text-brand-500 hover:text-brand-700 dark:text-brand-400 text-xs font-medium"
                            >Edit</button>
                            <button
                              onClick={() => openDeleteConfirm(u)}
                              className="text-error-500 hover:text-error-700 dark:text-error-400 text-xs font-medium"
                            >Hapus</button>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">-</span>
                        )}
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
      </div>

      {/* Modal Edit User */}
      <Modal
        isOpen={showCreateModal || !!editUser}
        onClose={() => { setShowCreateModal(false); setEditUser(null); resetForm(); }}
        className="max-w-md p-6"
        showCloseButton={false}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {editUser ? "Edit User" : "Tambah User Baru"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap</label>
            <input type="text" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
              placeholder="Nama lengkap" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
              <option value="student">Mahasiswa</option>
              <option value="pa">Dosen PA</option>
              {!editUser && <option value="admin">Admin</option>}
            </select>
          </div>

          {!editUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input type="password" value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="••••••••" />
              </div>
            </>
          )}
          {editUser && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <input type="text" value={formData.email} disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-800/50 dark:border-gray-800 dark:text-gray-400 cursor-not-allowed" />
            </div>
          )}

          {formData.role !== "admin" && (
            <>
              {/* Phone, Gender, and Age for PA and Student */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon</label>
                  <input type="text" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    placeholder="628xxx" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Umur</label>
                  <input type="number" value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    placeholder="Umur" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                <select value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="L">Laki-Laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Universitas</label>
                <input type="text" value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  placeholder="Nama universitas" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className={formData.role === "student" ? "col-span-1" : "col-span-2"}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jurusan</label>
                  <input type="text" value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                    placeholder="Jurusan" />
                </div>
                {formData.role === "student" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
                    <input type="number" value={formData.semester} min={1} max={14}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      placeholder="1-14" />
                  </div>
                )}
              </div>

              {/* Student-only fields */}
              {formData.role === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Tempat Tinggal</label>
                    <select value={formData.residential_status}
                      onChange={(e) => setFormData({ ...formData, residential_status: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200">
                      <option value="">Pilih Status</option>
                      <option value="Kos">Kos</option>
                      <option value="Rumah Orang Tua">Rumah Orang Tua</option>
                      <option value="Asrama">Asrama</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Perangkat Wearable</label>
                    <input type="text" value={formData.wearable_device}
                      onChange={(e) => setFormData({ ...formData, wearable_device: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                      placeholder="Xiaomi Mi Band 10, Huawei Band 11, dll." />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => { setShowCreateModal(false); setEditUser(null); resetForm(); }}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          >Batal</button>
          <button
            onClick={editUser ? handleUpdate : handleCreate}
            className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-xl transition-colors shadow-theme-xs active:scale-95"
          >{editUser ? "Simpan" : "Buat User"}</button>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Hapus Pengguna?"
        description={`Apakah Anda yakin ingin menghapus "${userToDelete?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        cancelText="Batal"
        isLoading={isProcessing}
      />
    </>
  );
}
