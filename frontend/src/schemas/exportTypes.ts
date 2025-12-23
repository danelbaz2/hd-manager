/**
 * Export Types - Types for Excel export functionality
 */

export interface ExportFilters {
  primaryTagIds: string[];
  secondaryTagIds: string[];
  startDate: string;
  endDate: string;
}

export interface ExportFieldConfig {
  key: string;
  label: string;
  enabled: boolean;
}

// Get default date range (last month)
const getLastMonthRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
};

export const DEFAULT_FILTERS: ExportFilters = {
  primaryTagIds: [],
  secondaryTagIds: [],
  ...getLastMonthRange(),
};
