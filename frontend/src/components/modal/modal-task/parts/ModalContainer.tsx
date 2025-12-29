import React from "react";
import { ToastContainer } from "../../../alert-feedback";
import { TaskHeader } from "./TaskHeader";
import { TaskFooter } from "./TaskFooter";
import { TaskContent } from "./TaskContent";
import type { Task, TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../../schemas/tagTypes";

interface FormProps {
  isEditMode: boolean;
  isSubmitting: boolean;
  title: string;
  setTitle: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  priority: any;
  setPriority: (v: any) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  deadline: string;
  setDeadline: (v: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (v: string[]) => void;
  selectedSecondaryTagIds: string[];
  setSelectedSecondaryTagIds: (v: string[]) => void;
  selectedPrimaryTagIds: string[];
  setSelectedPrimaryTagIds: (v: string[]) => void;
  handleCancelEdit: () => void;
  handleSave: () => void;
  setIsEditMode: (v: boolean) => void;
}

interface DeleteHook {
  isDeleting: boolean;
  openDeleteConfirm: () => void;
}

interface ModalContainerProps {
  task: Task;
  isDarkMode: boolean;
  isAdmin: boolean;
  form: FormProps;
  del: DeleteHook;
  activeTab: "details" | "history";
  setActiveTab: (v: "details" | "history") => void;
  history: TaskHistoryEntry[];
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  isLoadingHistory: boolean;
  onAddNote: (text: string) => void;
  getActionDescription: (e: any, c: any) => React.ReactNode;
  closeTaskModal: () => void;
  alerts: any[];
  dismissAlert: (id: number) => void;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  task,
  isDarkMode,
  isAdmin,
  form,
  del,
  activeTab,
  setActiveTab,
  history,
  users,
  primaryTags,
  secondaryTags,
  isLoadingHistory,
  onAddNote,
  getActionDescription,
  closeTaskModal,
  alerts,
  dismissAlert,
}) => (
  <>
    <ToastContainer
      alerts={alerts}
      onDismiss={dismissAlert}
      isDarkMode={isDarkMode}
    />
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={closeTaskModal}
    />
    <div
      className={`relative z-10 w-full max-w-2xl lg:max-w-3xl min-h-[500px] h-[80vh] flex flex-col rounded-3xl border shadow-2xl ${isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
        }`}
      dir="rtl"
    >
      <TaskHeader
        isEditMode={form.isEditMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        closeTaskModal={closeTaskModal}
        isDarkMode={isDarkMode}
      />
      <div
        className={`px-6 py-4 flex-1 flex flex-col min-h-0 ${form.isEditMode || (!form.isEditMode && activeTab === "history")
            ? "overflow-visible"
            : "overflow-y-auto"
          } ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}
      >
        <TaskContent
          isEditMode={form.isEditMode}
          activeTab={activeTab}
          task={task}
          form={form}
          history={history}
          users={users}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          isDarkMode={isDarkMode}
          isLoadingHistory={isLoadingHistory}
          onAddNote={onAddNote}
          getActionDescription={getActionDescription}
        />
      </div>
      <TaskFooter
        isEditMode={form.isEditMode}
        isSubmitting={form.isSubmitting}
        isDeleting={del.isDeleting}
        isAdmin={isAdmin}
        handleSave={form.handleSave}
        handleCancelEdit={form.handleCancelEdit}
        handleEditClick={() => form.setIsEditMode(true)}
        handleDeleteClick={del.openDeleteConfirm}
        closeTaskModal={closeTaskModal}
        isDarkMode={isDarkMode}
      />
    </div>
  </>
);
