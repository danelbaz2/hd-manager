import React from "react";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
} from "../../../../schemas/taskTypes";
import type { TaskHistoryEntry } from "../../../../api/tasksApi";
import type { UserData } from "../../../../schemas/userTypes";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../../schemas/tagTypes";
import type { ActionConfigItem } from "./historyConfig";
import { MentionText } from "../../../../pages/home-page/grid-view/activity-feed-box/update-team/mention/MentionText";
import type { Contact } from "../../../../api/contactsApi";

// Helpers
export const getUserNames = (
  userIds: string[],
  users: UserData[]
): string[] => {
  return userIds
    .map((id) => users.find((u) => u.id === id)?.fullName)
    .filter((name): name is string => !!name);
};

export const getSecondaryTagNames = (
  tagIds: string[],
  secondaryTags: SecondaryTagData[]
): string[] => {
  return tagIds
    .map((id) => secondaryTags.find((t) => t.id === id)?.name)
    .filter((name): name is string => !!name);
};

export const getPrimaryTagNames = (
  tagIds: string[],
  primaryTags: PrimaryTagData[]
): string[] => {
  return tagIds
    .map((id) => primaryTags.find((t) => t.id === id)?.name)
    .filter((name): name is string => !!name);
};

export const getOptionalLabel = (key: string): string => {
  switch (key) {
    case "pikud": return "פיקוד";
    case "ugda": return "אוגדה";
    case "hativa": return "חטיבה";
    case "gdud": return "גדוד";
    case "externalSystem": return "מערכת חיצונית";
    case "externalId": return "מזהה אירוע";
    default: return key;
  }
};

export const getFieldLabel = (field: string): string => {
  switch (field) {
    case "title":
      return "כותרת";
    // ... (existing cases) ...



    // For all other actions check for field changes
    case "description":
      return "תיאור";
    case "priority":
      return "עדיפות";
    case "status":
      return "סטטוס";
    case "date":
      return "תאריך התחלה";
    case "deadline":
      return "תאריך יעד";
    case "responsibleUserIds":
      return "אחראים";
    case "secondaryTagIds":
      return "תגיות";
    case "primaryTagIds":
      return "קטגוריות";
    default:
      return field;
  }
};

export const formatValue = (
  field: string,
  value: any,
  users: UserData[],
  secondaryTags: SecondaryTagData[],
  primaryTags: PrimaryTagData[]
): string => {
  if (value === null || value === undefined) return "ריק";

  switch (field) {
    case "priority":
      return PRIORITY_OPTIONS.find((o) => o.id === value)?.label || value;
    case "status":
      return STATUS_OPTIONS.find((o) => o.id === value)?.label || value;
    case "date":
    case "deadline":
      return value ? new Date(value).toLocaleDateString("he-IL") : "לא נקבע";
    case "responsibleUserIds":
      const names = getUserNames(value as string[], users);
      return names.length > 0 ? names.join(", ") : "אין אחראים";
    case "secondaryTagIds":
      const sTags = getSecondaryTagNames(value as string[], secondaryTags);
      return sTags.length > 0 ? sTags.join(", ") : "אין תגיות";
    case "primaryTagIds":
      if (!value || value.length === 0) return "אין קטגוריות";
      const pTags = getPrimaryTagNames(value as string[], primaryTags);
      return pTags.length > 0 ? pTags.join(", ") : "אין קטגוריות";
    case "title":
    case "description":
      return value.toString();
    default:
      return JSON.stringify(value);
  }
};

export const getActionDescription = (
  entry: TaskHistoryEntry,
  config: ActionConfigItem,
  users: UserData[],
  secondaryTags: SecondaryTagData[],
  primaryTags: PrimaryTagData[],
  isDarkMode: boolean,
  onMentionClick?: (contactName: string) => void,
  contacts?: Contact[]
): React.ReactNode => {
  const changes = entry.changes || {};
  const oldValues = entry.oldValues || {};
  const responsibleUserIds = changes.responsibleUserIds as string[] | undefined;

  // NOTE action
  if (entry.action === "NOTE" && entry.note) {
    const validNames = contacts?.map(c => c.fullName);
    return (
      <MentionText
        content={entry.note}
        isDarkMode={isDarkMode}
        onMentionClick={onMentionClick}
        validContactNames={validNames}
      />
    );
  }

  // CREATE action
  if (entry.action === "CREATE") {
    if (responsibleUserIds && responsibleUserIds.length > 0) {
      const names = getUserNames(responsibleUserIds, users);
      if (names.length > 0) {
        return `המשימה נוצרה ושויכה ל: ${names.join(", ")}`;
      }
    }
    return "המשימה נוצרה";
  }



  // APPROVE action
  if (entry.action === "APPROVE") {
    return (
      <span>
        <span className="font-bold text-emerald-500">אישר וסגר</span> את המשימה
      </span>
    );
  }

  // REJECT action
  if (entry.action === "REJECT") {
    return <span className="font-bold">המשימה נדחתה והוחזרה לטיפול</span>;
  }

  // UPDATE_OPTIONALS or UPDATE_EXTERNAL_SYSTEM action
  if (entry.action === "UPDATE_OPTIONALS" || entry.action === "UPDATE_EXTERNAL_SYSTEM") {
    const opts = (entry.changes.optionals as Record<string, any>) || {};
    const oldOpts = (entry.oldValues?.optionals as Record<string, any>) || {};

    // Separate system fields from others
    const systemKeys = ["externalSystem", "externalId"];
    const otherKeys = Object.keys(opts).filter(k => !systemKeys.includes(k));
    const hasSystemChanges = Object.keys(opts).some(k => systemKeys.includes(k));

    const getSysName = (s: any) => s === 'SNOW' ? 'ServiceNow' : (s === 'MARS' ? 'MARS' : s);

    const renderSystemChange = () => {
      const newSys = opts.externalSystem;
      const oldSys = oldOpts.externalSystem;
      const newId = opts.externalId;
      const effectiveId = newId || oldOpts.externalId;

      if (newSys !== undefined) {
        // System changed
        if (newSys && !oldSys) {
          return (
            <div className="text-sm flex items-center gap-1.5 p-1 bg-emerald-50/50 dark:bg-emerald-900/10 rounded">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">קושר למערכת {getSysName(newSys)}</span>
              {(newId || effectiveId) && <span className="text-slate-500 text-xs">(#{newId || effectiveId})</span>}
            </div>
          );
        } else if (!newSys && oldSys) {
          return (
            <div className="text-sm flex items-center gap-1.5 p-1 bg-red-50/50 dark:bg-red-900/10 rounded">
              <span className="font-semibold text-red-500 dark:text-red-400">הוסר קישור מ-{getSysName(oldSys)}</span>
            </div>
          );
        } else {
          return (
            <div className="text-sm flex items-center gap-1.5">
              <span>שונה מ-{getSysName(oldSys)} ל-</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{getSysName(newSys)}</span>
            </div>
          );
        }
      } else if (newId !== undefined) {
        // Only ID changed
        return (
          <div className="text-sm flex items-center gap-1.5">
            <span className="font-semibold">שונה מזהה תקלה:</span>
            <span className="opacity-75 line-through">{oldOpts.externalId || "ריק"}</span>
            <span>←</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">{newId}</span>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="flex flex-col gap-1.5">
        {hasSystemChanges && renderSystemChange()}

        {otherKeys.map((key) => {
          const label = getOptionalLabel(key);
          const val = opts[key];
          const old = oldOpts[key] || "ריק";

          return (
            <div key={key} className="text-sm flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold">{label}:</span>
              <span className="opacity-75 line-through">{old}</span>
              <span>←</span>
              <span className={isDarkMode ? "text-blue-300" : "text-blue-600"}>
                {val || "ריק"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // For all other actions check for field changes
  const changedFields = Object.keys(changes).filter((k) =>
    [
      "title",
      "description",
      "priority",
      "status",
      "date",
      "deadline",
      "responsibleUserIds",
      "secondaryTagIds",
      "primaryTagIds",
    ].includes(k)
  );

  if (changedFields.length > 0) {
    return (
      <div className="flex flex-col gap-1.5">
        {changedFields.map((field) => {
          const newValue = formatValue(
            field,
            changes[field],
            users,
            secondaryTags,
            primaryTags
          );
          const oldValue = formatValue(
            field,
            oldValues[field],
            users,
            secondaryTags,
            primaryTags
          );
          const label = getFieldLabel(field);

          return (
            <div
              key={field}
              className="text-sm flex items-center gap-1.5 flex-wrap"
            >
              <span className="font-semibold">{label}:</span>
              <span className="opacity-75 line-through">{oldValue}</span>
              <span>←</span>
              <span className={isDarkMode ? "text-blue-300" : "text-blue-600"}>
                {newValue}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Default to config label
  return config.label;
};
