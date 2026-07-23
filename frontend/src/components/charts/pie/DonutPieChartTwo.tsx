import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface DonutPieChartProps {
  series: number[];
  labels: string[];
  colors: string[];
  totalLabel?: string;
  unit?: string;
}

export default function DonutPieChartTwo({
  series,
  labels,
  colors,
  totalLabel = "Total",
  unit = "Mhs",
}: DonutPieChartProps) {
  const totalValue = series.reduce((a, b) => a + b, 0);
  const [centerLabel, setCenterLabel] = useState(totalLabel);
  const [centerValue, setCenterValue] = useState(`${totalValue} ${unit}`);

  useEffect(() => {
    setCenterLabel(totalLabel);
    setCenterValue(`${totalValue} ${unit}`);
  }, [series, totalLabel, unit, totalValue]);

  const options: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 240,
      toolbar: {
        show: false,
      },
      events: {
        dataPointMouseEnter: (_event, _chartContext, config) => {
          setCenterLabel(labels[config.dataPointIndex]);
          setCenterValue(`${series[config.dataPointIndex]} ${unit}`);
        },
        dataPointMouseLeave: () => {
          setCenterLabel(totalLabel);
          setCenterValue(`${totalValue} ${unit}`);
        },
      },
    },
    labels: labels,
    legend: {
      show: false,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: false,
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

  // Dynamic font size for center label based on length to fit inside the donut hole
  const getFontSize = (text: string) => {
    if (text.length > 15) return "text-xs";
    if (text.length > 10) return "text-sm";
    return "text-base";
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex justify-center items-center w-[280px] h-[240px]">
        <Chart options={options} series={series} type="donut" width="280" height="240" />
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center max-w-[140px] px-2">
          <span className={`font-bold text-gray-800 dark:text-white leading-tight ${getFontSize(centerLabel)}`}>
            {centerLabel}
          </span>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
            {centerValue}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
        {labels.map((label, index) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index] }}
            ></span>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
