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

export const DEFAULT_FILTERS: ExportFilters = {
  primaryTagIds: [],
  secondaryTagIds: [],
  startDate: "",
  endDate: "",
};
