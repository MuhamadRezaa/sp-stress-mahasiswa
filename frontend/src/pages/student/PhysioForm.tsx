import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { http } from "../../api/http";

export default function PhysioForm() {
  const [formData, setFormData] = useState({
    activity_date: "",
    heart_rate_avg: "",
    heart_rate_min: "",
    heart_rate_max: "",
    step_count: "",
    sleep_duration_hours: "",
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
      await http.post("/student/physio", {
        activity_date: formData.activity_date,
        heart_rate_avg: parseFloat(formData.heart_rate_avg),
        heart_rate_min: parseInt(formData.heart_rate_min),
        heart_rate_max: parseInt(formData.heart_rate_max),
        step_count: parseInt(formData.step_count),
        sleep_duration_hours: parseFloat(formData.sleep_duration_hours),
      });
      setSuccess(true);
      setFormData({
        activity_date: "",
        heart_rate_avg: "",
        heart_rate_min: "",
        heart_rate_max: "",
        step_count: "",
        sleep_duration_hours: "",
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
        title="Input Data Fisiologis | Stress Prediction System"
        description="Form input data fisiologis harian"
      />
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white">
            Input Data Fisiologis
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
                <Label htmlFor="heart_rate_avg">Heart Rate Avg (bpm)</Label>
                <Input
                  type="number"
                  id="heart_rate_avg"
                  name="heart_rate_avg"
                  placeholder="70"
                  min="0"
                  value={formData.heart_rate_avg}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="heart_rate_min">Heart Rate Min (bpm)</Label>
                <Input
                  type="number"
                  id="heart_rate_min"
                  name="heart_rate_min"
                  placeholder="60"
                  min="0"
                  value={formData.heart_rate_min}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="heart_rate_max">Heart Rate Max (bpm)</Label>
                <Input
                  type="number"
                  id="heart_rate_max"
                  name="heart_rate_max"
                  placeholder="100"
                  min="0"
                  value={formData.heart_rate_max}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="step_count">Jumlah Langkah</Label>
                <Input
                  type="number"
                  id="step_count"
                  name="step_count"
                  placeholder="5000"
                  min="0"
                  value={formData.step_count}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label htmlFor="sleep_duration_hours">Durasi Tidur (jam)</Label>
                <Input
                  type="number"
                  id="sleep_duration_hours"
                  name="sleep_duration_hours"
                  placeholder="7"
                  step={0.5}
                  min="0"
                  value={formData.sleep_duration_hours}
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
