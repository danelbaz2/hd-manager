import React from "react";
import { User, Calendar } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { type SecondaryTagData } from "../../../schemas/tagTypes";

interface TagTaskCardProps {
  task: Task;
  users: UserData[];
  secondaryTags: SecondaryTagData[];
  primaryColor: string;
}

// Get status styling
const getStatusStyle = (status?: string) => {
  switch (status) {
    case "pending":
      return { bg: "bg-green-100", text: "text-green-700", label: "פתוח" };
    case "in_progress":
      return { bg: "bg-amber-100", text: "text-amber-700", label: "בטיפול" };
    case "completed":
      return { bg: "bg-slate-100", text: "text-slate-600", label: "סגור" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", label: "לא ידוע" };
  }
};

// Format date
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
};

const TagTaskCard: React.FC<TagTaskCardProps> = ({
  task,
  users,
  secondaryTags,
  primaryColor,
}) => {
  const { isDarkMode } = useTheme();
  const statusStyle = getStatusStyle(task.status);

  // Get assigned user
  const assignedUser = users.find((u) =>
    task.responsibleUserIds?.includes(u.id)
  );

  // Get task's secondary tags
  const taskTags = secondaryTags.filter((t) =>
    task.secondaryTagIds?.includes(t.id)
  );

  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-xl border
        transition-all duration-200 hover:shadow-md cursor-pointer
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700 hover:border-slate-600"
            : "bg-white border-slate-200 hover:border-slate-300"
        }`}
      style={{ borderRightWidth: "4px", borderRightColor: primaryColor }}
    >
      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Secondary Tags */}
          {taskTags.slice(0, 2).map((tag) => (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: primaryColor + "20",
                color: primaryColor,
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <h3
          className={`font-semibold text-sm truncate
            ${isDarkMode ? "text-white" : "text-slate-800"}`}
        >
          {task.title || "ללא כותרת"}
        </h3>

        {/* Date */}
        {task.date && (
          <div
            className={`flex items-center gap-1 mt-1 text-xs
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
          >
            <Calendar className="w-3 h-3" />
            <span>יעד: {formatDate(task.date)}</span>
          </div>
        )}
      </div>

      {/* Status Badge */}
      <span
        className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium
          ${statusStyle.bg} ${statusStyle.text}`}
      >
        {statusStyle.label}
      </span>

      {/* Assigned User */}
      {assignedUser && (
        <div className="shrink-0 flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: assignedUser.color }}
          >
            {assignedUser.profileImage ? (
              <img
                src={assignedUser.profileImage}
                alt={assignedUser.fullName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <span
            className={`hidden lg:block text-sm
              ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            {assignedUser.fullName}
          </span>
        </div>
      )}
    </div>
  );
};

export default TagTaskCard;
