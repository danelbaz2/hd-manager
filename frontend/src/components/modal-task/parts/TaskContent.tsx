import React from "react";
import type { Task } from "../../../api/tasksApi";
import type { TaskHistoryEntry } from "../../../api/tasksApi";
import type { UserData } from "../../../schemas/userTypes";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../schemas/tagTypes";
import type { TaskPriority } from "../../../schemas/taskTypes";

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
}

interface TaskContentProps {
  isEditMode: boolean;
  activeTab: "details" | "history";
  task: Task;
  form: FormState;
  history: TaskHistoryEntry[];
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  isDarkMode: boolean;
  isLoadingHistory: boolean;
  onAddNote: (text: string) => void;
  getActionDescription: (entry: any, config: any) => React.ReactNode;
}

export const TaskContent: React.FC<TaskContentProps> = ({
  isEditMode,
  activeTab,
  task,
  form,
  history,
  users,
  primaryTags,
  secondaryTags,
  isDarkMode,
  isLoadingHistory,
  onAddNote,
  getActionDescription,
}) => {
  if (isEditMode) {
    return (
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
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        users={users}
        isDarkMode={isDarkMode}
      />
    );
  }

  if (activeTab === "history") {
    return (
      <HistoryTimeline
        history={history}
        users={users}
        isDarkMode={isDarkMode}
        isLoading={isLoadingHistory}
        onAddNote={onAddNote}
        getActionDescription={getActionDescription}
      />
    );
  }

  return (
    <TaskDetails
      task={task}
      isDarkMode={isDarkMode}
      primaryTags={primaryTags}
      secondaryTags={secondaryTags}
      users={users}
    />
  );
};
