import React from "react";
import type { Task, TaskOptionals } from "../../../../api/tasksApi";
import type { TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../../schemas/tagTypes";
import type { TaskPriority } from "../../../../schemas/taskTypes";
import type { Contact } from "../../../../api/contactsApi";

import { HistoryTimeline } from "../history";
import { TaskForm } from "./TaskForm";
import { TaskDetails } from "./TaskDetails";

interface FormState {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priority: TaskPriority;
  setPriority: (value: TaskPriority) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (value: string[]) => void;
  selectedSecondaryTagIds: string[];
  setSelectedSecondaryTagIds: (value: string[]) => void;
  selectedPrimaryTagIds: string[];
  setSelectedPrimaryTagIds: (value: string[]) => void;
  optionals: TaskOptionals;
  setOptionals: (value: TaskOptionals) => void;
}

interface TaskContentProps {
  isEditMode: boolean;
  activeTab: "details" | "history";
  task: Task;
  form: FormState;
  history: TaskHistoryEntry[];
  users: UserData[];
  contacts: Contact[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  isDarkMode: boolean;
  isLoadingHistory: boolean;
  onAddNote: (text: string) => Promise<void>;
  getActionDescription: (entry: any, config: any) => React.ReactNode;
  onMentionClick: (contactName: string) => void;
  onStatusChangeRequest: (newStatus: any) => void;
}

export const TaskContent: React.FC<TaskContentProps> = ({
  isEditMode,
  activeTab,
  task,
  form,
  history,
  users,
  contacts,
  primaryTags,
  secondaryTags,
  isDarkMode,
  isLoadingHistory,
  onAddNote,
  getActionDescription,
  onMentionClick,
  onStatusChangeRequest,
}) => {
  if (isEditMode) {
    return (
      <div className="animate-fade-in">
        <TaskForm
          title={form.title}
          setTitle={form.setTitle}
          description={form.description}
          setDescription={form.setDescription}
          priority={form.priority}
          setPriority={form.setPriority}
          startDate={form.startDate}
          setStartDate={form.setStartDate}
          deadline={form.deadline}
          setDeadline={form.setDeadline}
          selectedUserIds={form.selectedUserIds}
          setSelectedUserIds={form.setSelectedUserIds}
          selectedSecondaryTagIds={form.selectedSecondaryTagIds}
          setSelectedSecondaryTagIds={form.setSelectedSecondaryTagIds}
          selectedPrimaryTagIds={form.selectedPrimaryTagIds}
          setSelectedPrimaryTagIds={form.setSelectedPrimaryTagIds}
          optionals={form.optionals}
          setOptionals={form.setOptionals}
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          users={users}
          isDarkMode={isDarkMode}
        />
      </div>
    );
  }

  if (activeTab === "history") {
    return (
      <div className="h-full animate-fade-in">
        <HistoryTimeline
          history={history}
          users={users}
          contacts={contacts}
          isDarkMode={isDarkMode}
          isLoading={isLoadingHistory}
          onAddNote={onAddNote}
          getActionDescription={getActionDescription}
          onMentionClick={onMentionClick}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <TaskDetails
        task={task}
        isDarkMode={isDarkMode}
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        users={users}
        onStatusChangeRequest={onStatusChangeRequest}
      />
    </div>
  );
};
