import React from "react";
import { Save, Pencil, Trash2 } from "lucide-react";

interface TaskFooterProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  isDeleting?: boolean;
  isAdmin: boolean;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleEditClick: () => void;
  handleDeleteClick?: () => void;
  closeTaskModal: () => void;
  isDarkMode: boolean;
}

export const TaskFooter: React.FC<TaskFooterProps> = ({
  isEditMode,
  isSubmitting,
  isDeleting = false,
  isAdmin,
  handleSave,
  handleCancelEdit,
  handleEditClick,
  handleDeleteClick,
  closeTaskModal,
  isDarkMode,
}) => {
  return (
    <div
      className={`
        flex items-center justify-between px-6 py-4
        border-t ${
          isDarkMode
            ? "border-slate-700/50 bg-slate-800/50"
            : "border-slate-200/50 bg-slate-50/50"
        }
      `}
    >
      {/* Left side - Delete button (only in edit mode) */}
      <div>
        {isEditMode && handleDeleteClick && (
          <button
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
              ${
                isDeleting
                  ? "bg-red-400 cursor-not-allowed text-white"
                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30"
              }
            `}
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "מוחק..." : "מחק משימה"}
          </button>
        )}
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center gap-6">
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
            {isAdmin && (
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30"
              >
                <Pencil className="w-4 h-4" />
                עריכה
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
