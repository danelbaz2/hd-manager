/**
 * DateRangeFilter - Compact date range filter with blue theme
 */
import React from "react";
import { useTheme } from "../../contexts";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { isDarkMode } = useTheme();

  const inputClass = `
    px-3 py-1.5 rounded-lg border text-sm w-36
    transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20
    ${
      isDarkMode
        ? "bg-slate-700 border-slate-600 text-white"
        : "bg-white border-slate-200 text-slate-800"
    }
  `;

  const presets = [
    { label: "היום", days: 0 },
    { label: "שבוע", days: 7 },
    { label: "חודש", days: 30 },
    { label: "3 חודשים", days: 90 },
  ];

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Date Inputs */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={inputClass}
        />
        <span className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
          -
        </span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className={inputClass}
        />
      </div>

      {/* Quick Presets */}
      <div className="flex gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const end = new Date();
              const start = new Date();
              start.setDate(start.getDate() - preset.days);
              onStartDateChange(start.toISOString().split("T")[0]);
              onEndDateChange(end.toISOString().split("T")[0]);
            }}
            className={`
              px-2.5 py-1 rounded-lg text-xs font-medium transition-all
              ${
                isDarkMode
                  ? "bg-slate-700 text-slate-300 hover:bg-blue-900/40 hover:text-blue-300"
                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateRangeFilter;
