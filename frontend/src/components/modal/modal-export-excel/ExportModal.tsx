/**
 * ExportModal - Modal for Excel export with blue theme
 * Uses ModalOverlay for consistent backdrop behavior
 */
import React, { useState, useCallback, useMemo } from "react";
import { X, FileSpreadsheet, Tag, Calendar, FileText } from "lucide-react";
import { useTheme } from "../../../contexts";
import {
  useTasksQuery,
  useUsersQuery,
  usePrimaryTagsQuery,
  useSecondaryTagsQuery,
} from "../../../api/queries";
import {
  mapUsersToUserData,
  mapPrimaryTagsToData,
  mapSecondaryTagsToData,
} from "../../../api/typeMappers";
import { exportTasksToExcel } from "../../../utils/excelExport";
import { ModalOverlay } from "../../common/ModalOverlay";
import TagsFilter from "./TagsFilter";
import DateRangeFilter from "./DateRangeFilter";
import FieldsSelector from "./FieldsSelector";
import ExportButton from "./ExportButton";
import { useExportFilters } from "./useExportFilters";
import type { UserData } from "../../../schemas/userTypes";
import type { SecondaryTagData } from "../../../schemas/tagTypes";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();

  // React Query - Data (cached, deduplicated)
  const { data: tasksData = [] } = useTasksQuery();
  const { data: usersData = [] } = useUsersQuery();
  const { data: primaryTagsData = [] } = usePrimaryTagsQuery();
  const { data: secondaryTagsData = [] } = useSecondaryTagsQuery();

  // Map API types to frontend schema types
  const tasks = tasksData;
  const users = useMemo(() => mapUsersToUserData(usersData), [usersData]);
  const primaryTags = useMemo(() => mapPrimaryTagsToData(primaryTagsData), [primaryTagsData]);
  const secondaryTags = useMemo(() => mapSecondaryTagsToData(secondaryTagsData), [secondaryTagsData]);

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
            filename: `HD_TASKS_EXPORT_${new Date().toISOString().split("T")[0]
              }`,
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

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-2xl">
      {/* Modal - keeps original size */}
      <div
        className={`
          w-full h-[600px] flex flex-col
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
              className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-slate-800"
                }`}
            >
              הפקת דוחות
            </h1>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode
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
                className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"
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
                className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"
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
                className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"
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
    </ModalOverlay>
  );
};

export default ExportModal;
