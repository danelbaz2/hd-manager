import React from "react";
import { X, Plus } from "lucide-react";
import { useTheme, useSettings } from "../../contexts";
import { ToastContainer } from "../alert-feedback";
import DelayedLoader from "../loaders/DelayedLoader";
import {
  PrioritySelect,
  TwoTierTagsSelect,
  UserSelect,
  DatePicker,
} from "./components";
import { useTaskForm } from "./hooks";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
  initialDate?: number;
}

/**
 * NewTaskModal - Modal for creating new tasks
 * Refactored to use useTaskForm hook for form logic
 */
const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreated,
  initialDate,
}) => {
  const { isDarkMode } = useTheme();
  const {
    users,
    primaryTags,
    secondaryTags,
    isLoading: isLoadingData,
    isLoadingUsers,
    isLoadingTags,
  } = useSettings();

  const isDataLoading = isLoadingData || isLoadingUsers || isLoadingTags;

  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    selectedSecondaryTagIds,
    setSelectedSecondaryTagIds,
    startDate,
    setStartDate,
    deadline,
    setDeadline,
    selectedUserIds,
    setSelectedUserIds,
    isSubmitting,
    handleSubmit,
    alerts,
    dismissAlert,
  } = useTaskForm({
    isOpen,
    initialDate,
    onSuccess: onTaskCreated,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative z-10 w-full max-w-2xl lg:max-w-3xl rounded-3xl border shadow-2xl flex flex-col
          ${
            isDarkMode
              ? "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700"
              : "bg-gradient-to-br from-white via-white to-slate-50 border-slate-200"
          }
        `}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 md:px-8 py-4 md:py-5 border-b ${
            isDarkMode ? "border-slate-800/50" : "border-slate-200/50"
          }`}
        >
          <h2
            className={`text-xl lg:text-2xl font-bold ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            יצירת משימה חדשה
          </h2>
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              isDarkMode
                ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            }`}
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* Content */}
        <DelayedLoader isLoading={isDataLoading} delay={200}>
          <div
            className={`px-6 lg:px-8 py-4 ${
              isDarkMode ? "dark-scrollbar" : "light-scrollbar"
            }`}
          >
            <div className="space-y-4">
              {/* Title & Priority Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label
                    className={`block text-sm lg:text-base font-medium mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    כותרת המשימה
                  </label>
                  <input
                    type="text"
                    placeholder="לדוגמה: עדכון שרתי בסיס נתונים"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-sm lg:text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                      isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                        : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
                    }`}
                  />
                </div>
                <PrioritySelect value={priority} onChange={setPriority} />
              </div>

              {/* Description */}
              <div>
                <label
                  className={`block text-sm lg:text-base font-medium mb-2 ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  תיאור המשימה
                </label>
                <textarea
                  placeholder="פרט את דרישות המשימה..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={`w-full px-4 py-3 rounded-xl border-2 resize-none text-sm lg:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
                  }`}
                />
              </div>

              {/* Tags & Dates Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TwoTierTagsSelect
                  primaryTags={primaryTags}
                  secondaryTags={secondaryTags}
                  selectedSecondaryTagIds={selectedSecondaryTagIds}
                  onChange={setSelectedSecondaryTagIds}
                  isLoading={isDataLoading}
                />
                <DatePicker
                  label="תאריך התחלה"
                  value={startDate}
                  onChange={setStartDate}
                  placeholder="בחר תאריך"
                />
                <DatePicker
                  label="תאריך יעד"
                  value={deadline}
                  onChange={setDeadline}
                  placeholder="בחר תאריך"
                />
              </div>

              {/* Assignees */}
              <UserSelect
                users={users}
                selectedUserIds={selectedUserIds}
                onChange={setSelectedUserIds}
                isLoading={isDataLoading}
              />
            </div>
          </div>
        </DelayedLoader>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-10 px-6 lg:px-8 py-4 lg:py-5 border-t ${
            isDarkMode
              ? "border-slate-700/50 bg-slate-800/50"
              : "border-slate-200/50 bg-slate-50/50"
          }`}
        >
          <button
            onClick={onClose}
            className={`font-medium text-sm lg:text-base transition-colors ${
              isDarkMode
                ? "text-slate-400 hover:text-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 lg:px-8 py-3 lg:py-3.5 rounded-xl text-white font-semibold text-sm lg:text-base transition-all duration-200 shadow-lg ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed shadow-blue-400/25"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30 hover:shadow-blue-500/40"
            }`}
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? "יוצר משימה..." : "צור משימה"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewTaskModal;
