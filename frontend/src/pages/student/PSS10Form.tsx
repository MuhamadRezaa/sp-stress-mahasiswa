import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { http } from "../../api/http";

const PSS_QUESTIONS = [
  "Seberapa sering Anda merasa kesal karena sesuatu yang terjadi secara tidak terduga?",
  "Seberapa sering Anda merasa tidak mampu mengendalikan hal-hal penting dalam hidup Anda?",
  "Seberapa sering Anda merasa gugup dan stres?",
  "Seberapa sering Anda merasa yakin tentang kemampuan Anda untuk menangani masalah pribadi Anda?",
  "Seberapa sering Anda merasa bahwa segala sesuatu berjalan sesuai keinginan Anda?",
  "Seberapa sering Anda merasa tidak mampu mengatasi semua hal yang harus Anda lakukan?",
  "Seberapa sering Anda mampu mengendalikan gangguan dalam hidup Anda?",
  "Seberapa sering Anda merasa bahwa Anda mengendalikan keadaan?",
  "Seberapa sering Anda merasa marah karena hal-hal yang terjadi di luar kendali Anda?",
  "Seberapa sering Anda merasa kesulitan menumpuk begitu tinggi sehingga Anda tidak dapat mengatasinya?",
];

const OPTIONS = [
  { value: 0, label: "Tidak Pernah" },
  { value: 1, label: "Hampir Tidak Pernah" },
  { value: 2, label: "Kadang-kadang" },
  { value: 3, label: "Cukup Sering" },
  { value: 4, label: "Sangat Sering" },
];

export default function PSS10Form() {
  const [activityDate, setActivityDate] = useState("");
  const [answers, setAnswers] = useState<number[]>(Array(10).fill(-1));
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleAnswerChange = (questionIndex: number, value: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate all questions are answered
    if (answers.some((a) => a === -1)) {
      setError("Harap jawab semua pertanyaan.");
      return;
    }

    if (!activityDate) {
      setError("Harap pilih tanggal aktivitas.");
      return;
    }

    setIsLoading(true);

    try {
      await http.post("/student/pss10", {
        activity_date: activityDate,
        q1: answers[0],
        q2: answers[1],
        q3: answers[2],
        q4: answers[3],
        q5: answers[4],
        q6: answers[5],
        q7: answers[6],
        q8: answers[7],
        q9: answers[8],
        q10: answers[9],
      });
      setSuccess(true);
      setActivityDate("");
      setAnswers(Array(10).fill(-1));
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
        title="PSS-10 Questionnaire | Stress Prediction System"
        description="Form kuesioner PSS-10"
      />
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="mb-2 text-xl font-semibold text-gray-800 dark:text-white">
            PSS-10 Questionnaire
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Perceived Stress Scale - Pilih jawaban yang paling sesuai dengan kondisi Anda dalam 1 bulan terakhir.
          </p>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="activity_date">Tanggal</Label>
              <Input
                type="date"
                id="activity_date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-6">
              {PSS_QUESTIONS.map((question, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {index + 1}. {question}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer px-3 py-2 rounded-lg text-sm transition ${
                          answers[index] === option.value
                            ? "bg-brand-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q${index + 1}`}
                          value={option.value}
                          checked={answers[index] === option.value}
                          onChange={() => handleAnswerChange(index, option.value)}
                          className="sr-only"
                          disabled={isLoading}
                        />
                        {option.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan Jawaban"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
