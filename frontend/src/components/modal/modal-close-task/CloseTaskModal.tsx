import React, { useMemo } from "react";
import { X, ShieldCheck } from "lucide-react";
import { useTheme } from "../../../contexts";
import { useUsersQuery } from "../../../api/queries";
import { mapUsersToUserData } from "../../../api/typeMappers";
import { useCloseTaskModal } from "./CloseTaskModalContext";
import { usePendingTasks } from "./usePendingTasks";
import PendingTaskList from "./PendingTaskList";

/**
 * CloseTaskModal - Modal for admin to approve/reject task closures
 */
const CloseTaskModal: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { data: usersData = [] } = useUsersQuery();
  const users = useMemo(() => mapUsersToUserData(usersData), [usersData]);
  const { isOpen, closeModal } = useCloseTaskModal();
  const { pendingTasks, approveTask, rejectTask } = usePendingTasks();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      />

      {/* Modal */}
      <div
        className={`
          relative w-full max-w-lg mx-4
          rounded-2xl shadow-2xl overflow-hidden
          animate-in fade-in zoom-in-95 duration-200
          ${isDarkMode ? "bg-slate-800" : "bg-white"}
        `}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`
            flex items-center justify-between
            px-6 py-4 border-b
            ${isDarkMode
              ? "border-slate-700 bg-slate-700/50"
              : "border-slate-200 bg-slate-50"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
                }`}
            >
              <ShieldCheck
                className={`w-5 h-5 ${isDarkMode ? "text-purple-400" : "text-purple-600"
                  }`}
              />
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${isDarkMode ? "text-white" : "text-slate-800"
                  }`}
              >
                אישור סגירת משימות
              </h2>
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                {pendingTasks.length} משימות ממתינות
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode
                ? "hover:bg-slate-600 text-slate-400"
                : "hover:bg-slate-200 text-slate-500"
              }
            `}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <PendingTaskList
          tasks={pendingTasks}
          users={users}
          isDarkMode={isDarkMode}
          onApprove={approveTask}
          onReject={rejectTask}
        />
      </div>
    </div>
  );
};

export default CloseTaskModal;
