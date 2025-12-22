import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { type SecondaryTagData } from "../../../schemas/tagTypes";

interface TaskListItemProps {
    task: Task;
    users: UserData[];
    tags: SecondaryTagData[];
}

// Get status badge styling
const getStatusStyle = (status?: string): { bg: string; text: string; label: string } => {
    switch (status) {
        case "pending":
            return { bg: "bg-slate-100", text: "text-slate-600", label: "פתוח" };
        case "in_progress":
            return { bg: "bg-amber-100", text: "text-amber-700", label: "בטיפול" };
        case "completed":
            return { bg: "bg-green-100", text: "text-green-700", label: "סגור" };
        case "cancelled":
            return { bg: "bg-red-100", text: "text-red-700", label: "בוטל" };
        default:
            return { bg: "bg-slate-100", text: "text-slate-600", label: "לא ידוע" };
    }
};

// Generate gradient for multiple user colors
const getGradientStyle = (colors: string[]): React.CSSProperties => {
    if (colors.length === 0) {
        return { backgroundColor: "#94A3B8" }; // Default slate color
    }
    if (colors.length === 1) {
        return { backgroundColor: colors[0] };
    }
    // Create gradient for multiple colors
    const gradientStops = colors
        .map((color, index) => {
            const percentage = (index / (colors.length - 1)) * 100;
            return `${color} ${percentage}%`;
        })
        .join(", ");
    return { background: `linear-gradient(to bottom, ${gradientStops})` };
};

const TaskListItem: React.FC<TaskListItemProps> = ({ task, users, tags }) => {
    const { isDarkMode } = useTheme();
    const statusStyle = getStatusStyle(task.status);

    // Get assigned users
    const assignedUsers = users.filter((user) =>
        task.responsibleUserIds?.includes(user.id)
    );

    // Get user colors for gradient
    const userColors = assignedUsers.map((user) => user.color);

    // Get task tags
    const taskTags = tags.filter((tag) => task.secondaryTagIds?.includes(tag.id));

    // Format date
    const formatDate = (timestamp?: number): string => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    };

    return (
        <div
            className={`
        flex items-center gap-4
        p-4 lg:p-5
        rounded-xl border
        transition-all duration-200
        hover:shadow-md
        ${isDarkMode
                    ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }
      `}
            dir="rtl"
        >
            {/* Color Border - Gradient for multiple users */}
            <div
                className="w-1.5 h-16 rounded-full shrink-0"
                style={getGradientStyle(userColors)}
            />

            {/* Task ID */}
            <div
                className={`
          shrink-0 w-16 lg:w-20
          text-xs lg:text-sm font-mono
          ${isDarkMode ? "text-slate-400" : "text-slate-400"}
        `}
            >
                {task.id?.slice(-6) || "---"}
            </div>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
                <h3
                    className={`
            font-semibold text-sm lg:text-base truncate
            ${isDarkMode ? "text-white" : "text-slate-800"}
          `}
                >
                    {task.title || "ללא כותרת"}
                </h3>
                {/* Tags */}
                {taskTags.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                        {taskTags.slice(0, 2).map((tag) => (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 rounded text-xs font-medium"
                                style={{
                                    backgroundColor: (tag.color || "#94A3B8") + "30",
                                    color: tag.color || "#94A3B8",
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                        {taskTags.length > 2 && (
                            <span
                                className={`
                  text-xs
                  ${isDarkMode ? "text-slate-400" : "text-slate-500"}
                `}
                            >
                                +{taskTags.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Status Badge */}
            <div className="shrink-0">
                <span
                    className={`
            px-3 py-1.5 rounded-full
            text-xs lg:text-sm font-medium
            ${statusStyle.bg} ${statusStyle.text}
          `}
                >
                    {statusStyle.label}
                </span>
            </div>

            {/* Deadline */}
            {task.date && (
                <div
                    className={`
            shrink-0 text-xs lg:text-sm
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}
          `}
                >
                    <span className="flex items-center gap-1">
                        <span>📅</span>
                        <span>יעד: {formatDate(task.date)}</span>
                    </span>
                </div>
            )}

            {/* Assigned Users */}
            <div className="shrink-0 flex items-center gap-2">
                {assignedUsers.slice(0, 2).map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center gap-2"
                    >
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: user.color }}
                        >
                            {user.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt={user.fullName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User className="w-4 h-4 text-white" />
                            )}
                        </div>
                        <div className="hidden lg:block">
                            <p
                                className={`
                  text-sm font-medium
                  ${isDarkMode ? "text-slate-200" : "text-slate-700"}
                `}
                            >
                                {user.fullName}
                            </p>
                            <p
                                className={`
                  text-xs
                  ${isDarkMode ? "text-slate-400" : "text-slate-500"}
                `}
                            >
                                {user.role === "admin" ? "מנהל מערכת" : "משתמש"}
                            </p>
                        </div>
                    </div>
                ))}
                {assignedUsers.length > 2 && (
                    <span
                        className={`
              text-xs font-medium
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
                    >
                        +{assignedUsers.length - 2}
                    </span>
                )}
            </div>
        </div>
    );
};

export default TaskListItem;
