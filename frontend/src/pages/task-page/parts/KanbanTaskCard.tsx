import React from "react";
import { User, Clock } from "lucide-react";
import { useTheme, useSettings } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import { getLighterColor, getTextColor } from "../../../schemas/tagTypes";

interface KanbanTaskCardProps {
    task: Task;
    users: UserData[];
    onClick?: (task: Task) => void;
}

// Format date for display
const formatDate = (timestamp?: number): string => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
    task,
    users,
    onClick,
}) => {
    const { isDarkMode } = useTheme();
    const { primaryTags, secondaryTags } = useSettings();

    // Find responsible user
    const responsibleUser =
        task.responsibleUsersId && task.responsibleUsersId.length > 0
            ? users.find((u) => u.id === task.responsibleUsersId![0])
            : null;

    // Get secondary tags for this task with their primary tag info
    const taskSecondaryTags = (task.secondaryTagIds || [])
        .map((tagId) => {
            const secondaryTag = secondaryTags.find((st) => st.id === tagId);
            if (!secondaryTag) return null;
            const primaryTag = primaryTags.find((pt) => pt.id === secondaryTag.primaryTagId);
            return {
                ...secondaryTag,
                primaryColor: primaryTag?.color || "#1E40AF",
            };
        })
        .filter((tag): tag is NonNullable<typeof tag> => tag !== null);

    // Drag start handler - set task ID in dataTransfer
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData("text/plain", task.id);
        e.dataTransfer.effectAllowed = "move";
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onClick={() => onClick?.(task)}
            className={`
        p-4 rounded-xl border shadow-sm mb-3
        cursor-grab active:cursor-grabbing
        transition-all duration-200
        hover:shadow-md group
        ${isDarkMode
                    ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                    : "bg-white border-slate-100 hover:border-slate-200"
                }
      `}
        >
            {/* Task Title */}
            <div className="flex justify-between items-start mb-2">
                <h4
                    className={`
            font-bold text-sm leading-tight
            group-hover:text-blue-600 transition-colors
            ${isDarkMode ? "text-white" : "text-slate-800"}
          `}
                >
                    {task.title || "ללא כותרת"}
                </h4>
            </div>

            {/* Task Description */}
            {task.description && (
                <p
                    className={`
            text-xs mb-3 line-clamp-2
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}
          `}
                >
                    {task.description}
                </p>
            )}

            {/* Secondary Tags */}
            {taskSecondaryTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {taskSecondaryTags.slice(0, 3).map((tag) => {
                        const lightColor = getLighterColor(tag.primaryColor);
                        return (
                            <span
                                key={tag.id}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                style={{
                                    backgroundColor: lightColor,
                                    color: getTextColor(lightColor),
                                }}
                            >
                                {tag.name}
                            </span>
                        );
                    })}
                    {taskSecondaryTags.length > 3 && (
                        <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${isDarkMode ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-500"
                                }`}
                        >
                            +{taskSecondaryTags.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Footer: Deadline & User */}
            <div className="flex items-center justify-between mt-auto">
                {/* Deadline */}
                {task.deadline && (
                    <div
                        className={`
              flex items-center gap-1 text-xs
              ${isDarkMode ? "text-slate-400" : "text-slate-400"}
            `}
                    >
                        <Clock size={12} />
                        <span>{formatDate(task.deadline)}</span>
                    </div>
                )}

                {/* User Avatar */}
                {responsibleUser && (
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: responsibleUser.color }}
                    >
                        {responsibleUser.profileImage ? (
                            <img
                                src={responsibleUser.profileImage}
                                alt={responsibleUser.fullName}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            <User size={12} className="text-white" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KanbanTaskCard;
