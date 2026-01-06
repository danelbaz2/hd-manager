// Types for the Updates Task component
import type { TaskHistoryEntry } from "../../../../../api/tasksApi";

export type ListItem =
  | { type: "date"; date: number; key: string }
  | { type: "update"; entry: TaskHistoryEntry; key: string };

export interface UpdatesTaskProps {
  taskTitleMap: Record<string, string>;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  isDarkMode: boolean;
  selectedDate: number;
  onUpdateClick: (taskId: string) => void;
  onDataRefresh?: () => void;
  updatesOverride?: TaskHistoryEntry[];
  lastSeen?: number;
  onLatestUpdate?: (timestamp: number) => void;
  currentUserId?: string;
}

// Re-export types from other modules
import type { UserData } from "../../../../../schemas/userTypes";
import type { PrimaryTagData, SecondaryTagData } from "../../../../../schemas/tagTypes";

export type { UserData, PrimaryTagData, SecondaryTagData, TaskHistoryEntry };
