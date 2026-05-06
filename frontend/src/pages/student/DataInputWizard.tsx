import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { http } from "../../api/http";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

// Custom CSS for DayPicker v9 Dark Mode
const calendarDarkModeStyles = `
  /* Gaya Dasar Tanggal */
  .rdp-day {
    border-radius: 50% !important;
    transition: all 0.2s ease;
  }
  .dark .rdp-day {
    color: #f1f5f9 !important;
  }

  /* 1. TANGGAL YANG SUDAH DIISI (Exist) */
  .rdp-day_exist {
    background-color: #10b981 !important; /* Emerald 500 */
    color: white !important;
    font-weight: bold !important;
  }
  .dark .rdp-day_exist {
    background-color: #059669 !important; /* Emerald 600 */
    color: white !important;
  }

  /* 2. TANGGAL HARI INI (Today) */
  .rdp-day_today {
    border: 2px solid #3b82f6 !important; /* Blue 500 */
    color: #3b82f6 !important;
  }
  .dark .rdp-day_today {
    border-color: #60a5fa !important;
    color: #60a5fa !important;
  }

  /* 3. KOMBINASI: HARI INI + SUDAH DIISI */
  .rdp-day_today.rdp-day_exist {
    background-color: #10b981 !important;
    border: 2px solid #3b82f6 !important;
    color: white !important;
  }

  /* 4. TANGGAL TERPILIH (Selected) */
  .rdp-day_selected {
    background-color: #3b82f6 !important;
    color: white !important;
    border: none !important;
  }

  .dark .rdp-day:hover:not(.rdp-day_selected):not(.rdp-day_exist) {
    background-color: #334155 !important;
    color: white !important;
  }

  /* Navigasi dan Label */
  .dark .rdp-nav {
    color: #f1f5f9 !important;
  }
  .dark .rdp-caption_label {
    color: #f1f5f9 !important;
  }
  .dark .rdp-weekday {
    color: #94a3b8 !important;
  }
  .dark .rdp-button {
    color: inherit;
  }
  .dark .rdp-button:hover {
    background-color: #334155 !important;
  }
`;

// PSS-10 Questions (Q7-Q10 are reverse scored on backend)
const PSS_QUESTIONS = [
  "Seberapa sering kamu merasa kesal karena hal yang terjadi tiba-tiba?",
  "Seberapa sering kamu merasa tidak bisa mengendalikan hal-hal penting dalam hidupmu?",
  "Seberapa sering kamu merasa gugup atau tertekan (stres)?",
  "Seberapa sering kamu merasa kewalahan dengan semua hal yang harus kamu lakukan?",
  "Seberapa sering kamu merasa marah karena ada hal-hal yang tidak bisa kamu kendalikan?",
  "Seberapa sering kamu merasa masalah yang kamu hadapi terlalu banyak sampai sulit diatasi?",
  "Seberapa sering kamu berhasil mengatasi masalah kecil yang mengganggu?",
  "Seberapa sering kamu merasa mampu menghadapi perubahan yang terjadi hari ini?",
  "Seberapa sering kamu merasa percaya diri saat menghadapi masalah pribadi?",
  "Seberapa sering kamu merasa situasi yang kamu hadapi masih dalam kendalimu?",
];

const PSS_OPTIONS = [
  { value: 0, label: "Tidak Pernah" },
  { value: 1, label: "Hampir Tidak Pernah" },
  { value: 2, label: "Kadang-kadang" },
  { value: 3, label: "Cukup Sering" },
  { value: 4, label: "Sangat Sering" },
];

type Step = "date" | "digital" | "physio" | "pss10" | "result";

interface FormData {
  activity_date: string;
  day_type: string;
  // Digital
  smartphone_duration_hours: string;
  social_media_access_count: string;
  social_media_duration_hours: string;
  course_count: string;
  task_count: string;
  // Physio
  heart_rate_avg: string;
  heart_rate_min: string;
  heart_rate_max: string;
  step_count: string;
  sleep_duration_hours: string;
  // PSS-10
  pss_answers: number[];
}

interface ResultData {
  total_score: number;
  stress_level: string;
}

export default function DataInputWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>("date");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ResultData | null>(null);
  const [completedDates, setCompletedDates] = useState<Date[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const pss10Res = await http.get<{ success: boolean; data: { activity_date: string }[] }>("/student/pss10/history");
        if (pss10Res.data && pss10Res.data.data) {
          const dates = pss10Res.data.data.map(item => new Date(item.activity_date + "T00:00:00"));
          setCompletedDates(dates);
        }
      } catch (err) {
        console.error("Failed to fetch completed dates", err);
      }
    };
    fetchDates();
  }, []);

  const [formData, setFormData] = useState<FormData>({
    activity_date: "",
    day_type: "perkuliahan",
    smartphone_duration_hours: "",
    social_media_access_count: "",
    social_media_duration_hours: "",
    course_count: "",
    task_count: "",
    heart_rate_avg: "",
    heart_rate_min: "",
    heart_rate_max: "",
    step_count: "",
    sleep_duration_hours: "",
    pss_answers: Array(10).fill(-1),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePSSChange = (index: number, value: number) => {
    const newAnswers = [...formData.pss_answers];
    newAnswers[index] = value;
    setFormData((prev) => ({ ...prev, pss_answers: newAnswers }));
  };

  const getStepNumber = () => {
    switch (currentStep) {
      case "date": return 0;
      case "digital": return 1;
      case "physio": return 2;
      case "pss10": return 3;
      case "result": return 4;
      default: return 0;
    }
  };

  const steps = [
    { key: "date", label: "Tanggal" },
    { key: "digital", label: "Aktivitas Digital" },
    { key: "physio", label: "Data Fisiologis" },
    { key: "pss10", label: "PSS-10" },
    { key: "result", label: "Hasil" },
  ];

  const validateDate = () => {
    if (!formData.activity_date) {
      setError("Tanggal wajib diisi");
      return false;
    }
    return true;
  };

  const validateDigital = () => {
    if (!formData.smartphone_duration_hours || !formData.social_media_access_count ||
      !formData.social_media_duration_hours || !formData.course_count || !formData.task_count) {
      setError("Semua field wajib diisi");
      return false;
    }
    return true;
  };

  const validatePhysio = () => {
    if (!formData.heart_rate_avg || !formData.heart_rate_min || !formData.heart_rate_max ||
      !formData.step_count || !formData.sleep_duration_hours) {
      setError("Semua field wajib diisi");
      return false;
    }

    const min = parseInt(formData.heart_rate_min);
    const avg = parseFloat(formData.heart_rate_avg);
    const max = parseInt(formData.heart_rate_max);

    if (min > avg || avg > max) {
      setError("Urutan data detak jantung tidak logis! (Harus: Minimum <= Rata-rata <= Maksimum)");
      return false;
    }

    return true;
  };

  const validatePSS = () => {
    if (formData.pss_answers.some((a) => a === -1)) {
      setError("Harap jawab semua pertanyaan");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError("");

    if (currentStep === "date" && validateDate()) {
      setCurrentStep("digital");
    } else if (currentStep === "digital" && validateDigital()) {
      setCurrentStep("physio");
    } else if (currentStep === "physio" && validatePhysio()) {
      setCurrentStep("pss10");
    } else if (currentStep === "pss10" && validatePSS()) {
      submitAllData();
    }
  };

  const handleBack = () => {
    setError("");
    if (currentStep === "digital") setCurrentStep("date");
    else if (currentStep === "physio") setCurrentStep("digital");
    else if (currentStep === "pss10") setCurrentStep("physio");
  };

  const submitAllData = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Submit Digital Activity
      await http.post("/student/digital", {
        activity_date: formData.activity_date,
        day_type: formData.day_type,
        smartphone_duration_hours: formData.smartphone_duration_hours,
        social_media_access_count: formData.social_media_access_count,
        social_media_duration_hours: formData.social_media_duration_hours,
        course_count: formData.course_count,
        task_count: formData.task_count,
      });

      // Submit Physiological Data
      await http.post("/student/physio", {
        activity_date: formData.activity_date,
        heart_rate_avg: parseFloat(formData.heart_rate_avg),
        heart_rate_min: parseInt(formData.heart_rate_min),
        heart_rate_max: parseInt(formData.heart_rate_max),
        step_count: parseInt(formData.step_count),
        sleep_duration_hours: parseFloat(formData.sleep_duration_hours),
      });

      // Submit PSS-10
      const pss10Response = await http.post<{ success: boolean; total_score: number; stress_level: string }>("/student/pss10", {
        activity_date: formData.activity_date,
        q1: formData.pss_answers[0],
        q2: formData.pss_answers[1],
        q3: formData.pss_answers[2],
        q4: formData.pss_answers[3],
        q5: formData.pss_answers[4],
        q6: formData.pss_answers[5],
        q7: formData.pss_answers[6],
        q8: formData.pss_answers[7],
        q9: formData.pss_answers[8],
        q10: formData.pss_answers[9],
      });

      setResult({
        total_score: pss10Response.data.total_score,
        stress_level: pss10Response.data.stress_level,
      });
      setCurrentStep("result");
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

  const getStressLevelInfo = (level: string) => {
    switch (level) {
      case "low":
        return {
          label: "Rendah",
          color: "text-success-600 bg-success-100 dark:bg-success-500/20",
          emoji: "😊",
          description: "Tingkat stress Anda rendah. Tetap jaga pola hidup sehat!",
        };
      case "medium":
        return {
          label: "Sedang",
          color: "text-warning-600 bg-warning-100 dark:bg-warning-500/20",
          emoji: "😐",
          description: "Tingkat stress Anda sedang. Perhatikan keseimbangan aktivitas dan istirahat.",
        };
      case "high":
        return {
          label: "Tinggi",
          color: "text-error-600 bg-error-100 dark:bg-error-500/20",
          emoji: "😟",
          description: "Tingkat stress Anda tinggi. Pertimbangkan untuk berkonsultasi dengan profesional.",
        };
      default:
        return {
          label: "Tidak Diketahui",
          color: "text-gray-600 bg-gray-100",
          emoji: "❓",
          description: "",
        };
    }
  };

  return (
    <>
      <PageMeta
        title="Input Data Harian"
        description="Form input data harian"
      />

      <style>{calendarDarkModeStyles}</style>
      <div className="w-full">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${index <= getStepNumber()
                  ? "bg-brand-500 text-white"
                  : "bg-gray-200 text-gray-500 dark:bg-gray-700"
                  }`}>
                  {index < getStepNumber() ? "✓" : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-12 lg:w-20 h-1 mx-2 ${index < getStepNumber() ? "bg-brand-500" : "bg-gray-200 dark:bg-gray-700"
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="hidden sm:flex justify-between mt-2">
            {steps.map((step) => (
              <span key={step.key} className="text-xs text-gray-500 dark:text-gray-400">
                {step.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          {error && (
            <div className="mb-4 p-3 text-sm text-error-500 bg-error-50 dark:bg-error-500/10 rounded-lg">
              {error}
            </div>
          )}

          {/* Step: Date */}
          {currentStep === "date" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Pilih Tanggal Aktivitas
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Tanggal ini akan digunakan untuk semua data yang Anda input
                </p>
              </div>
              <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                <DayPicker
                  mode="single"
                  selected={formData.activity_date ? new Date(formData.activity_date + "T00:00:00") : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0];
                      setFormData((prev) => ({ ...prev, activity_date: d }));
                      setError(""); // Clear error if any
                    } else {
                      setFormData((prev) => ({ ...prev, activity_date: "" }));
                    }
                  }}
                  modifiers={{ exist: completedDates }}
                  modifiersClassNames={{
                    exist: "rdp-day_exist",
                  }}
                  disabled={[{ after: new Date() }, ...completedDates]} // Tidak bisa pilih masa depan dan yang sudah diisi
                />

                {formData.activity_date && (
                  <div className="mt-8 w-full">
                    <Label>Jenis Hari</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
                        <input
                          type="radio"
                          name="day_type"
                          value="perkuliahan"
                          checked={formData.day_type === "perkuliahan"}
                          onChange={(e) => setFormData(prev => ({ ...prev, day_type: e.target.value }))}
                          className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Kuliah Biasa</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-xl flex-1 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-gray-200 dark:border-gray-700">
                        <input
                          type="radio"
                          name="day_type"
                          value="ujian"
                          checked={formData.day_type === "ujian"}
                          onChange={(e) => setFormData(prev => ({ ...prev, day_type: e.target.value }))}
                          className="w-4 h-4 text-brand-500 bg-gray-100 border-gray-300 focus:ring-brand-500"
                        />
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-300">Minggu Ujian</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step: Digital Activity */}
          {currentStep === "digital" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Aktivitas Digital
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Data penggunaan smartphone dan media sosial
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smartphone_duration_hours">Screen Time (Durasi Smartphone)</Label>
                  <select
                    id="smartphone_duration_hours"
                    name="smartphone_duration_hours"
                    value={formData.smartphone_duration_hours}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-brand-500"
                  >
                    <option value="" disabled>Pilih durasi...</option>
                    <option value="<2 jam">&lt;2 jam</option>
                    <option value="2–4 jam">2–4 jam</option>
                    <option value="4–6 jam">4–6 jam</option>
                    <option value=">6 jam">&gt;6 jam</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="social_media_access_count">Frekuensi Akses Media Sosial</Label>
                  <select
                    id="social_media_access_count"
                    name="social_media_access_count"
                    value={formData.social_media_access_count}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-brand-500"
                  >
                    <option value="" disabled>Pilih frekuensi...</option>
                    <option value="Tidak pernah (0 kali)">Tidak pernah (0 kali)</option>
                    <option value="Jarang (1–3 kali)">Jarang (1–3 kali)</option>
                    <option value="Kadang-kadang (4–10 kali)">Kadang-kadang (4–10 kali)</option>
                    <option value="Sering (11–20 kali)">Sering (11–20 kali)</option>
                    <option value="Sangat sering (≥21 kali)">Sangat sering (&ge;21 kali)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="social_media_duration_hours">Durasi Media Sosial</Label>
                  <select
                    id="social_media_duration_hours"
                    name="social_media_duration_hours"
                    value={formData.social_media_duration_hours}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-brand-500"
                  >
                    <option value="" disabled>Pilih durasi...</option>
                    <option value="Tidak ada">Tidak ada</option>
                    <option value="<1 jam">&lt;1 jam</option>
                    <option value="1–3 jam">1–3 jam</option>
                    <option value=">3 jam">&gt;3 jam</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="course_count">Jumlah Mata Kuliah</Label>
                  <select
                    id="course_count"
                    name="course_count"
                    value={formData.course_count}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-brand-500"
                  >
                    <option value="" disabled>Pilih jumlah...</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="≥4">&ge;4</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="task_count">Jumlah Tugas Kuliah</Label>
                  <select
                    id="task_count"
                    name="task_count"
                    value={formData.task_count}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:focus:border-brand-500"
                  >
                    <option value="" disabled>Pilih jumlah...</option>
                    <option value="Tidak ada">Tidak ada</option>
                    <option value="1–2">1–2</option>
                    <option value="3–4">3–4</option>
                    <option value="≥4">&ge;4</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step: Physiological Data */}
          {currentStep === "physio" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Data Fisiologis
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Data kesehatan dan aktivitas fisik Anda dari Smartwatch/Smartband
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="heart_rate_min">Detak Jantung Minimum (bpm)</Label>
                  <Input
                    type="number"
                    id="heart_rate_min"
                    name="heart_rate_min"
                    placeholder="60"
                    min="0"
                    value={formData.heart_rate_min}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heart_rate_avg">Rata-Rata Detak Jantung (bpm)</Label>
                  <Input
                    type="number"
                    id="heart_rate_avg"
                    name="heart_rate_avg"
                    placeholder="70"
                    min="0"
                    value={formData.heart_rate_avg}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="heart_rate_max">Detak Jantung Maksimum (bpm)</Label>
                  <Input
                    type="number"
                    id="heart_rate_max"
                    name="heart_rate_max"
                    placeholder="100"
                    min="0"
                    value={formData.heart_rate_max}
                    onChange={handleChange}
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
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: PSS-10 */}
          {currentStep === "pss10" && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Kuesioner PSS-10
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Pilih jawaban sesuai kondisi Anda dalam 1 bulan terakhir
                </p>
              </div>
              <div className="space-y-4 pr-2">
                {PSS_QUESTIONS.map((question, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {index + 1}. {question}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {PSS_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className={`cursor-pointer px-3 py-2 rounded-lg text-xs sm:text-sm transition ${formData.pss_answers[index] === option.value
                            ? "bg-brand-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                        >
                          <input
                            type="radio"
                            name={`pss_q${index}`}
                            value={option.value}
                            checked={formData.pss_answers[index] === option.value}
                            onChange={() => handlePSSChange(index, option.value)}
                            className="sr-only"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step: Result */}
          {currentStep === "result" && result && (
            <div className="text-center space-y-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                  Hasil Pengukuran Stress
                </h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Berdasarkan data yang Anda inputkan pada {formData.activity_date}
                </p>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="text-6xl">
                  {getStressLevelInfo(result.stress_level).emoji}
                </div>
                <div className={`inline-block px-6 py-3 rounded-full text-lg font-semibold ${getStressLevelInfo(result.stress_level).color}`}>
                  Tingkat Stress: {getStressLevelInfo(result.stress_level).label}
                </div>
                <p className="text-2xl font-bold text-gray-800 dark:text-white">
                  Skor PSS-10: {result.total_score}/40
                </p>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  {getStressLevelInfo(result.stress_level).description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  ✅ Semua data berhasil disimpan
                </p>
                <Button
                  onClick={() => navigate("/")}
                  className="px-8"
                >
                  Kembali ke Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep !== "result" && (
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              {currentStep !== "date" ? (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  ← Kembali
                </Button>
              ) : (
                <div />
              )}
              <Button onClick={handleNext} disabled={isLoading}>
                {isLoading ? "Menyimpan..." : currentStep === "pss10" ? "Selesai & Lihat Hasil" : "Lanjut →"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
