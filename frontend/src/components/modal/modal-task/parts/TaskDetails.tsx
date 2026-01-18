import React, { useMemo } from "react";
import { StatusBadgeDropdown } from "./StatusBadgeDropdown";
import { useAuth } from "../../../../contexts/AuthContext";
import { useContactsQuery } from "../../../../api/queries";
import { mapContactsToData } from "../../../../api/typeMappers";
import {
  FileText,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
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
import {
  getServiceNowIncidentUrl,
  getMarsItemUrl,
} from "../../../../lib/config/runtimeConfig";

interface TaskDetailsProps {
  task: Task;
  isDarkMode: boolean;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  users: UserData[];
  onStatusChangeRequest: (newStatus: any) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onTagClick?: () => void;
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
  onTagClick,
}) => {
  const { user } = useAuth();
  const { data: contactsData = [] } = useContactsQuery();
  const contacts = useMemo(
    () => mapContactsToData(contactsData),
    [contactsData]
  );
  const { openTagsModal } = useTagsModal();

  const canChangeStatus = useMemo(() => {
    if (!user) return false;
    // Admin can always change status (uses approve/reject for pending_approval)
    if (user.role === "admin") return true;
    // Non-admin: pending_approval and completed are locked
    if (task.status === "pending_approval" || task.status === "completed")
      return false;
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
    <div className="space-y-5 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Task ID & Tags */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-mono px-2 py-1 rounded ${
            isDarkMode
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
                    onClick={() => {
                      onTagClick?.(); // Close contact modal if open
                      openTagsModal(tag, contacts, primaryTags);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all hover:shadow-lg hover:brightness-110"
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
        className={`text-2xl font-bold break-words whitespace-pre-line ${
          isDarkMode ? "text-white" : "text-slate-800"
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
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isDarkMode ? "bg-purple-500/20" : "bg-purple-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-semibold text-purple-500">
                ממתין לאישור
              </span>
            </div>
            {/* Approve button */}
            <button
              onClick={onApprove}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${
                isDarkMode
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 ${
                isDarkMode
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
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              isDarkMode ? "bg-purple-500/20" : "bg-purple-50"
            }`}
          >
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
            className={`text-sm leading-relaxed break-words whitespace-pre-line ${
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

      {/* Optional Fields Display */}
      {task.optionals && Object.values(task.optionals).some((v) => v) && (
        <div
          className={`p-5 rounded-2xl border ${
            isDarkMode
              ? "bg-slate-800/50 border-slate-700"
              : "bg-white border-slate-100 shadow-sm"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck
              className={`w-4 h-4 ${
                isDarkMode ? "text-indigo-400" : "text-indigo-500"
              }`}
            />
            <span
              className={`text-sm font-semibold tracking-wide ${
                isDarkMode ? "text-slate-200" : "text-slate-700"
              }`}
            >
              פרטים נוספים
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* Organizational Units */}
            {(task.optionals.pikud ||
              task.optionals.ugda ||
              task.optionals.hativa ||
              task.optionals.gdud) && (
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  { label: "פיקוד", value: task.optionals.pikud },
                  { label: "אוגדה", value: task.optionals.ugda },
                  { label: "חטיבה", value: task.optionals.hativa },
                  { label: "גדוד", value: task.optionals.gdud },
                ].map(
                  (item) =>
                    item.value && (
                      <div
                        key={item.label}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                          isDarkMode
                            ? "bg-slate-800 border-slate-700"
                            : "bg-slate-50/50 border-slate-200"
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isDarkMode ? "text-slate-500" : "text-slate-400"
                          }`}
                        >
                          {item.label}
                        </span>
                        <div
                          className={`w-px h-3 ${
                            isDarkMode ? "bg-slate-700" : "bg-slate-300"
                          }`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            isDarkMode ? "text-slate-300" : "text-slate-700"
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    )
                )}
              </div>
            )}

            {/* External System */}
            {/* External System */}
            {task.optionals.externalSystem && (
              <div
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all w-fit ${
                  task.optionals.externalSystem === "SNOW"
                    ? isDarkMode
                      ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
                      : "bg-blue-50 border-blue-100 hover:bg-blue-100/50"
                    : isDarkMode
                    ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20"
                    : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50"
                }`}
              >
                {/* System Icon */}
                <div
                  className={`p-1.5 rounded-md shadow-sm shrink-0 ${
                    task.optionals.externalSystem === "SNOW"
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                      : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
                  }`}
                >
                  <span className="text-[10px] font-bold leading-none block px-0.5">
                    {task.optionals.externalSystem === "SNOW" ? "SNOW" : "MARS"}
                  </span>
                </div>

                {/* ID Display */}
                {/* ID Display */}
                <div className="flex items-center" dir="ltr">
                  {task.optionals.externalSystem === "SNOW" ? (
                    <div
                      className={`flex items-stretch rounded-lg overflow-hidden border ml-1 ${
                        isDarkMode
                          ? "border-slate-600 shadow-sm"
                          : "border-slate-300 shadow-sm"
                      }`}
                    >
                      {/* Prefix Block */}
                      <div
                        className={`flex items-center px-2 py-1 text-xs font-bold border-r tracking-wider ${
                          isDarkMode
                            ? "bg-blue-900/40 text-blue-100 border-slate-600"
                            : "bg-blue-100 text-blue-700 border-slate-300"
                        }`}
                      >
                        INC
                      </div>
                      {/* ID Number Link */}
                      {(() => {
                        const idDigits = task.optionals.externalId
                          ? task.optionals.externalId.replace(/^INC/, "")
                          : "";
                        const url = getServiceNowIncidentUrl(
                          task.optionals.externalId || ""
                        );

                        return idDigits ? (
                          <Tooltip
                            content="תלחץ עליי אני מת על גיל פלג"
                            position="top"
                          >
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`block px-2 py-1 text-sm font-mono font-bold hover:underline transition-colors ${
                                isDarkMode
                                  ? "text-blue-300 bg-slate-800/30 hover:bg-slate-700/50"
                                  : "text-blue-700 bg-white hover:bg-blue-50"
                              }`}
                            >
                              {idDigits}
                            </a>
                          </Tooltip>
                        ) : (
                          <span className="px-2 py-1 text-sm italic text-slate-400 bg-transparent">
                            ---
                          </span>
                        );
                      })()}
                    </div>
                  ) : (
                    /* MARS Display - Standard Badge */
                    (() => {
                      const url = getMarsItemUrl(
                        task.optionals.externalId || ""
                      );
                      const hasId = !!task.optionals.externalId;

                      return hasId ? (
                        <Tooltip content="פתח ב-MARS" position="top">
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm font-mono font-bold hover:underline ml-1 ${
                              isDarkMode
                                ? "text-emerald-400"
                                : "text-emerald-700"
                            }`}
                          >
                            {task.optionals.externalId}
                          </a>
                        </Tooltip>
                      ) : (
                        <span className="text-sm italic text-slate-500">
                          ללא מזהה
                        </span>
                      );
                    })()
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
