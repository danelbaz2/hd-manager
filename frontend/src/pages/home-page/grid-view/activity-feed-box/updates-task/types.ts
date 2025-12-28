// Types for the Updates Task component
import type { TaskHistoryEntry } from "../../../../../api/tasksApi";

export type ListItem =
  | { type: "date"; date: number; key: string }
  | { type: "update"; entry: TaskHistoryEntry; key: string };

export interface UpdatesTaskProps {
  taskTitleMap: Record<string, string>;
  users: UserData[];
  isDarkMode: boolean;
  selectedDate: number;
  onUpdateClick: (taskId: string) => void;
  onDataRefresh?: () => void; // Called when WebSocket update arrives to refresh parent data
}

// Re-export types from other modules
import type { UserData } from "../../../../../schemas/userTypes";
import type { PrimaryTagData, SecondaryTagData } from "../../../../../schemas/tagTypes";

export type { UserData, PrimaryTagData, SecondaryTagData, TaskHistoryEntry };
