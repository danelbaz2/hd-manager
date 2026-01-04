import { useState } from "react";
import { Check, X, Loader2, Calendar, User } from "lucide-react";
import type { Task } from "../../../api/tasksApi";
import type { UserData } from "../../../schemas/userTypes";

interface PendingTaskItemProps {
  task: Task;
  users: UserData[];
  isDarkMode: boolean;
  onApprove: (taskId: string) => Promise<boolean>;
  onReject: (taskId: string) => Promise<boolean>;
}

/**
 * PendingTaskItem - Individual task card with approve/reject actions
 */
const PendingTaskItem: React.FC<PendingTaskItemProps> = ({
  task,
  users,
  isDarkMode,
  onApprove,
  onReject,
}) => {
  const [isProcessing, setIsProcessing] = useState<"approve" | "reject" | null>(
    null
  );

  // Get assigned users
  const assignedUsers = users.filter((user) =>
    task.responsibleUserIds?.includes(user.id)
  );

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "לא נקבע";
    return new Date(timestamp).toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
    });
  };

  const handleApprove = async () => {
    setIsProcessing("approve");
    await onApprove(task.id);
    setIsProcessing(null);
  };

  const handleReject = async () => {
    setIsProcessing("reject");
    await onReject(task.id);
    setIsProcessing(null);
  };

  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-xl border
        transition-all duration-200
        ${
          isDarkMode
            ? "bg-slate-700/50 border-slate-600 hover:bg-slate-700"
            : "bg-white border-slate-200 hover:bg-slate-50"
        }
      `}
      dir="rtl"
    >
      {/* Task Info */}
      <div className="flex-1 min-w-0">
        <h4
          className={`font-semibold text-sm truncate ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {task.title || "ללא כותרת"}
        </h4>

        <div className="flex items-center gap-3 mt-1">
          {/* Date */}
          <div className="flex items-center gap-1">
            <Calendar
              className={`w-3 h-3 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {formatDate(task.date)}
            </span>
          </div>

          {/* Assigned Users */}
          {assignedUsers.length > 0 && (
            <div className="flex items-center gap-1">
              <User
                className={`w-3 h-3 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <span
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {assignedUsers[0].fullName}
                {assignedUsers.length > 1 && ` +${assignedUsers.length - 1}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Approve Button */}
        <button
          onClick={handleApprove}
          disabled={isProcessing !== null}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${
              isProcessing === "approve"
                ? "bg-green-500 cursor-wait"
                : "bg-green-500/20 hover:bg-green-500 text-green-600 hover:text-white"
            }
          `}
          title="אשר סגירה"
        >
          {isProcessing === "approve" ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
        </button>

        {/* Reject Button */}
        <button
          onClick={handleReject}
          disabled={isProcessing !== null}
          className={`
            p-2 rounded-lg transition-all duration-200
            ${
              isProcessing === "reject"
                ? "bg-red-500 cursor-wait"
                : "bg-red-500/20 hover:bg-red-500 text-red-600 hover:text-white"
            }
          `}
          title="דחה - החזר לטיפול"
        >
          {isProcessing === "reject" ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PendingTaskItem;
