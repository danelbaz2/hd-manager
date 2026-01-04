import React, { useState, useRef, useEffect } from "react";
import { motion, LayoutGroup } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task, type TaskStatus } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import KanbanTaskCard, { type DropConfirmRequest } from "./KanbanTaskCard";

export interface KanbanColumnDef {
  id: string; // The visual column ID (e.g. "pending", "done_merged")
  title: string;
  statuses: TaskStatus[]; // Which actual statuses show up here
  targetStatus: TaskStatus; // Default status for drops
  icon: LucideIcon;
  colorClass: string;
  showStatusBadge?: boolean;
}

interface KanbanColumnProps {
  columnDef: KanbanColumnDef;
  tasks: Task[];
  users: UserData[];
  onDrop: (taskId: string, targetStatus: TaskStatus) => void;
  onTaskStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
  onDropConfirmRequest?: (request: DropConfirmRequest) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnDef,
  tasks,
  users,
  onTaskStatusChange,
  onTaskClick,
  onDropConfirmRequest,
}) => {
  const { isDarkMode } = useTheme();
  const [isDropTarget, setIsDropTarget] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);
  const Icon = columnDef.icon;

  // Detect when dragging over this column
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const draggingTaskId = document.body.getAttribute("data-dragging-task");
      if (!draggingTaskId || !columnRef.current) {
        setIsDropTarget(false);
        return;
      }

      const rect = columnRef.current.getBoundingClientRect();
      const isOver =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      setIsDropTarget(isOver);
    };

    const handleMouseUp = () => {
      setIsDropTarget(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={columnRef}
      // Use the targetStatus for drag detection so KanbanTaskCard sees a valid TaskStatus?
      // No, KanbanTaskCard uses data-column-status to pass to onDrop.
      // And we want the Status.
      data-column-status={columnDef.targetStatus}
      className={`
                flex-1 min-w-[300px] md:min-w-0
                rounded-2xl p-4
                flex flex-col h-full
                border transition-all duration-300 ease-out
                ${
                  isDropTarget
                    ? isDarkMode
                      ? "bg-blue-900/20 border-blue-500/60 shadow-lg shadow-blue-500/10"
                      : "bg-blue-50/80 border-blue-400/60 shadow-lg shadow-blue-500/10"
                    : isDarkMode
                    ? "bg-slate-800/50 border-slate-700"
                    : "bg-slate-50 border-slate-200"
                }
            `}
    >
      {/* Column Header */}
      <div
        className={`
                    flex items-center justify-between
                    mb-4 pb-3 border-b
                    ${isDarkMode ? "border-slate-700" : "border-slate-200"}
                `}
      >
        <div className="flex items-center gap-2">
          <div
            className={`
                            w-6 h-6 rounded-full flex items-center justify-center
                            transition-colors duration-300
                            ${
                              isDropTarget
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                ? "bg-slate-700"
                                : "bg-slate-200"
                            }
                        `}
          >
            <span
              className={`
                                text-xs font-bold
                                ${
                                  isDropTarget
                                    ? "text-white"
                                    : isDarkMode
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                }
                            `}
            >
              {tasks.length}
            </span>
          </div>
          <h3
            className={`font-bold text-lg transition-colors duration-300 ${
              isDropTarget ? "text-blue-500" : columnDef.colorClass
            }`}
          >
            {columnDef.title}
          </h3>
        </div>
        <Icon
          size={18}
          className={`transition-colors duration-300 ${
            isDropTarget ? "text-blue-500" : columnDef.colorClass
          }`}
        />
      </div>

      {/* Tasks Container */}
      <div
        className={`
                    flex-1 overflow-y-auto p-1 rounded-lg relative
                    transition-colors duration-300
                    ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
                    ${isDropTarget ? "bg-blue-500/5" : ""}
                `}
      >
        {/* Empty state placeholder */}
        {tasks.length === 0 && (
          <div
            className={`
                            flex items-center justify-center h-32
                            text-sm rounded-lg
                            transition-all duration-300
                            ${
                              isDropTarget
                                ? isDarkMode
                                  ? "text-blue-400 bg-blue-500/10 border-2 border-dashed border-blue-500/30"
                                  : "text-blue-500 bg-blue-50 border-2 border-dashed border-blue-400/40"
                                : isDarkMode
                                ? "text-slate-600"
                                : "text-slate-300"
                            }
                        `}
          >
            {isDropTarget ? "שחרר כאן" : "אין משימות"}
          </div>
        )}

        {/* Task cards with layout animation for reordering */}
        <LayoutGroup id={`column-${columnDef.id}`}>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layout
              transition={{
                layout: {
                  type: "tween",
                  ease: [0.25, 0.1, 0.25, 1],
                  duration: 0.4,
                },
              }}
            >
              <KanbanTaskCard
                task={task}
                users={users}
                onClick={onTaskClick}
                columnStatus={columnDef.id} // Used for "dragging-from" logic
                onTaskStatusChange={onTaskStatusChange}
                onDropConfirmRequest={onDropConfirmRequest}
                showStatusBadge={columnDef.showStatusBadge}
              />
            </motion.div>
          ))}
        </LayoutGroup>
      </div>
    </div>
  );
};

// Column configurations
export const getKanbanColumns = (isAdmin: boolean): KanbanColumnDef[] => {
  if (isAdmin) {
    // Admin View: All 4 columns
    return [
      {
        id: "pending",
        title: "פתוח",
        statuses: ["pending"],
        targetStatus: "pending",
        icon: AlertCircle,
        colorClass: "text-emerald-500",
      },
      {
        id: "in_progress",
        title: "בטיפול",
        statuses: ["in_progress"],
        targetStatus: "in_progress",
        icon: Clock,
        colorClass: "text-amber-500",
      },
      {
        id: "pending_approval",
        title: "ממתין לאישור",
        statuses: ["pending_approval"],
        targetStatus: "pending_approval",
        icon: ShieldCheck,
        colorClass: "text-purple-500",
      },
      {
        id: "completed",
        title: "סגור",
        statuses: ["completed"],
        targetStatus: "completed",
        icon: CheckCircle2,
        colorClass: "text-slate-400",
      },
    ];
  }

  // Regular User View: Merged 'Done' Column using targetStatus=pending_approval logic
  return [
    {
      id: "pending",
      title: "פתוח",
      statuses: ["pending"],
      targetStatus: "pending",
      icon: AlertCircle,
      colorClass: "text-emerald-500",
    },
    {
      id: "in_progress",
      title: "בטיפול",
      statuses: ["in_progress"],
      targetStatus: "in_progress",
      icon: Clock,
      colorClass: "text-amber-500",
    },
    {
      id: "completed_merged",
      title: "סגור", // Title for users
      statuses: ["pending_approval", "completed"], // Includes both
      targetStatus: "pending_approval", // Drops trigger pending approval!
      icon: CheckCircle2,
      colorClass: "text-slate-400",
      showStatusBadge: true, // Show badge inside card
    },
  ];
};

export default KanbanColumn;
