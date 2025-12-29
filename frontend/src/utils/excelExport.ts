/**
 * Excel Export Utility
 * Creates and downloads Excel (.xlsx) files from task data
 */

import * as XLSX from "xlsx";
import type { Task } from "../api/tasksApi";

export interface ExportField {
  key: string;
  label: string;
  enabled: boolean;
}

export interface ExportOptions {
  fields: ExportField[];
  filename?: string;
}

// Available export fields with Hebrew labels
// Default enabled: מזהה, כותרת, תיאור, אחראים, תגיות
export const EXPORT_FIELDS: ExportField[] = [
  { key: "id", label: "מספר משימה", enabled: true },
  { key: "title", label: "שם משימה", enabled: true },
  { key: "description", label: "תיאור", enabled: true },
  { key: "responsibleUsers", label: "אחראים", enabled: true },
  { key: "tags", label: "תגיות", enabled: true },
  { key: "status", label: "סטטוס", enabled: false },
  { key: "priority", label: "עדיפות", enabled: false },
  { key: "date", label: "תאריך התחלה", enabled: false },
  { key: "deadline", label: "תאריך יעד", enabled: false },
];

// Status labels in Hebrew
const STATUS_LABELS: Record<string, string> = {
  pending: "פתוח",
  in_progress: "בטיפול",
  completed: "סגור",
};

// Priority labels in Hebrew
const PRIORITY_LABELS: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
};

/**
 * Format date for Excel display
 */
const formatDate = (timestamp?: number): string => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("he-IL");
};

interface ExportContext {
  getUserName: (id: string) => string;
  getTagName: (id: string) => string;
}

/**
 * Get field value from task
 */
const getFieldValue = (
  task: Task,
  fieldKey: string,
  context: ExportContext
): string => {
  switch (fieldKey) {
    case "id":
      return task.id.slice(-6);
    case "title":
      return task.title || "";
    case "description":
      return task.description || "";
    case "status":
      return STATUS_LABELS[task.status || "pending"] || task.status || "";
    case "priority":
      return PRIORITY_LABELS[task.priority || "medium"] || task.priority || "";
    case "date":
      return formatDate(task.date);
    case "deadline":
      return formatDate(task.deadline);
    case "responsibleUsers":
      return (task.responsibleUserIds || [])
        .map((id) => context.getUserName(id))
        .filter(Boolean)
        .join(", ");
    case "tags":
      return (task.secondaryTagIds || [])
        .map((id) => context.getTagName(id))
        .filter(Boolean)
        .join(", ");
    default:
      return "";
  }
};

/**
 * Prepare data for Excel
 */
const prepareDataForExcel = (
  tasks: Task[],
  options: ExportOptions,
  context: ExportContext
): any[] => {
  const enabledFields = options.fields.filter((f) => f.enabled);

  return tasks.map((task) => {
    const rowData: Record<string, string> = {};

    enabledFields.forEach((field) => {
      rowData[field.label] = getFieldValue(task, field.key, context);
    });

    return rowData;
  });
};

/**
 * Export tasks to Excel (.xlsx)
 */
export const exportTasksToExcel = (
  tasks: Task[],
  options: ExportOptions,
  context: ExportContext
): void => {
  const filename = options.filename || `tasks_export_${Date.now()}`;
  const data = prepareDataForExcel(tasks, options, context);

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  // Set column widths (optional auto-width based on header length approx)
  const wscols = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(20, key.length + 5) }));
  ws['!cols'] = wscols;
  ws['!dir'] = 'rtl'; // Set sheet direction to RTL

  // Append sheet
  XLSX.utils.book_append_sheet(wb, ws, "משימות");

  // Write file
  XLSX.writeFile(wb, `${filename}.xlsx`);
};
