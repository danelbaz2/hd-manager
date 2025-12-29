import React from "react";
import { Search, Hash } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { type ArchiveFilters } from "../../schemas/archiveTypes";
import DatePickerField from "./DatePickerField";

interface Props {
  filters: ArchiveFilters;
  onFiltersChange: (f: ArchiveFilters) => void;
}

const HeaderArchivePage: React.FC<Props> = ({ filters, onFiltersChange }) => {
  const { isDarkMode } = useTheme();
  const upd = <K extends keyof ArchiveFilters>(k: K, v: ArchiveFilters[K]) =>
    onFiltersChange({ ...filters, [k]: v });

  const box = `relative flex items-center h-10 rounded-lg border transition-all ${
    isDarkMode
      ? "bg-slate-800/60 border-slate-600/50 hover:border-slate-500"
      : "bg-slate-50 border-slate-200 hover:border-slate-300"
  }`;
  const inp = `w-full h-full bg-transparent text-sm border-0 outline-none pr-10 pl-3 ${
    isDarkMode
      ? "text-white placeholder-slate-400"
      : "text-slate-700 placeholder-slate-400"
  }`;
  const ico =
    "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400";
  const lbl = `block text-xs font-medium mb-1.5 uppercase ${
    isDarkMode ? "text-slate-400" : "text-slate-500"
  }`;

  return (
    <div
      className={`w-full py-4 px-5 border-b backdrop-blur-sm overflow-visible ${
        isDarkMode
          ? "bg-slate-900/95 border-slate-700/50"
          : "bg-white/95 border-slate-200"
      }`}
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row items-stretch gap-3">
        <div className="flex-1 min-w-0 sm:max-w-[280px]">
          <label className={lbl}>שם משימה</label>
          <div className={box}>
            <Search className={ico} />
            <input
              type="text"
              placeholder="חיפוש לפי שם..."
              value={filters.title}
              onChange={(e) => upd("title", e.target.value)}
              className={inp}
            />
          </div>
        </div>
        <div className="sm:w-[150px]">
          <label className={lbl}>מספר משימה</label>
          <div className={box}>
            <Hash className={ico} />
            <input
              type="text"
              placeholder="c6a8cb"
              value={filters.taskId}
              onChange={(e) => upd("taskId", e.target.value)}
              className={inp}
            />
          </div>
        </div>
        <div className="flex items-end gap-2">
          <div className="sm:w-[150px]">
            <label className={lbl}>מתאריך</label>
            <DatePickerField
              value={filters.startDate}
              onChange={(ts) => upd("startDate", ts)}
            />
          </div>
          <span
            className={`h-10 flex items-center text-lg font-light ${
              isDarkMode ? "text-slate-600" : "text-slate-300"
            }`}
          >
            –
          </span>
          <div className="sm:w-[150px]">
            <label className={lbl}>עד תאריך</label>
            <DatePickerField
              value={filters.endDate}
              onChange={(ts) => upd("endDate", ts)}
              placeholder=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderArchivePage;
