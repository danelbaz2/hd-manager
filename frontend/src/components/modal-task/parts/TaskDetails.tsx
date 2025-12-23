import React, { useMemo } from "react";
import { FileText, Calendar, Clock, Users } from "lucide-react";
import {
  PRIORITY_COLORS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  STATUS_COLORS,
  type TaskPriority,
} from "../../../schemas/taskTypes";
import type { Task } from "../../../api/tasksApi";
import type { User } from "../../../schemas/userTypes";
import type { Tag } from "../../../schemas/tagTypes";

interface TaskDetailsProps {
  task: Task;
  isDarkMode: boolean;
  primaryTags: Tag[];
  secondaryTags: Tag[];
  users: User[];
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isDarkMode,
  primaryTags,
  secondaryTags,
  users,
}) => {
  const currentPriority = (task.priority || "medium") as TaskPriority;
  const currentStatus = (task.status ||
    "pending") as keyof typeof STATUS_COLORS;
  const statusOption = STATUS_OPTIONS.find((s) => s.id === currentStatus);

  // process tags
  const taskTags = useMemo(() => {
    const tagIds = task.secondaryTagIds || [];
    if (tagIds.length === 0) return [];
    return tagIds
      .map((tagId) => {
        const secondaryTag = secondaryTags.find((st) => st.id === tagId);
        if (!secondaryTag) return null;
        const primaryTag = primaryTags.find(
          (pt) => pt.id === secondaryTag.primaryTagId
        );
        return {
          name: secondaryTag.name,
          color: primaryTag?.color || "#3B82F6",
          description: secondaryTag.description || null,
        };
      })
      .filter(Boolean);
  }, [task.secondaryTagIds, secondaryTags, primaryTags]);

  return (
    <div className="space-y-5">
      {/* Task ID & Tags */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-mono px-2 py-1 rounded ${
            isDarkMode
              ? "bg-slate-700 text-slate-400"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          MS-{task.id ? task.id.slice(-3).toUpperCase() : "???"}
        </span>
        <div className="flex gap-2">
          {taskTags.map(
            (tag, idx) =>
              tag && (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                  }}
                >
                  {tag.name}
                </span>
              )
          )}
        </div>
      </div>

      {/* Title */}
      <h2
        className={`text-2xl font-bold ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        {task.title}
      </h2>

      {/* Status & Priority */}
      <div className="flex items-center gap-3">
        {statusOption && (
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              backgroundColor: STATUS_COLORS[currentStatus].bg,
              color: STATUS_COLORS[currentStatus].text,
            }}
          >
            {statusOption.label}
          </span>
        )}
        <span
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            backgroundColor: PRIORITY_COLORS[currentPriority].bg,
            color: PRIORITY_COLORS[currentPriority].text,
          }}
        >
          {PRIORITY_OPTIONS.find((p) => p.id === currentPriority)?.label}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <div
          className={`p-4 rounded-xl ${
            isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText
              className={`w-4 h-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              תיאור
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed ${
              isDarkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {task.description}
          </p>
        </div>
      )}

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        {task.date && (
          <div
            className={`p-3 rounded-xl ${
              isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar
                className={`w-4 h-4 ${
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                תאריך התחלה
              </span>
            </div>
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {new Date(task.date).toLocaleDateString("he-IL")}
            </p>
          </div>
        )}
        {task.deadline && (
          <div
            className={`p-3 rounded-xl ${
              isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock
                className={`w-4 h-4 ${
                  isDarkMode ? "text-amber-400" : "text-amber-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                תאריך יעד
              </span>
            </div>
            <p
              className={`text-sm font-semibold ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {new Date(task.deadline).toLocaleDateString("he-IL")}
            </p>
          </div>
        )}
      </div>

      {/* Responsible Users */}
      {task.responsibleUserIds && task.responsibleUserIds.length > 0 && (
        <div
          className={`p-4 rounded-xl ${
            isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users
              className={`w-4 h-4 ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            />
            <span
              className={`text-sm font-medium ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              אחראים
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {task.responsibleUserIds.map((userId) => {
              const user = users.find((u) => u.id === userId);
              if (!user) return null;
              return (
                <div
                  key={userId}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                    isDarkMode ? "bg-slate-600/50" : "bg-white shadow-sm"
                  }`}
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{
                        backgroundColor: user.color || "#94A3B8",
                      }}
                    >
                      {user.fullName.charAt(0)}
                    </div>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-slate-700"
                    }`}
                  >
                    {user.fullName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
