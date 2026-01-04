// Field label translations
export const FIELD_LABELS: Record<string, string> = {
  title: "כותרת",
  description: "תיאור",
  priority: "עדיפות",
  status: "סטטוס",
  date: "תאריך",
  deadline: "תאריך יעד",
  responsibleUserIds: "אחראים",
  primaryTagIds: "קטגוריות",
  secondaryTagIds: "תגיות",
};

export const STATUS_LABELS: Record<string, string> = {
  pending: "פתוח",
  in_progress: "בטיפול",
  pending_approval: "ממתין לאישור",
  completed: "סגור",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "נמוכה",
  medium: "בינונית",
  high: "גבוהה",
};

import type { UserData, PrimaryTagData, SecondaryTagData } from "./types";

// Format time as HH:MM
export const formatTime = (ts: number): string =>
  new Date(ts).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

// Format field value for display
export const formatValue = (
  field: string,
  value: unknown,
  users: UserData[],
  primaryTags?: PrimaryTagData[],
  secondaryTags?: SecondaryTagData[]
): string => {
  if (value === null || value === undefined) return "ריק";
  if (field === "priority") return PRIORITY_LABELS[value as string] || String(value);
  if (field === "status") return STATUS_LABELS[value as string] || String(value);
  if (field === "date" || field === "deadline")
    return value ? new Date(value as number).toLocaleDateString("he-IL") : "לא נקבע";
  if (field === "responsibleUserIds") {
    const names = (value as string[])
      .map((id) => users.find((u) => u.id === id)?.fullName)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "אין אחראים";
  }
  if (field === "primaryTagIds" && primaryTags) {
    const names = (value as string[])
      .map((id) => primaryTags.find((t) => t.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "ללא קטגוריות";
  }
  if (field === "secondaryTagIds" && secondaryTags) {
    const names = (value as string[])
      .map((id) => secondaryTags.find((t) => t.id === id)?.name)
      .filter(Boolean);
    return names.length > 0 ? names.join(", ") : "ללא תגיות";
  }
  return String(value);
};
