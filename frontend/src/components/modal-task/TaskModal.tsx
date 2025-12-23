import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  X,
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Pencil,
  Trash2,
  Save,
  Calendar,
  Users,
  UserPlus,
  FileText,
  Paperclip,
  File as FileIcon,
  Upload,
} from "lucide-react";
import { useTheme, useSettings } from "../../contexts";
import { useTaskModal } from "./TaskModalContext";
import { updateTask, addTaskNote, uploadTaskFile, type TaskHistoryAction, type TaskFormData, type FileMetadata } from "../../api/tasksApi";
import { ToastContainer, useToast } from "../alert-feedback";
import { FilePreviewModal } from "../file-preview-modal";
import {
  PRIORITY_COLORS,
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  STATUS_COLORS,
  type TaskPriority,
} from "../../schemas/taskTypes";

// Import form components from new-task modal
import {
  PrioritySelect,
  TwoTierTagsSelect,
  UserSelect,
  DatePicker,
} from "../modal-new-task/components";
import { Tooltip } from "../tags-tooltip";

type TabType = "details" | "history";

// Action configuration with icons and colors
const ACTION_CONFIG: Record<
  TaskHistoryAction,
  {
    icon: React.ComponentType<{
      className?: string;
      style?: React.CSSProperties;
    }>;
    color: string;
    bgColor: string;
    label: string;
  }
> = {
  CREATE: {
    icon: Plus,
    color: "#22C55E",
    bgColor: "#22C55E20",
    label: "יצר את המשימה",
  },
  UPDATE: {
    icon: Pencil,
    color: "#3B82F6",
    bgColor: "#3B82F620",
    label: "עדכן את המשימה",
  },
  IN_PROGRESS: {
    icon: Clock,
    color: "#F59E0B",
    bgColor: "#F59E0B20",
    label: "המשימה הועברה לטיפול",
  },
  CLOSE: {
    icon: CheckCircle2,
    color: "#10B981",
    bgColor: "#10B98120",
    label: "סגר את המשימה",
  },
  DELETE: {
    icon: Trash2,
    color: "#EF4444",
    bgColor: "#EF444420",
    label: "מחק את המשימה",
  },
  NOTE: {
    icon: MessageSquare,
    color: "#8B5CF6",
    bgColor: "#8B5CF620",
    label: "הוסיף הערה",
  },
  ASSIGN: {
    icon: UserPlus,
    color: "#06B6D4",
    bgColor: "#06B6D420",
    label: "המשימה שויכה",
  },
};

const TaskModal: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    primaryTags,
    secondaryTags,
    users,
    taskHistory,
    addHistoryEntry,
    isLoadingHistory,
    refreshTasks,
    refreshTaskHistory,
  } = useSettings();
  const { isOpen, task, enableFileHandle, closeTaskModal, onTaskUpdated } = useTaskModal();
  const { alerts, showSuccess, showError, showWarning, dismissAlert } = useToast();

  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>("details");

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state (for edit mode)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [selectedSecondaryTagIds, setSelectedSecondaryTagIds] = useState<
    string[]
  >([]);
  const [startDate, setStartDate] = useState<string>("");
  const [deadline, setDeadline] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Note input state
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Get history for current task from global state
  const history = useMemo(() => {
    if (!task) return [];
    return taskHistory.filter((entry) => entry.taskId === task.id);
  }, [task, taskHistory]);

  // Reset form when modal opens or task changes
  useEffect(() => {
    if (isOpen && task) {
      setActiveTab("details");
      setIsEditMode(false);
      setIsAddingNote(false);
      setNoteText("");

      // Populate form with task data
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority((task.priority as TaskPriority) || "medium");
      setSelectedSecondaryTagIds(task.secondaryTagIds || []);
      setSelectedUserIds(task.responsibleUserIds || []);

      if (task.date) {
        setStartDate(new Date(task.date).toISOString().split("T")[0]);
      } else {
        setStartDate("");
      }
      if (task.deadline) {
        setDeadline(new Date(task.deadline).toISOString().split("T")[0]);
      } else {
        setDeadline("");
      }
    }
  }, [isOpen, task]);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority((task.priority as TaskPriority) || "medium");
      setSelectedSecondaryTagIds(task.secondaryTagIds || []);
      setSelectedUserIds(task.responsibleUserIds || []);
      if (task.date) {
        setStartDate(new Date(task.date).toISOString().split("T")[0]);
      } else {
        setStartDate("");
      }
      if (task.deadline) {
        setDeadline(new Date(task.deadline).toISOString().split("T")[0]);
      } else {
        setDeadline("");
      }
    }
    setIsEditMode(false);
  }, [task]);

  // Save changes
  const handleSave = useCallback(async () => {
    if (!task) return;
    if (!title.trim()) {
      showWarning("שדה חסר", "יש להזין כותרת למשימה");
      return;
    }

    setIsSubmitting(true);
    try {
      const taskData: Partial<TaskFormData> = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        date: startDate ? new Date(startDate).getTime() : undefined,
        deadline: deadline ? new Date(deadline).getTime() : undefined,
        responsibleUserIds: selectedUserIds,
        secondaryTagIds: selectedSecondaryTagIds,
      };

      const response = await updateTask(task.id, taskData);
      if (response.success) {
        showSuccess("עודכן בהצלחה", "המשימה עודכנה");
        setIsEditMode(false);
        refreshTasks();
        refreshTaskHistory();
        onTaskUpdated?.();
      } else {
        showError("שגיאה", response.error || "אירעה שגיאה");
      }
    } catch (error) {
      showError("שגיאה", "אירעה שגיאה");
    } finally {
      setIsSubmitting(false);
    }
  }, [
    task,
    title,
    description,
    priority,
    startDate,
    deadline,
    selectedUserIds,
    selectedSecondaryTagIds,
    showSuccess,
    showError,
    showWarning,
    refreshTasks,
    refreshTaskHistory,
    onTaskUpdated,
  ]);

  // Add note
  const handleAddNote = useCallback(async () => {
    if (!task || !noteText.trim()) return;

    setIsSubmittingNote(true);
    try {
      const response = await addTaskNote(task.id, noteText.trim());
      if (response.success && response.data) {
        addHistoryEntry(response.data);
        setNoteText("");
        setIsAddingNote(false);
      }
    } catch (error) {
      console.error("Error adding note:", error);
    } finally {
      setIsSubmittingNote(false);
    }
  }, [task, noteText, addHistoryEntry]);

  // Get tag info
  const getTaskTags = useCallback(() => {
    const tagIds = task?.secondaryTagIds || [];
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
  }, [task, secondaryTags, primaryTags]);

  // Get user info by name
  const getUserByName = useCallback(
    (name: string) => {
      return users.find((u) => u.fullName === name || u.username === name);
    },
    [users]
  );

  // Get user names from user IDs
  const getUserNames = useCallback(
    (userIds: string[]): string[] => {
      return userIds
        .map((id) => users.find((u) => u.id === id)?.fullName)
        .filter((name): name is string => !!name);
    },
    [users]
  );

  // Get tag names from IDs
  const getTagNames = useCallback(
    (tagIds: string[]): string[] => {
      return tagIds
        .map((id) => secondaryTags.find((t) => t.id === id)?.name)
        .filter((name): name is string => !!name);
    },
    [secondaryTags]
  );

  // Format value for display based on field type
  const formatValue = useCallback(
    (field: string, value: any): string => {
      if (value === null || value === undefined) return "ריק";

      switch (field) {
        case "priority":
          return PRIORITY_OPTIONS.find((o) => o.id === value)?.label || value;
        case "status":
          return STATUS_OPTIONS.find((o) => o.id === value)?.label || value;
        case "date":
        case "deadline":
          return value
            ? new Date(value).toLocaleDateString("he-IL")
            : "לא נקבע";
        case "responsibleUserIds":
          const names = getUserNames(value as string[]);
          return names.length > 0 ? names.join(", ") : "אין אחראים";
        case "secondaryTagIds":
          const tags = getTagNames(value as string[]);
          return tags.length > 0 ? tags.join(", ") : "אין תגיות";
        case "title":
        case "description":
          return value.toString();
        default:
          return JSON.stringify(value);
      }
    },
    [getUserNames, getTagNames]
  );

  // Get Hebrew label for field
  const getFieldLabel = (field: string): string => {
    switch (field) {
      case "title":
        return "כותרת";
      case "description":
        return "תיאור";
      case "priority":
        return "עדיפות";
      case "status":
        return "סטטוס";
      case "date":
        return "תאריך התחלה";
      case "deadline":
        return "תאריך יעד";
      case "responsibleUserIds":
        return "אחראים";
      case "secondaryTagIds":
        return "תגיות";
      default:
        return field;
    }
  };

  // Generate dynamic action description based on entry type and changes
  const getActionDescription = useCallback(
    (
      entry: (typeof history)[0],
      config: (typeof ACTION_CONFIG)[keyof typeof ACTION_CONFIG]
    ): React.ReactNode => {
      const changes = entry.changes || {};
      const oldValues = entry.oldValues || {};
      const responsibleUserIds = changes.responsibleUserIds as
        | string[]
        | undefined;

      // NOTE action
      if (entry.action === "NOTE" && entry.note) {
        return entry.note;
      }

      // CREATE action
      if (entry.action === "CREATE") {
        if (responsibleUserIds && responsibleUserIds.length > 0) {
          const names = getUserNames(responsibleUserIds);
          if (names.length > 0) {
            return `המשימה נוצרה ושויכה ל: ${names.join(", ")}`;
          }
        }
        return "המשימה נוצרה";
      }

      // For all other actions (UPDATE, ASSIGN, IN_PROGRESS, CLOSE), check for field changes
      const changedFields = Object.keys(changes).filter((k) =>
        [
          "title",
          "description",
          "priority",
          "status",
          "date",
          "deadline",
          "responsibleUserIds",
          "secondaryTagIds",
        ].includes(k)
      );

      if (changedFields.length > 0) {
        return (
          <div className="flex flex-col gap-1.5">
            {changedFields.map((field) => {
              const newValue = formatValue(field, changes[field]);
              // If oldValue is missing/undefined, formatValue returns "ריק" (Empty)
              const oldValue = formatValue(field, oldValues[field]);
              const label = getFieldLabel(field);

              return (
                <div
                  key={field}
                  className="text-sm flex items-center gap-1.5 flex-wrap"
                >
                  <span className="font-semibold">{label}:</span>
                  <span className="opacity-75 line-through">{oldValue}</span>
                  <span>←</span>
                  <span
                    className={isDarkMode ? "text-blue-300" : "text-blue-600"}
                  >
                    {newValue}
                  </span>
                </div>
              );
            })}
          </div>
        );
      }

      // Default to config label
      return config.label;
    }, [getUserNames, formatValue, isDarkMode]);

  // Format timestamp
  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes}, ${day}.${month}.${year}`;
  };

  if (!isOpen || !task) return null;

  const taskTags = getTaskTags();
  const currentPriority = (task.priority || "medium") as TaskPriority;
  const currentStatus = (task.status ||
    "pending") as keyof typeof STATUS_COLORS;
  const statusOption = STATUS_OPTIONS.find((s) => s.id === currentStatus);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ToastContainer alerts={alerts} onDismiss={dismissAlert} isDarkMode={isDarkMode} />

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
        onClick={closeTaskModal}
      />

      {/* Modal - Same size as NewTaskModal in edit mode */}
      <div
        className={`
                    relative z-10 w-full
                    max-w-2xl lg:max-w-3xl
                    min-h-[500px] h-[80vh] flex flex-col
                    rounded-3xl border shadow-2xl overflow-hidden
                    ${isDarkMode
            ? "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700"
            : "bg-gradient-to-br from-white via-white to-slate-50 border-slate-200"
          }
                `}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`
                        flex items-center justify-between px-6 py-4
                        border-b ${isDarkMode
              ? "border-slate-700/50"
              : "border-slate-200/50"
            }
                    `}
        >
          {/* Close Button - Left side */}
          <button
            onClick={closeTaskModal}
            className={`
                            p-2.5 rounded-xl transition-all
                            ${isDarkMode
                ? "hover:bg-slate-700 text-slate-300 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              }
                        `}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Tabs - Center (only when not editing) */}
          {!isEditMode && (
            <div className={`flex items-center gap-1 p-1 rounded-xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-100"}`}>
              <button
                onClick={() => setActiveTab("details")}
                className={`
                                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${activeTab === "details"
                    ? "bg-blue-500 text-white shadow-sm"
                    : isDarkMode
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }
                                `}
              >
                פרטי משימה
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`
                                    px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                                    ${activeTab === "history"
                    ? "bg-blue-500 text-white shadow-sm"
                    : isDarkMode
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-500 hover:text-slate-800"
                  }
                                `}
              >
                היסטוריה
              </button>
            </div>
          )}

          {/* Edit mode title */}
          {isEditMode && (
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
              עריכת משימה
            </h2>
          )}

          {/* Spacer for balance */}
          <div className="w-10" />
        </div>

        {/* Content */}
        <div className={`
                    px-6 py-4 flex-1 flex flex-col min-h-0
                    ${!isEditMode && activeTab === "history"
            ? "overflow-hidden"
            : "overflow-y-auto"
          }
                    ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
                `}>
          {isEditMode ? (
            /* Edit Mode - Same layout as NewTaskModal */
            <div className="space-y-4">
              {/* Title & Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-sm lg:text-base font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    כותרת המשימה
                  </label>
                  <input
                    type="text"
                    placeholder="לדוגמה: עדכון שרתי בסיס נתונים"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`
                                            w-full px-4 py-3 rounded-xl border-2 text-sm lg:text-base font-medium transition-all
                                            ${isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                        : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
                      }
                                            focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                        `}
                  />
                </div>
                <PrioritySelect value={priority} onChange={setPriority} />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm lg:text-base font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  תיאור
                </label>
                <textarea
                  placeholder="פרט את דרישות המשימה..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`
                                        w-full px-4 py-3 rounded-xl border-2 resize-none text-sm lg:text-base transition-all
                                        ${isDarkMode
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
                    }
                                        focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                    `}
                />
              </div>

              {/* Tags & Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TwoTierTagsSelect
                  primaryTags={primaryTags}
                  secondaryTags={secondaryTags}
                  selectedSecondaryTagIds={selectedSecondaryTagIds}
                  onChange={setSelectedSecondaryTagIds}
                  isLoading={false}
                />
                <DatePicker label="תאריך התחלה" value={startDate} onChange={setStartDate} placeholder="בחר תאריך" />
                <DatePicker label="תאריך יעד" value={deadline} onChange={setDeadline} placeholder="בחר תאריך" />
              </div>

              {/* Assignees */}
              <UserSelect users={users} selectedUserIds={selectedUserIds} onChange={setSelectedUserIds} isLoading={false} />
            </div>
          ) : activeTab === "details" ? (
            /* Details Tab */
            <div className="space-y-5">
              {/* Task ID & Tags */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-mono px-2 py-1 rounded ${isDarkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                  MS-{task.id.slice(-3).toUpperCase()}
                </span>
                <div className="flex gap-2">
                  {taskTags.map((tag, idx) => tag && (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                {task.title}
              </h2>

              {/* Status & Priority */}
              <div className="flex items-center gap-3">
                {statusOption && (
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ backgroundColor: STATUS_COLORS[currentStatus].bg, color: STATUS_COLORS[currentStatus].text }}
                  >
                    {statusOption.label}
                  </span>
                )}
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ backgroundColor: PRIORITY_COLORS[currentPriority].bg, color: PRIORITY_COLORS[currentPriority].text }}
                >
                  {PRIORITY_OPTIONS.find((p) => p.id === currentPriority)?.label}
                </span>
              </div>

              {/* Description */}
              {task.description && (
                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>תיאור</span>
                  </div>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                    {task.description}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {task.date && (
                  <div className={`p-3 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className={`w-4 h-4 ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                      <span className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>תאריך התחלה</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      {new Date(task.date).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                )}
                {task.deadline && (
                  <div className={`p-3 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className={`w-4 h-4 ${isDarkMode ? "text-amber-400" : "text-amber-500"}`} />
                      <span className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>תאריך יעד</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      {new Date(task.deadline).toLocaleDateString("he-IL")}
                    </p>
                  </div>
                )}
              </div>

              {/* Responsible Users */}
              {task.responsibleUserIds && task.responsibleUserIds.length > 0 && (
                <div className={`p-4 rounded-xl ${isDarkMode ? "bg-slate-700/30" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Users className={`w-4 h-4 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`} />
                    <span className={`text-sm font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>אחראים</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {task.responsibleUserIds.map((userId) => {
                      const user = users.find((u) => u.id === userId);
                      if (!user) return null;
                      return (
                        <div
                          key={userId}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${isDarkMode ? "bg-slate-600/50" : "bg-white shadow-sm"}`}
                        >
                          {user.profileImage ? (
                            <img src={user.profileImage} alt={user.fullName} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: user.color || "#94A3B8" }}>
                              {user.fullName.charAt(0)}
                            </div>
                          )}
                          <span className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-slate-700"}`}>
                            {user.fullName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* History Tab */
            <div className="flex-1 flex flex-col space-y-4 min-h-0">
              {isLoadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className={`w-6 h-6 animate-spin ${isDarkMode ? "text-blue-400" : "text-blue-500"}`} />
                </div>
              ) : (
                <>
                  {/* Timeline with scroll - hidden scrollbar */}
                  <div
                    ref={(el) => { if (el) el.scrollTop = el.scrollHeight; }}
                    className="relative flex-1 overflow-y-auto pl-2 hidden-scrollbar min-h-0"
                    style={{ direction: 'ltr' }}
                  >
                    <div style={{ direction: 'rtl' }}>
                      {/* History entries */}
                      <div className="space-y-0">
                        {history.map((entry, index) => {
                          const config = ACTION_CONFIG[entry.action] || ACTION_CONFIG.UPDATE;
                          const Icon = config.icon;
                          const user = getUserByName(entry.updatedBy);
                          const isLast = index === history.length - 1;

                          return (
                            <div key={entry.id || index} className="relative flex gap-3">
                              {/* Timeline column with icon and connecting line */}
                              <div className="flex flex-col items-center flex-shrink-0">
                                {/* Icon */}
                                <div
                                  className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: config.bgColor, border: `2px solid ${config.color}` }}
                                >
                                  <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                                </div>
                                {/* Connecting line to next icon */}
                                {!isLast && (
                                  <div
                                    className={`w-0.5 flex-1 min-h-[40px] ${isDarkMode ? "bg-slate-600" : "bg-slate-300"}`}
                                  />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pb-4">
                                {/* User and time */}
                                <div className="flex items-center justify-between mb-1.5">
                                  <span
                                    className="text-sm font-medium px-2 py-0.5 rounded-md"
                                    style={{
                                      backgroundColor: user?.color ? `${user.color}30` : (isDarkMode ? "#475569" : "#E2E8F0"),
                                      color: isDarkMode ? "#F8FAFC" : "#1E293B",
                                    }}
                                  >
                                    {entry.updatedBy}
                                  </span>
                                  <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                    {formatDateTime(entry.timestamp)}
                                  </span>
                                </div>

                                {/* Action description */}
                                <div className={`p-3 rounded-xl text-sm ${isDarkMode ? "bg-slate-700/50 text-slate-300" : "bg-slate-100 text-slate-700"}`}>
                                  {getActionDescription(entry, config)}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {history.length === 0 && (
                          <p className={`text-center text-sm py-8 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                            אין היסטוריה עדיין
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Add Note */}
                  {isAddingNote ? (
                    <div className="pt-4 border-t border-dashed" style={{ borderColor: isDarkMode ? "#475569" : "#CBD5E1" }}>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="הוסף הערה..."
                        rows={2}
                        autoFocus
                        className={`
                                                    w-full px-4 py-3 rounded-xl border-2 text-sm resize-none
                                                    ${isDarkMode
                            ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                            : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500"
                          }
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500/20
                                                `}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => { setIsAddingNote(false); setNoteText(""); }}
                          className={`px-4 py-2 text-sm font-medium rounded-xl ${isDarkMode ? "text-slate-300 hover:text-white hover:bg-slate-700" : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"}`}
                        >
                          ביטול
                        </button>
                        <button
                          onClick={handleAddNote}
                          disabled={!noteText.trim() || isSubmittingNote}
                          className={`
                                                        flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all
                                                        ${!noteText.trim() || isSubmittingNote
                              ? "bg-blue-400 text-white cursor-not-allowed"
                              : "bg-blue-500 text-white hover:bg-blue-600"
                            }
                                                    `}
                        >
                          {isSubmittingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          שלח
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsAddingNote(true)}
                      className={`
                                                w-full flex items-center justify-center gap-2 py-3 rounded-xl
                                                text-sm font-medium border-2 border-dashed transition-all
                                                ${isDarkMode
                          ? "border-slate-600 text-slate-400 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                          : "border-slate-300 text-slate-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50"
                        }
                                            `}
                    >
                      <Plus className="w-4 h-4" />
                      הוסף הערה
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className={`
                        flex items-center justify-end gap-6 px-6 py-4
                        border-t ${isDarkMode
              ? "border-slate-700/50 bg-slate-800/50"
              : "border-slate-200/50 bg-slate-50/50"
            }
                    `}
        >
          {isEditMode ? (
            <>
              <button
                onClick={handleCancelEdit}
                className={`font-medium text-sm transition-colors ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-800"}`}
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className={`
                                    flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-lg
                                    ${isSubmitting
                    ? "bg-blue-400 cursor-not-allowed shadow-blue-400/25"
                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30"
                  }
                                `}
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? "שומר..." : "שמור"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={closeTaskModal}
                className={`font-medium text-sm transition-colors ${isDarkMode ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-800"}`}
              >
                סגור
              </button>
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30"
              >
                <Pencil className="w-4 h-4" />
                עריכה
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
