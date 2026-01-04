import React, { useMemo } from "react";
import { StatusBadgeDropdown } from "./StatusBadgeDropdown";
import { useAuth } from "../../../../contexts/AuthContext";
import { useSettings } from "../../../../contexts/SettingsContext";
import { FileText, Calendar, Clock, Users, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { Tooltip } from "../../../tags-tooltip";
import { useTagsModal } from "../../modal-tags";
import {
  PRIORITY_COLORS,
  PRIORITY_OPTIONS,
  STATUS_COLORS,
  type TaskPriority,
} from "../../../../schemas/taskTypes";
import type { Task } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
  getLighterColor,
  TAG_COLORS,
} from "../../../../schemas/tagTypes";

interface TaskDetailsProps {
  task: Task;
  isDarkMode: boolean;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  users: UserData[];
  onStatusChangeRequest: (newStatus: any) => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isDarkMode,
  primaryTags,
  secondaryTags,
  users,
  onStatusChangeRequest,
  onApprove,
  onReject,
}) => {
  const { user } = useAuth();
  const { contacts } = useSettings();
  const { openTagsModal } = useTagsModal();

  const canChangeStatus = useMemo(() => {
    if (!user) return false;
    // Admin can always change status (uses approve/reject for pending_approval)
    if (user.role === "admin") return true;
    // Non-admin: pending_approval and completed are locked
    if (task.status === "pending_approval" || task.status === "completed") return false;
    // Non-admin: can change if responsible
    if (task.responsibleUserIds && task.responsibleUserIds.includes(user.id))
      return true;
    return false;
  }, [user, task.responsibleUserIds, task.status]);

  const currentPriority = (task.priority || "medium") as TaskPriority;
  const currentStatus = (task.status ||
    "pending") as keyof typeof STATUS_COLORS;

  // process tags - matching TwoTierTagsSelect logic
  const taskTags = useMemo(() => {
    const sTagIds = task.secondaryTagIds || [];
    const pTagIds = task.primaryTagIds || [];

    // 1. Map secondary tags and find their parent primary IDs
    const displayedSecondaryTags = sTagIds
      .map((tagId) => {
        const secondaryTag = secondaryTags.find((st) => st.id === tagId);
        if (!secondaryTag) return null;
        const primaryTag = primaryTags.find(
          (pt) => pt.id === secondaryTag.primaryTagId
        );
        return {
          id: secondaryTag.id,
          name: secondaryTag.name,
          color: primaryTag
            ? getLighterColor(primaryTag.color)
            : TAG_COLORS[0].bg, // Use lighter color for secondary
          description: secondaryTag.description || null,
          primaryId: secondaryTag.primaryTagId,
          isPrimary: false,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    // 2. Identify which primary tags correspond to selected secondary tags
    const primaryIdsWithSecondary = new Set(
      displayedSecondaryTags.map((t) => t.primaryId)
    );

    // 3. Find standalone primary tags (those selected but having no secondary tags)
    const displayedPrimaryTags = pTagIds
      .filter((pId) => !primaryIdsWithSecondary.has(pId))
      .map((pId) => {
        const primaryTag = primaryTags.find((pt) => pt.id === pId);
        if (!primaryTag) return null;
        return {
          id: primaryTag.id,
          name: primaryTag.name,
          color: primaryTag.color,
          description: primaryTag.description || null,
          primaryId: primaryTag.id,
          isPrimary: true,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    return [...displayedPrimaryTags, ...displayedSecondaryTags];
  }, [task.secondaryTagIds, task.primaryTagIds, secondaryTags, primaryTags]);

  return (
    <div className="space-y-5">
      {/* Task ID & Tags */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-mono px-2 py-1 rounded ${isDarkMode
            ? "bg-slate-700 text-slate-400"
            : "bg-slate-100 text-slate-500"
            }`}
        >
          ID-{task.id ? task.id.slice(-6).toLowerCase() : "???"}
        </span>
        <div className="flex gap-2 flex-wrap">
          {taskTags.map(
            (tag, idx) =>
              tag && (
                <Tooltip
                  key={idx}
                  content={`${tag.description || tag.name} (לחץ לפרטים)`}
                  position="bottom"
                >
                  <button
                    onClick={() => openTagsModal(tag, contacts, primaryTags)}
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105 hover:shadow-md"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </button>
                </Tooltip>
              )
          )}
        </div>
      </div>

      {/* Title */}
      <h2
        className={`text-2xl font-bold break-words whitespace-pre-line ${isDarkMode ? "text-white" : "text-slate-800"
          }`}
      >
        {task.title}
      </h2>

      {/* Status & Priority */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Pending Approval State - Show approve/reject for admin */}
        {task.status === "pending_approval" && user?.role === "admin" ? (
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-purple-500/20" : "bg-purple-50"
              }`}>
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-500">
                ממתין לאישור
              </span>
            </div>
            {/* Approve button */}
            <button
              onClick={onApprove}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${isDarkMode
                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              אשר וסגור
            </button>
            {/* Reject button */}
            <button
              onClick={onReject}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${isDarkMode
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
            >
              <XCircle className="w-4 h-4" />
              דחה והחזר
            </button>
          </div>
        ) : task.status === "pending_approval" ? (
          // Non-admin viewing pending_approval - show locked status
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isDarkMode ? "bg-purple-500/20" : "bg-purple-50"
            }`}>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-semibold text-purple-500">
              ממתין לאישור מנהל
            </span>
          </div>
        ) : (
          // Normal status dropdown
          <StatusBadgeDropdown
            currentStatus={currentStatus}
            onStatusSelect={onStatusChangeRequest}
            isDarkMode={isDarkMode}
            disabled={!canChangeStatus}
            excludeStatuses={user?.role !== "admin" ? ["pending_approval"] : []}
          />
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
          className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
            }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText
              className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            />
            <span
              className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              תיאור
            </span>
          </div>
          <p
            className={`text-sm leading-relaxed break-words whitespace-pre-line ${isDarkMode ? "text-slate-300" : "text-slate-600"
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
            className={`p-3 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar
                className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-500"
                  }`}
              />
              <span
                className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                תאריך התחלה
              </span>
            </div>
            <p
              className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"
                }`}
            >
              {new Date(task.date).toLocaleDateString("he-IL")}
            </p>
          </div>
        )}
        {task.deadline && (
          <div
            className={`p-3 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
              }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Clock
                className={`w-4 h-4 ${isDarkMode ? "text-amber-400" : "text-amber-500"
                  }`}
              />
              <span
                className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                תאריך יעד
              </span>
            </div>
            <p
              className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"
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
          className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
            }`}
        >
          <div className="flex items-center gap-2 mb-3">
            <Users
              className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            />
            <span
              className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDarkMode ? "bg-slate-600/50" : "bg-white shadow-sm"
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
                    className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-slate-700"
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
