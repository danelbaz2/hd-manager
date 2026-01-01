import React from "react";
import { X, Plus } from "lucide-react";
import { useTheme, useSettings } from "../../../contexts";
import { ToastContainer } from "../../alert-feedback";
import DelayedLoader from "../../loaders/DelayedLoader";
import { ModalOverlay } from "../../common/ModalOverlay";
import { TaskForm } from "../modal-task/parts/TaskForm";
import { useTaskForm } from "./hooks";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated?: () => void;
  initialDate?: number;
}

/**
 * NewTaskModal - Modal for creating new tasks
 * Uses shared TaskForm component for form fields
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
    selectedPrimaryTagIds,
    setSelectedPrimaryTagIds,
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

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Modal - width comes from ModalOverlay */}
      <div
        className={`
          w-full h-[85vh] rounded-3xl border shadow-2xl flex flex-col
          ${isDarkMode
            ? "bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 border-slate-700"
            : "bg-gradient-to-br from-white via-white to-slate-50 border-slate-200"
          }
        `}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 md:px-8 py-3 md:py-4 border-b shrink-0 ${isDarkMode ? "border-slate-800/50" : "border-slate-200/50"
            }`}
        >
          <h2
            className={`text-xl lg:text-2xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"
              }`}
          >
            יצירת משימה חדשה
          </h2>
          <button
            onClick={onClose}
            className={`p-2.5 rounded-xl transition-all duration-200 ${isDarkMode
              ? "hover:bg-slate-700/50 text-slate-400 hover:text-slate-200"
              : "hover:bg-slate-100 text-slate-500 hover:text-slate-700"
              }`}
          >
            <X className="w-5 h-5 lg:w-6 lg:h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <DelayedLoader isLoading={isDataLoading} delay={200}>
          <div
            className={`px-6 lg:px-8 py-4 flex-1 overflow-y-auto ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"
              }`}
          >
            {/* Shared TaskForm Component */}
            <TaskForm
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              priority={priority}
              setPriority={setPriority}
              startDate={startDate}
              setStartDate={setStartDate}
              deadline={deadline}
              setDeadline={setDeadline}
              selectedUserIds={selectedUserIds}
              setSelectedUserIds={setSelectedUserIds}
              selectedSecondaryTagIds={selectedSecondaryTagIds}
              setSelectedSecondaryTagIds={setSelectedSecondaryTagIds}
              selectedPrimaryTagIds={selectedPrimaryTagIds}
              setSelectedPrimaryTagIds={setSelectedPrimaryTagIds}
              primaryTags={primaryTags}
              secondaryTags={secondaryTags}
              users={users}
              isDarkMode={isDarkMode}
              isLoading={isDataLoading}
            />
          </div>
        </DelayedLoader>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-10 px-6 lg:px-8 py-3 lg:py-4 border-t shrink-0 ${isDarkMode
            ? "border-slate-700/50 bg-slate-800/50"
            : "border-slate-200/50 bg-slate-50/50"
            }`}
        >
          <button
            onClick={onClose}
            className={`font-medium text-sm lg:text-base transition-colors ${isDarkMode
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            ביטול
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex items-center gap-2 px-6 lg:px-8 py-2 lg:py-2.5 rounded-xl text-white font-semibold text-sm lg:text-base transition-all duration-200 shadow-lg ${isSubmitting
              ? "bg-blue-400 cursor-not-allowed shadow-blue-400/25"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/30 hover:shadow-blue-500/40"
              }`}
          >
            <Plus className="w-5 h-5" />
            {isSubmitting ? "יוצר משימה..." : "צור משימה"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default NewTaskModal;
