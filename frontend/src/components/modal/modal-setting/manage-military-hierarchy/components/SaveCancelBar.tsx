import React from "react";
import { Save, RotateCcw } from "lucide-react";

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
  if (!hasChanges) return null;

  return (
    <div
      className={`
        flex items-center justify-end gap-2 pt-4 mt-2
        border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"}
        animate-fadeIn
      `}
    >
      <button
        onClick={onCancel}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          transition-all duration-200 border
          ${
            isDarkMode
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
  );
};
