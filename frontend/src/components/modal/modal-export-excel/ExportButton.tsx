/**
 * ExportButton - Compact button with blue theme
 */
import React from "react";
import { Download, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts";

interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
  taskCount: number;
  fieldCount: number;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  isExporting,
  taskCount,
  fieldCount,
}) => {
  const { isDarkMode } = useTheme();

  const isDisabled = isExporting || taskCount === 0 || fieldCount === 0;

  return (
    <div className="flex items-center gap-4">
      {/* Task Count */}
      <span
        className={`text-sm ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        {taskCount} משימות
      </span>

      {/* Export Button */}
      <button
        onClick={onExport}
        disabled={isDisabled}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-xl
          text-sm font-semibold transition-all
          ${
            isDisabled
              ? isDarkMode
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl"
          }
        `}
      >
        {isExporting ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            מייצא...
          </>
        ) : (
          <>
            <Download size={16} />
            הורד Excel
          </>
        )}
      </button>
    </div>
  );
};

export default ExportButton;
