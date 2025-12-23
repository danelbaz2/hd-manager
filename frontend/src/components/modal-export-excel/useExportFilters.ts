/**
 * useExportFilters - Hook for managing export filter state
 */
import { useState, useMemo, useCallback } from "react";
import type { Task } from "../../api/tasksApi";
import type { ExportFilters, ExportFieldConfig } from "../../schemas/exportTypes";
import { DEFAULT_FILTERS } from "../../schemas/exportTypes";
import { EXPORT_FIELDS } from "../../utils/excelExport";

export const useExportFilters = (tasks: Task[]) => {
  // Filter state - default to last month
  const [filters, setFilters] = useState<ExportFilters>(DEFAULT_FILTERS);

  // Fields state (initialize from EXPORT_FIELDS)
  const [fields, setFields] = useState<ExportFieldConfig[]>(
    EXPORT_FIELDS.map((f) => ({ ...f }))
  );

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Date filter
      if (filters.startDate) {
        const start = new Date(filters.startDate).getTime();
        const taskDate = task.date || task.deadline;
        if (taskDate && taskDate < start) return false;
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate).getTime() + 86400000;
        const taskDate = task.date || task.deadline;
        if (taskDate && taskDate > end) return false;
      }

      // Tag filter (if any secondary tags selected)
      if (filters.secondaryTagIds.length > 0) {
        const taskTags = task.secondaryTagIds || [];
        const hasMatch = filters.secondaryTagIds.some((tagId) =>
          taskTags.includes(tagId)
        );
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  // Update filter handlers
  const setPrimaryTagIds = useCallback((ids: string[]) => {
    setFilters((prev) => ({ ...prev, primaryTagIds: ids }));
  }, []);

  const setSecondaryTagIds = useCallback((ids: string[]) => {
    setFilters((prev) => ({ ...prev, secondaryTagIds: ids }));
  }, []);

  const setStartDate = useCallback((date: string) => {
    setFilters((prev) => ({ ...prev, startDate: date }));
  }, []);

  const setEndDate = useCallback((date: string) => {
    setFilters((prev) => ({ ...prev, endDate: date }));
  }, []);

  // Field toggle handlers
  const toggleField = useCallback((key: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f))
    );
  }, []);

  const selectAllFields = useCallback(() => {
    setFields((prev) => prev.map((f) => ({ ...f, enabled: true })));
  }, []);

  const deselectAllFields = useCallback(() => {
    setFields((prev) => prev.map((f) => ({ ...f, enabled: false })));
  }, []);

  // Reset all
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setFields(EXPORT_FIELDS.map((f) => ({ ...f })));
  }, []);

  return {
    filters,
    fields,
    filteredTasks,
    setPrimaryTagIds,
    setSecondaryTagIds,
    setStartDate,
    setEndDate,
    toggleField,
    selectAllFields,
    deselectAllFields,
    resetFilters,
  };
};
