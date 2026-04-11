import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { http } from "../../api/http";

export default function DigitalForm() {
  const [formData, setFormData] = useState({
    activity_date: "",
    smartphone_duration_hours: "",
    social_media_access_count: "",
    social_media_duration_hours: "",
    course_count: "",
    task_count: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      await http.post("/student/digital", {
        activity_date: formData.activity_date,
        smartphone_duration_hours: parseFloat(formData.smartphone_duration_hours),
        social_media_access_count: parseInt(formData.social_media_access_count),
        social_media_duration_hours: parseFloat(formData.social_media_duration_hours),
        course_count: parseInt(formData.course_count),
        task_count: parseInt(formData.task_count),
      });
      setSuccess(true);
      setFormData({
        activity_date: "",
        smartphone_duration_hours: "",
        social_media_access_count: "",
        social_media_duration_hours: "",
        course_count: "",
        task_count: "",
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || "Gagal menyimpan data.");
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Input Aktivitas Digital | Stress Prediction System"
        description="Form input aktivitas digital harian"
      />
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Input Aktivitas Digital
          </h2>

          {success && (
            <div className="mb-4 p-3 text-sm text-success-600 bg-success-50 dark:bg-success-500/10 rounded-lg">
              Data berhasil disimpan!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="activity_date">Tanggal Aktivitas</Label>
              <Input
                type="date"
                id="activity_date"
                name="activity_date"
                value={formData.activity_date}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smartphone_duration_hours">Durasi Smartphone (jam)</Label>
                <Input
                  type="number"
                  id="smartphone_duration_hours"
                  name="smartphone_duration_hours"
                  placeholder="0"
                  step={0.5}
                  min="0"
                  value={formData.smartphone_duration_hours}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="social_media_access_count">Akses Media Sosial (kali)</Label>
                <Input
                  type="number"
                  id="social_media_access_count"
                  name="social_media_access_count"
                  placeholder="0"
                  min="0"
                  value={formData.social_media_access_count}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="social_media_duration_hours">Durasi Media Sosial (jam)</Label>
                <Input
                  type="number"
                  id="social_media_duration_hours"
                  name="social_media_duration_hours"
                  placeholder="0"
                  step={0.5}
                  min="0"
                  value={formData.social_media_duration_hours}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="course_count">Jumlah Mata Kuliah</Label>
                <Input
                  type="number"
                  id="course_count"
                  name="course_count"
                  placeholder="0"
                  min="0"
                  value={formData.course_count}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="task_count">Jumlah Tugas</Label>
                <Input
                  type="number"
                  id="task_count"
                  name="task_count"
                  placeholder="0"
                  min="0"
                  value={formData.task_count}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
