import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function DonutPieChartFour() {
  const options: ApexOptions = {
    colors: ["#C7D2FE", "#8095F7", "#3C50E0", "#2C3E82"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "pie",
      height: 240,
      toolbar: {
        show: false,
      },
    },
    labels: ["Image", "Video", "Audio", "Documents"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: true,
      custom: function({
        series,
        seriesIndex,
        w,
      }: {
        series: number[];
        seriesIndex: number;
        w: { config: { colors: string[]; labels: string[] } };
      }) {
        const color = w.config.colors[seriesIndex];
        const label = w.config.labels[seriesIndex];
        const val = series[seriesIndex];
        return `
          <div class="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow text-xs font-sans">
            <style>
              .apexcharts-tooltip {
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
              }
            </style>
            <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${color}"></span>
            <span class="text-gray-500 dark:text-gray-400 font-medium">${label}:</span>
            <span class="font-bold text-gray-800 dark:text-white">${val}%</span>
          </div>
        `;
      },
    },
  };

  // Series values matching the image percentages (sums to 100)
  const series = [28, 22, 18, 32];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex justify-center w-full min-h-[240px]">
        <Chart options={options} series={series} type="pie" width="280" />
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C7D2FE]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Image
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#8095F7]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Video
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3C50E0]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Audio
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#2C3E82]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Documents
          </span>
        </div>
      </div>
    </div>
  );
}
