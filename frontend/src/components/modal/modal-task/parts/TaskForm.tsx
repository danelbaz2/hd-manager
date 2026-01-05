import React, { useRef, useLayoutEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  PrioritySelect,
  TwoTierTagsSelect,
  UserSelect,
  DatePicker,
} from "../../modal-new-task/components";
import type {
  TaskPriority,
  TaskOptionals,
} from "../../../../schemas/taskTypes";
import type { UserData } from "../../../../schemas/userTypes";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../../schemas/tagTypes";

interface TaskFormProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  priority: TaskPriority;
  setPriority: (value: TaskPriority) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  deadline: string;
  setDeadline: (value: string) => void;
  selectedUserIds: string[];
  setSelectedUserIds: (value: string[]) => void;
  selectedSecondaryTagIds: string[];
  setSelectedSecondaryTagIds: (value: string[]) => void;
  selectedPrimaryTagIds: string[];
  setSelectedPrimaryTagIds: (value: string[]) => void;
  optionals: TaskOptionals;
  setOptionals: (value: TaskOptionals) => void;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  users: UserData[];
  isDarkMode: boolean;
  isLoading?: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  title,
  setTitle,
  description,
  setDescription,
  priority,
  setPriority,
  startDate,
  setStartDate,
  deadline,
  setDeadline,
  selectedUserIds,
  setSelectedUserIds,
  selectedSecondaryTagIds,
  setSelectedSecondaryTagIds,
  selectedPrimaryTagIds,
  setSelectedPrimaryTagIds,
  optionals,
  setOptionals,
  primaryTags,
  secondaryTags,
  users,
  isDarkMode,
  isLoading = false,
}) => {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand if optionals have content
  const [showOptionals, setShowOptionals] = useState(() => {
    if (!optionals) return false;
    return !!(
      optionals.pikud ||
      optionals.ugda ||
      optionals.hativa ||
      optionals.gdud ||
      optionals.externalSystem
    );
  });

  const adjustHeight = (
    el: HTMLTextAreaElement | null,
    min: number,
    max: number
  ) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(Math.max(el.scrollHeight, min), max) + "px";
  };

  useLayoutEffect(() => {
    adjustHeight(titleRef.current, 40, 120);
    adjustHeight(descRef.current, 56, 112);
  }, []); // Run once on mount to set initial height based on content

  // Also run when loading finishes or content changes (mostly for loading)
  useLayoutEffect(() => {
    if (!isLoading) {
      adjustHeight(titleRef.current, 40, 120);
      adjustHeight(descRef.current, 56, 112);
    }
  }, [isLoading, title, description]);

  const inputClass = `
    w-full px-3 py-1.5 rounded-xl border-2 text-sm transition-all
    ${
      isDarkMode
        ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
        : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500/20
  `;

  return (
    <div className="space-y-2">
      {/* Title & Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label
            className={`block text-sm lg:text-base font-medium mb-1 ${
              isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            כותרת המשימה
          </label>
          <textarea
            ref={titleRef}
            placeholder="לדוגמה: עדכון שרתי בסיס נתונים"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              adjustHeight(e.target, 40, 120);
            }}
            maxLength={100}
            rows={1}
            className={`
              w-full px-3 py-1.5 rounded-xl border-2 text-sm lg:text-base font-medium transition-all resize-none overflow-y-auto scrollbar-hide
              min-h-10 lg:min-h-11
              ${
                isDarkMode
                  ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                  : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
          />
        </div>
        <PrioritySelect value={priority} onChange={setPriority} />
      </div>

      {/* Description */}
      <div>
        <label
          className={`block text-sm lg:text-base font-medium mb-1.5 ${
            isDarkMode ? "text-slate-300" : "text-slate-700"
          }`}
        >
          תיאור
        </label>
        <textarea
          ref={descRef}
          placeholder="פרט את דרישות המשימה..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            adjustHeight(e.target, 56, 112);
          }}
          rows={2}
          maxLength={1000}
          className={`
            w-full px-3 py-1.5 rounded-xl border-2 resize-none text-sm lg:text-base transition-all overflow-y-auto scrollbar-hide
            ${
              isDarkMode
                ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          style={{ minHeight: "56px", maxHeight: "112px" }}
        />
      </div>

      {/* Tags & Dates Row - 12 col grid for better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6">
          <TwoTierTagsSelect
            primaryTags={primaryTags}
            secondaryTags={secondaryTags}
            selectedSecondaryTagIds={selectedSecondaryTagIds}
            onChange={setSelectedSecondaryTagIds}
            selectedPrimaryTagIds={selectedPrimaryTagIds}
            onChangePrimary={setSelectedPrimaryTagIds}
            isLoading={isLoading}
          />
        </div>
        <div className="md:col-span-3">
          <DatePicker
            label="תאריך התחלה"
            value={startDate}
            onChange={setStartDate}
            placeholder="בחר תאריך"
          />
        </div>
        <div className="md:col-span-3">
          <DatePicker
            label="תאריך יעד"
            value={deadline}
            onChange={setDeadline}
            placeholder="בחר תאריך"
          />
        </div>
      </div>

      {/* Optional Fields Toggle */}
      <div className="flex justify-right">
        <button
          type="button"
          onClick={() => setShowOptionals(!showOptionals)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
            isDarkMode
              ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          }`}
        >
          <span>שדות אופציונליים</span>
          {showOptionals ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Military Hierarchy & External System Row - Smooth Animation */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          showOptionals
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-4 pt-2">
            {/* Military Hierarchy */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  פיקוד
                </label>
                <input
                  type="text"
                  placeholder="צפון"
                  value={optionals?.pikud || ""}
                  onChange={(e) =>
                    setOptionals({ ...optionals, pikud: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  אוגדה
                </label>
                <input
                  type="text"
                  placeholder="91"
                  value={optionals?.ugda || ""}
                  onChange={(e) =>
                    setOptionals({ ...optionals, ugda: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  חטיבה
                </label>
                <input
                  type="text"
                  placeholder="300"
                  value={optionals?.hativa || ""}
                  onChange={(e) =>
                    setOptionals({ ...optionals, hativa: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  className={`block text-xs font-medium mb-1 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  גדוד
                </label>
                <input
                  type="text"
                  placeholder="299"
                  value={optionals?.gdud || ""}
                  onChange={(e) =>
                    setOptionals({ ...optionals, gdud: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            {/* External System Integration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 items-center">
              <div>
                <label
                  className={`block text-xs font-medium mb-1.5 ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  מערכת חיצונית
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const current = optionals?.externalSystem;
                      const newSys = current === "SNOW" ? undefined : "SNOW";
                      const newOpts = { ...optionals, externalSystem: newSys };
                      if (!newSys) delete newOpts.externalId;
                      setOptionals(newOpts);
                    }}
                    className={`
                      flex-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${
                        optionals?.externalSystem === "SNOW"
                          ? "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20"
                          : isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    SNOW
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const current = optionals?.externalSystem;
                      const newSys = current === "MARS" ? undefined : "MARS";
                      const newOpts = { ...optionals, externalSystem: newSys };
                      if (!newSys) delete newOpts.externalId;
                      setOptionals(newOpts);
                    }}
                    className={`
                      flex-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                      ${
                        optionals?.externalSystem === "MARS"
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : isDarkMode
                          ? "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }
                    `}
                  >
                    MARS
                  </button>
                </div>
              </div>

              {(optionals?.externalSystem === "SNOW" ||
                optionals?.externalSystem === "MARS") && (
                <div className="animate-fadeSlideIn">
                  <label
                    className={`block text-xs font-medium mb-1 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    מספר תקלה
                  </label>
                  <input
                    type="text"
                    placeholder={
                      optionals.externalSystem === "SNOW" ? "INC1234567" : "555"
                    }
                    value={optionals?.externalId || ""}
                    onChange={(e) =>
                      setOptionals({ ...optionals, externalId: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assignees */}
      <UserSelect
        users={users}
        selectedUserIds={selectedUserIds}
        onChange={setSelectedUserIds}
        isLoading={isLoading}
      />
    </div>
  );
};
