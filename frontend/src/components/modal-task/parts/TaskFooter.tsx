import React from "react";
import { Save, Pencil } from "lucide-react";

interface TaskFooterProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleEditClick: () => void;
  closeTaskModal: () => void;
  isDarkMode: boolean;
}

export const TaskFooter: React.FC<TaskFooterProps> = ({
  isEditMode,
  isSubmitting,
  handleSave,
  handleCancelEdit,
  handleEditClick,
  closeTaskModal,
  isDarkMode,
}) => {
  return (
    <div
      className={`
        flex items-center justify-end gap-6 px-6 py-4
        border-t ${
          isDarkMode
            ? "border-slate-700/50 bg-slate-800/50"
            : "border-slate-200/50 bg-slate-50/50"
        }
      `}
    >
      {isEditMode ? (
        <>
          <button
            onClick={handleCancelEdit}
            className={`font-medium text-sm transition-colors ${
              isDarkMode
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            ביטול
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-lg
              ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed shadow-blue-400/25"
                  : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30"
              }
            `}
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "שומר..." : "שמור"}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={closeTaskModal}
            className={`font-medium text-sm transition-colors ${
              isDarkMode
                ? "text-slate-300 hover:text-white"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            סגור
          </button>
          <button
            onClick={handleEditClick}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30"
          >
            <Pencil className="w-4 h-4" />
            עריכה
          </button>
        </>
      )}
    </div>
  );
};
