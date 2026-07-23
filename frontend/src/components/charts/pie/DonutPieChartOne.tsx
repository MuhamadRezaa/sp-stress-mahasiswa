import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function DonutPieChartOne() {
  const options: ApexOptions = {
    colors: ["#3C50E0", "#6577F3", "#8FD0EF"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 240,
      toolbar: {
        show: false,
      },
    },
    labels: ["Desktop", "Mobile", "Tablet"],
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              color: "#1D2939",
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: "24px",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              color: "#1D2939",
              offsetY: 5,
              formatter: (val) => `${val}`,
            },
            total: {
              show: false,
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      enabled: false,
    },
  };

  // Series values corresponding to Desktop (34), Mobile (65), Tablet (12)
  const series = [34, 65, 12];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex justify-center w-full min-h-[240px]">
        <Chart options={options} series={series} type="donut" width="280" />
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center gap-6 mt-6">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3C50E0]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Desktop
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#6577F3]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Mobile
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#8FD0EF]"></span>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Tablet
          </span>
        </div>
      </div>
    </div>
  );
}
