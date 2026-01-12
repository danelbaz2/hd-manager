/**
 * DateRangeFilter - Modern date range filter with calendar picker and quick presets
 */
import React, { useState } from "react";
import { useTheme } from "../../../contexts";
import { DatePicker } from "../modal-new-task/components";

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

// Helper: Parse YYYY-MM-DD string to timestamp for comparison
const parseDateToTimestamp = (dateStr: string): number => {
  if (!dateStr) return 0;
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0).getTime();
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  const { isDarkMode } = useTheme();
  const [activePreset, setActivePreset] = useState<number>(0); // 0 = "הכל" preset (default)

  const presets = [
    { label: "הכל", days: -1 }, // -1 means "all dates" (no filter)
    { label: "היום", days: 0 },
    { label: "שבוע אחרון", days: 7 },
    { label: "חודש אחרון", days: 30 },
    { label: "3 חודשים", days: 90 },
    { label: "שנה אחרונה", days: 365 },
  ];

  const handlePresetClick = (days: number, index: number) => {
    if (days === -1) {
      // "All" preset - clear dates
      onStartDateChange("");
      onEndDateChange("");
    } else {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - days);
      onStartDateChange(start.toISOString().split("T")[0]);
      onEndDateChange(end.toISOString().split("T")[0]);
    }
    setActivePreset(index);
  };

  // Validate end date when start date changes
  const handleStartDateChange = (newStartDate: string) => {
    onStartDateChange(newStartDate);
    setActivePreset(null); // Clear preset selection when manually changing dates

    // If end date exists and is now before the new start date, update end date to match
    if (endDate && newStartDate) {
      const startTimestamp = parseDateToTimestamp(newStartDate);
      const endTimestamp = parseDateToTimestamp(endDate);

      if (endTimestamp < startTimestamp) {
        onEndDateChange(newStartDate);
      }
    }
  };

  // Validate end date - ensure it's not before start date
  const handleEndDateChange = (newEndDate: string) => {
    setActivePreset(null); // Clear preset selection when manually changing dates

    if (!newEndDate) {
      onEndDateChange("");
      return;
    }

    // If start date is set, validate end date is not before it
    if (startDate) {
      const startTimestamp = parseDateToTimestamp(startDate);
      const endTimestamp = parseDateToTimestamp(newEndDate);

      if (endTimestamp < startTimestamp) {
        // Don't allow end date before start date - silently adjust to start date
        onEndDateChange(startDate);
        return;
      }
    }

    onEndDateChange(newEndDate);
  };

  return (
    <div className="space-y-3">
      {/* Quick Presets - Top Row */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          בחירה מהירה:
        </span>
        {presets.map((preset, index) => (
          <button
            key={preset.label}
            onClick={() => handlePresetClick(preset.days, index)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${
                activePreset === index
                  ? isDarkMode
                    ? "bg-blue-600 text-white border border-blue-500 shadow-md"
                    : "bg-blue-500 text-white border border-blue-500 shadow-md"
                  : isDarkMode
                    ? "bg-slate-700 text-slate-300 hover:bg-blue-900/40 hover:text-blue-300 border border-slate-600"
                    : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200"
              }
            `}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Calendar Date Pickers - Bottom Row */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="w-40">
          <DatePicker
            label="מתאריך"
            value={startDate}
            onChange={handleStartDateChange}
            placeholder="בחר תאריך"
          />
        </div>
        <div className="w-40">
          <DatePicker
            label="עד תאריך"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeFilter;
