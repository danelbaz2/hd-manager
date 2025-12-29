import React from "react";
import { ArrowLeft } from "lucide-react";
import type { TaskHistoryEntry, UserData, PrimaryTagData, SecondaryTagData } from "./types";
import { FIELD_LABELS, formatValue } from "./updateFormatters";

interface UpdateContentProps {
  entry: TaskHistoryEntry;
  title: string;
  changedFields: string[];
  isDarkMode: boolean;
  users: UserData[];
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  actionLabel: string;
}

export const UpdateContent: React.FC<UpdateContentProps> = ({
  entry,
  title,
  changedFields,
  isDarkMode,
  users,
  primaryTags,
  secondaryTags,
  actionLabel,
}) => {
  const textColor = isDarkMode ? "text-slate-300" : "text-slate-600";

  if (entry.action === "NOTE" && entry.note) {
    return <p className={`text-sm ${textColor}`}>{entry.note}</p>;
  }

  if (entry.action === "CREATE") {
    return (
      <p className={`text-sm ${textColor}`}>
        יצר את המשימה "<span className="font-medium">{title}</span>"
      </p>
    );
  }

  if (entry.action === "DELETE") {
    return (
      <p className={`text-sm ${textColor}`}>
        מחק את המשימה "<span className="font-medium text-red-500">{title}</span>
        "
      </p>
    );
  }

  if (changedFields.length > 0) {
    return (
      <div className="space-y-1">
        <p className={`text-sm font-medium ${textColor}`}>{title}</p>
        {changedFields.map((field) => (
          <div
            key={field}
            className={`text-sm flex items-center gap-1.5 flex-wrap ${isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
          >
            <span className="font-medium">{FIELD_LABELS[field]}:</span>
            {entry.oldValues?.[field] !== undefined && (
              <>
                <span className="opacity-60 line-through">
                  {formatValue(field, entry.oldValues[field], users, primaryTags, secondaryTags)}
                </span>
                <ArrowLeft className="w-3 h-3 opacity-50" />
              </>
            )}
            <span className={isDarkMode ? "text-blue-300" : "text-blue-600"}>
              {formatValue(field, entry.changes?.[field], users, primaryTags, secondaryTags)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <p className={`text-sm ${textColor}`}>
      {actionLabel} "<span className="font-medium">{title}</span>"
    </p>
  );
};
