/**
 * FieldsSelector - Compact component for selecting export fields (Blue theme)
 */
import React from "react";
import { Check } from "lucide-react";
import { useTheme } from "../../../contexts";
import type { ExportFieldConfig } from "../../../schemas/exportTypes";

interface FieldsSelectorProps {
  fields: ExportFieldConfig[];
  onFieldToggle: (key: string) => void;
}

const FieldsSelector: React.FC<FieldsSelectorProps> = ({
  fields,
  onFieldToggle,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="flex flex-wrap gap-2">
      {fields.map((field) => (
        <button
          key={field.key}
          onClick={() => onFieldToggle(field.key)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg
            text-xs font-medium transition-all
            ${
              field.enabled
                ? isDarkMode
                  ? "bg-blue-900/40 text-blue-300 border border-blue-500/50"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
                : isDarkMode
                ? "bg-slate-700/50 text-slate-400 border border-slate-600"
                : "bg-slate-50 text-slate-500 border border-slate-200"
            }
          `}
        >
          <div
            className={`
              w-3.5 h-3.5 rounded flex items-center justify-center shrink-0
              ${
                field.enabled
                  ? "bg-blue-500 text-white"
                  : isDarkMode
                  ? "bg-slate-600"
                  : "bg-slate-200"
              }
            `}
          >
            {field.enabled && <Check size={8} />}
          </div>
          {field.label}
        </button>
      ))}
    </div>
  );
};

export default FieldsSelector;
