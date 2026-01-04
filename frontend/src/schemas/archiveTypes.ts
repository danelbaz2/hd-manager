// Archive page shared types

export interface ArchiveFilters {
  title: string;
  taskId: string;
  startDate: number | null;
  endDate: number;
  tagIds: string[];
}

export const defaultFilters: ArchiveFilters = {
  title: "",
  taskId: "",
  startDate: null,
  endDate: Date.now(),
  tagIds: [],
};
