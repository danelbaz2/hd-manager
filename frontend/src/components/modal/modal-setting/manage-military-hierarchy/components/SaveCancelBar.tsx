import React from "react";
import { Save, RotateCcw, AlertCircle } from "lucide-react";

interface SaveCancelBarProps {
  isDarkMode: boolean;
  hasChanges: boolean;
  isSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export const SaveCancelBar: React.FC<SaveCancelBarProps> = ({
  isDarkMode,
  hasChanges,
  isSaving,
  onSave,
  onCancel,
}) => {
  return (
    <div
      className={`
        overflow-hidden transition-all duration-300 ease-out
        -mx-8 -mb-8 mt-auto
        ${hasChanges ? "max-h-24 opacity-100" : "max-h-0 opacity-0"}
      `}
    >
      <div
        className={`
          flex items-center justify-between gap-4 px-8 py-4
          border-t ${isDarkMode ? "border-slate-600 bg-slate-800" : "border-slate-200 bg-slate-50"}
        `}
      >
        {/* Info text */}
        <div className={`flex items-center gap-2 text-sm ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>
          <AlertCircle className="w-4 h-4" />
          <span className="font-medium">יש שינויים שלא נשמרו</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-200 border
              ${isDarkMode
                ? "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }
            `}
          >
            <RotateCcw className="w-4 h-4" />
            <span>ביטול</span>
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold
              transition-all duration-200
              bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 
              hover:bg-emerald-600 hover:shadow-emerald-500/50
              disabled:opacity-50 disabled:cursor-not-allowed
              transform active:scale-[0.98]
            `}
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "שומר..." : "שמור שינויים"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
