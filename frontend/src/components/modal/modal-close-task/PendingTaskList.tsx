import { ClipboardCheck } from "lucide-react";
import type { Task } from "../../../api/tasksApi";
import type { UserData } from "../../../schemas/userTypes";
import PendingTaskItem from "./PendingTaskItem";

interface PendingTaskListProps {
  tasks: Task[];
  users: UserData[];
  isDarkMode: boolean;
  onApprove: (taskId: string) => Promise<boolean>;
  onReject: (taskId: string) => Promise<boolean>;
}

/**
 * PendingTaskList - List of tasks waiting for approval
 */
const PendingTaskList: React.FC<PendingTaskListProps> = ({
  tasks,
  users,
  isDarkMode,
  onApprove,
  onReject,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div
          className={`
            p-4 rounded-full mb-4
            ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
          `}
        >
          <ClipboardCheck
            className={`w-8 h-8 ${
              isDarkMode ? "text-green-400" : "text-green-600"
            }`}
          />
        </div>
        <h3
          className={`text-lg font-semibold mb-2 ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          אין משימות ממתינות לאישור
        </h3>
        <p
          className={`text-sm ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          כל המשימות אושרו או עדיין בתהליך
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-4 overflow-y-auto max-h-[60vh]">
      {tasks.map((task) => (
        <PendingTaskItem
          key={task.id}
          task={task}
          users={users}
          isDarkMode={isDarkMode}
          onApprove={onApprove}
          onReject={onReject}
        />
      ))}
    </div>
  );
};

export default PendingTaskList;
