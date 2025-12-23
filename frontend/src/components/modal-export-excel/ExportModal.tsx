/**
 * ExportModal - Compact modal for Excel export with blue theme
 */
import React, { useState, useCallback } from "react";
import { X, FileSpreadsheet, Tag, Calendar, FileText } from "lucide-react";
import { useTheme, useSettings } from "../../contexts";
import { exportTasksToExcel } from "../../utils/excelExport";
import TagsFilter from "./TagsFilter";
import DateRangeFilter from "./DateRangeFilter";
import FieldsSelector from "./FieldsSelector";
import ExportButton from "./ExportButton";
import { useExportFilters } from "./useExportFilters";
import type { UserData } from "../../schemas/userTypes";
import type { SecondaryTagData } from "../../schemas/tagTypes";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { tasks, primaryTags, secondaryTags, users } = useSettings();
  const [isExporting, setIsExporting] = useState(false);

  const {
    filters,
    fields,
    filteredTasks,
    setPrimaryTagIds,
    setSecondaryTagIds,
    setStartDate,
    setEndDate,
    toggleField,
  } = useExportFilters(tasks);

  const getUserName = useCallback(
    (id: string) =>
      (users as UserData[]).find((u) => u.id === id)?.fullName || "",
    [users]
  );

  const getTagName = useCallback(
    (id: string) =>
      (secondaryTags as SecondaryTagData[]).find((t) => t.id === id)?.name ||
      "",
    [secondaryTags]
  );

  const handleExport = useCallback(() => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        exportTasksToExcel(
          filteredTasks,
          {
            fields: fields.map((f) => ({
              key: f.key,
              label: f.label,
              enabled: f.enabled,
            })),
            filename: `tasks_export_${new Date().toISOString().split("T")[0]}`,
          },
          { getUserName, getTagName }
        );
      } catch (error) {
        console.error("Export error:", error);
      } finally {
        setIsExporting(false);
      }
    }, 300);
  }, [filteredTasks, fields, getUserName, getTagName]);

  const enabledFieldCount = fields.filter((f) => f.enabled).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative w-[95%] max-w-2xl h-[600px] flex flex-col
          rounded-2xl shadow-2xl overflow-hidden
          ${isDarkMode ? "bg-slate-800" : "bg-white"}
        `}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`
            flex items-center justify-between px-6 py-4 shrink-0
            border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}
          `}
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={24} className="text-blue-500" />
            <h1
              className={`text-xl font-bold ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              הפקת דוחות
            </h1>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-400"
                  : "hover:bg-slate-100 text-slate-500"
              }
            `}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Tags Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-blue-500" />
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                סינון לפי תגיות
              </span>
            </div>
            <TagsFilter
              primaryTags={primaryTags}
              secondaryTags={secondaryTags}
              selectedPrimaryIds={filters.primaryTagIds}
              selectedSecondaryIds={filters.secondaryTagIds}
              onPrimaryChange={setPrimaryTagIds}
              onSecondaryChange={setSecondaryTagIds}
            />
          </div>

          {/* Date Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-500" />
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                טווח תאריכים
              </span>
            </div>
            <DateRangeFilter
              startDate={filters.startDate}
              endDate={filters.endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>

          {/* Fields Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-500" />
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                שדות לייצוא
              </span>
            </div>
            <FieldsSelector fields={fields} onFieldToggle={toggleField} />
          </div>
        </div>

        {/* Footer */}
        <div
          className={`
            flex items-center justify-end px-6 py-4 shrink-0
            border-t ${isDarkMode ? "border-slate-700" : "border-slate-200"}
          `}
        >
          <ExportButton
            onExport={handleExport}
            isExporting={isExporting}
            taskCount={filteredTasks.length}
            fieldCount={enabledFieldCount}
          />
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
