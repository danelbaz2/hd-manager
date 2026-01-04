import React from "react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import {
  type SecondaryTagData,
  type PrimaryTagData,
} from "../../../schemas/tagTypes";
import TaskListItem from "./TaskListItem";

interface TaskListDailyProps {
  tasks: Task[];
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  onTaskClick?: (task: Task) => void;
}

const TaskListDaily: React.FC<TaskListDailyProps> = ({
  tasks,
  users,
  primaryTags,
  secondaryTags,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();

  if (tasks.length === 0) {
    return (
      <div
        className={`
          text-center py-16
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}
        `}
      >
        <p className="text-lg">אין משימות להצגה</p>
        <p className="text-sm mt-2">
          לחץ על "יצירת משימה" כדי להוסיף משימה חדשה
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3" dir="rtl">
      {/* Header Row */}
      <div
        className={`
          flex items-center gap-4
          px-4 lg:px-5 py-2
          text-xs lg:text-sm font-medium
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}
        `}
      >
        <div className="w-1.5" /> {/* Color spacer */}
        <div className="w-16 lg:w-20">ID</div>
        <div className="flex-1">תיאור משימה</div>
        <div className="w-20 lg:w-24 text-center">סטטוס</div>
        <div className="w-24 lg:w-28">תאריך</div>
        <div className="w-32 lg:w-40">משויך ל...</div>
      </div>

      {/* Task Items */}
      {tasks.map((task) => (
        <TaskListItem
          key={task.id}
          task={task}
          users={users}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
};

export default TaskListDaily;
