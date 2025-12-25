import React from "react";
import { X } from "lucide-react";

interface TaskHeaderProps {
  isEditMode: boolean;
  activeTab: "details" | "history";
  setActiveTab: (tab: "details" | "history") => void;
  closeTaskModal: () => void;
  isDarkMode: boolean;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  isEditMode,
  activeTab,
  setActiveTab,
  closeTaskModal,
  isDarkMode,
}) => {
  return (
    <div
      className={`
        flex items-center justify-between px-6 py-4
        border-b ${isDarkMode ? "border-slate-700/50" : "border-slate-200/50"}
      `}
    >
      {/* Close Button - Left side */}
      <button
        onClick={closeTaskModal}
        className={`
          p-2.5 rounded-xl transition-all
          ${isDarkMode
            ? "hover:bg-slate-700 text-slate-300 hover:text-white"
            : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
          }
        `}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Tabs - Center (only when not editing) */}
      {!isEditMode && (
        <div
          className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
            }`}
        >
          <button
            onClick={() => setActiveTab("details")}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === "details"
                ? "bg-blue-500 text-white shadow-sm"
                : isDarkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-800"
              }
            `}
          >
            פרטי משימה
          </button>
          <button
            data-tour="history-tab"
            onClick={() => setActiveTab("history")}
            className={`
              px-4 py-1.5 rounded-lg text-sm font-medium transition-all
              ${activeTab === "history"
                ? "bg-blue-500 text-white shadow-sm"
                : isDarkMode
                  ? "text-slate-400 hover:text-white"
                  : "text-slate-500 hover:text-slate-800"
              }
            `}
          >
            היסטוריה
          </button>
        </div>
      )}

      {/* Edit mode title */}
      {isEditMode && (
        <h2
          className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"
            }`}
        >
          עריכת משימה
        </h2>
      )}

      {/* Spacer for balance */}
      <div className="w-10" />
    </div>
  );
};
