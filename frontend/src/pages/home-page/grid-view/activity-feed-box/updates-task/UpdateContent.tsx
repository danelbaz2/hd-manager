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

  // Handle notes - support both legacy NOTE action and new note entityType
  if ((entry.action === "NOTE" || (entry.action === "CREATE" && entry.base?.entityType === "note")) && entry.content) {
    return <p className={`text-sm break-words whitespace-pre-line ${textColor}`}>{entry.content}</p>;
  }

  if (entry.action === "CREATE") {
    return (
      <p className={`text-sm break-words ${textColor}`}>
        יצר את המשימה "<span className="font-medium">{title}</span>"
      </p>
    );
  }

  if (entry.action === "DELETE") {
    return (
      <p className={`text-sm break-words ${textColor}`}>
        מחק את המשימה "<span className="font-medium text-red-500">{title}</span>
        "
      </p>
    );
  }

  // Approval workflow actions - show bold descriptive text


  if (entry.action === "APPROVE") {
    return (
      <p className={`text-sm break-words ${textColor}`}>
        <span className="font-bold text-emerald-500">אישר וסגר</span> את המשימה "<span className="font-medium">{title}</span>"
      </p>
    );
  }

  if (entry.action === "REJECT") {
    return (
      <p className={`text-sm break-words ${textColor}`}>
        <span className="font-bold text-red-500">דחה והחזיר לטיפול</span> את המשימה "<span className="font-medium">{title}</span>"
      </p>
    );
  }

  // Handle Optionals and External System
  if (entry.action === "UPDATE_OPTIONALS" || entry.action === "UPDATE_EXTERNAL_SYSTEM") {
    const opts = (entry.changes.optionals as Record<string, any>) || {};
    const oldOpts = (entry.oldValues?.optionals as Record<string, any>) || {};

    // Separate system fields
    const systemKeys = ["externalSystem", "externalId"];
    const otherKeys = Object.keys(opts).filter(k => !systemKeys.includes(k));
    const hasSystemChanges = Object.keys(opts).some(k => systemKeys.includes(k));

    const getSysName = (s: any) => s === 'SNOW' ? 'SNOW' : (s === 'MARS' ? 'MARS' : s);

    // Helpers from historyUtils are not available here automatically, hardcoding or importing
    // Importing getOptionalLabel might fail if path is complex, I'll define it here locally for safety or use switch
    const getLabel = (k: string) => {
      switch (k) {
        case "pikud": return "פיקוד";
        case "ugda": return "אוגדה";
        case "hativa": return "חטיבה";
        case "gdud": return "גדוד";
        case "externalSystem": return "מערכת חיצונית";
        case "externalId": return "מזהה אירוע";
        default: return k;
      }
    };

    const renderSystemChange = () => {
      const newSys = opts.externalSystem;
      const oldSys = oldOpts.externalSystem;
      const newId = opts.externalId;
      const effectiveId = newId || oldOpts.externalId;

      if (newSys !== undefined) {
        if (newSys && !oldSys) {
          return (
            <div className="text-sm flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">קושר למערכת {getSysName(newSys)}</span>
              {(newId || effectiveId) && <span className="text-slate-500 text-xs">(#{newId || effectiveId})</span>}
            </div>
          );
        } else if (!newSys && oldSys) {
          return (
            <div className="text-sm flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-red-500 dark:text-red-400">הוסר קישור מ-{getSysName(oldSys)}</span>
            </div>
          );
        } else {
          return (
            <div className="text-sm flex items-center gap-1.5 flex-wrap">
              <span>שונה מ-{getSysName(oldSys)} ל-</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">{getSysName(newSys)}</span>
            </div>
          );
        }
      } else if (newId !== undefined) {
        return (
          <div className="text-sm flex items-center gap-1.5 flex-wrap">
            <span className="font-medium">שונה מזהה תקלה:</span>
            <span className="opacity-60 line-through">{oldOpts.externalId || "ריק"}</span>
            <ArrowLeft className="w-3 h-3 opacity-50 shrink-0" />
            <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">{newId}</span>
          </div>
        );
      }
      return null;
    };

    return (
      <div className="space-y-1">
        <p className={`text-sm font-medium break-words ${textColor}`}>{title}</p>

        {hasSystemChanges && renderSystemChange()}

        {otherKeys.map(key => {
          const label = getLabel(key);
          const val = opts[key];
          const old = oldOpts[key] || "ריק";
          return (
            <div key={key} className={`text-sm flex flex-wrap items-start gap-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
              <span className="font-medium shrink-0">{label}:</span>
              <span className="opacity-60 line-through break-words whitespace-pre-line">{old}</span>
              <ArrowLeft className="w-3 h-3 opacity-50 shrink-0" />
              <span className={`break-words whitespace-pre-line ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                {val || "ריק"}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  if (changedFields.length > 0) {
    return (
      <div className="space-y-1">
        <p className={`text-sm font-medium break-words ${textColor}`}>{title}</p>
        {changedFields.map((field) => {
          if (field === "optionals" && entry.changes?.optionals) {
            const opts = (entry.changes.optionals as Record<string, any>) || {};
            const oldOpts = (entry.oldValues?.optionals as Record<string, any>) || {};

            // System fields
            const systemKeys = ["externalSystem", "externalId"];
            const otherKeys = Object.keys(opts).filter(k => !systemKeys.includes(k) && opts[k] !== oldOpts[k]);

            // Helpers
            const getSysName = (s: any) => s === 'SNOW' ? 'SNOW' : (s === 'MARS' ? 'MARS' : s);
            const getLabel = (k: string) => {
              switch (k) {
                case "pikud": return "פיקוד";
                case "ugda": return "אוגדה";
                case "hativa": return "חטיבה";
                case "gdud": return "גדוד";
                case "externalSystem": return "מערכת חיצונית";
                case "externalId": return "מספר תקלה";
                default: return k;
              }
            };

            const newSys = opts.externalSystem;
            const oldSys = oldOpts.externalSystem;
            const newId = opts.externalId;
            const oldId = oldOpts.externalId;

            return (
              <React.Fragment key="optionals">
                {/* System Changes */}
                {newSys !== oldSys && newSys !== undefined && (
                  <div className={`text-sm flex flex-wrap items-start gap-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <span className="font-medium shrink-0">מערכת חיצונית:</span>
                    <span className="opacity-60 line-through break-words whitespace-pre-line">{getSysName(oldSys || "ללא")}</span>
                    <ArrowLeft className="w-3 h-3 opacity-50 shrink-0" />
                    <span className={`break-words whitespace-pre-line ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                      {getSysName(newSys || "ללא")}
                    </span>
                  </div>
                )}
                {newId !== oldId && newId !== undefined && (
                  <div className={`text-sm flex flex-wrap items-start gap-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <span className="font-medium shrink-0">מספר תקלה:</span>
                    <span className="opacity-60 line-through break-words whitespace-pre-line">{oldId || "ללא"}</span>
                    <ArrowLeft className="w-3 h-3 opacity-50 shrink-0" />
                    <span className={`break-words whitespace-pre-line ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                      {newId || "ללא"}
                    </span>
                  </div>
                )}

                {/* Other Optionals */}
                {otherKeys.map(key => {
                  const label = getLabel(key);
                  const val = opts[key];
                  const old = oldOpts[key] || "ריק";
                  return (
                    <div key={key} className={`text-sm flex flex-wrap items-start gap-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                      <span className="font-medium shrink-0">{label}:</span>
                      <span className="opacity-60 line-through break-words whitespace-pre-line">{old}</span>
                      <ArrowLeft className="w-3 h-3 opacity-50 shrink-0" />
                      <span className={`break-words whitespace-pre-line ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                        {val || "ריק"}
                      </span>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          }

          return (
            <div
              key={field}
              className={`text-sm flex flex-wrap items-start gap-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
            >
              <span className="font-medium shrink-0">{FIELD_LABELS[field]}:</span>
              {entry.oldValues?.[field] !== undefined && (
                <>
                  <span className="opacity-60 line-through break-words whitespace-pre-line">
                    {formatValue(field, entry.oldValues[field], users, primaryTags, secondaryTags)}
                  </span>
                  <ArrowLeft className="w-3 h-3 opacity-50 shrink-0" />
                </>
              )}
              <span className={`break-words whitespace-pre-line ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>
                {formatValue(field, entry.changes?.[field], users, primaryTags, secondaryTags)}
              </span>
            </div>
          )
        })}
      </div>
    );
  }

  return (
    <p className={`text-sm break-words ${textColor}`}>
      {actionLabel} "<span className="font-medium">{title}</span>"
    </p>
  );
};
