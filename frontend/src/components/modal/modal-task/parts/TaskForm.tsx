import React, { useRef, useLayoutEffect } from "react";
import {
  PrioritySelect,
  TwoTierTagsSelect,
  UserSelect,
  DatePicker,
} from "../../modal-new-task/components";
import type { TaskPriority } from "../../../../schemas/taskTypes";
import type { UserData } from "../../../../schemas/userTypes";
import type { PrimaryTagData, SecondaryTagData } from "../../../../schemas/tagTypes";

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
  primaryTags,
  secondaryTags,
  users,
  isDarkMode,
  isLoading = false,
}) => {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = (el: HTMLTextAreaElement | null, min: number, max: number) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(Math.max(el.scrollHeight, min), max) + 'px';
  };

  useLayoutEffect(() => {
    adjustHeight(titleRef.current, 44, 96);
    adjustHeight(descRef.current, 56, 112);
  }, []); // Run once on mount to set initial height based on content

  // Also run when loading finishes or content changes (mostly for loading)
  useLayoutEffect(() => {
    if (!isLoading) {
      adjustHeight(titleRef.current, 44, 96);
      adjustHeight(descRef.current, 56, 112);
    }
  }, [isLoading, title, description]);

  return (
    <div className="space-y-3">
      {/* Title & Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <label
            className={`block text-sm lg:text-base font-medium mb-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"
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
              adjustHeight(e.target, 44, 96);
            }}
            maxLength={100}
            rows={1}
            className={`
              w-full px-3 py-2.5 rounded-xl border-2 text-sm lg:text-base font-medium transition-all resize-none overflow-y-auto scrollbar-hide
              ${isDarkMode
                ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            `}
            style={{ minHeight: '44px', maxHeight: '96px' }}
          />
        </div>
        <PrioritySelect value={priority} onChange={setPriority} />
      </div>

      {/* Description */}
      <div>
        <label
          className={`block text-sm lg:text-base font-medium mb-1.5 ${isDarkMode ? "text-slate-300" : "text-slate-700"
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
            w-full px-3 py-2.5 rounded-xl border-2 resize-none text-sm lg:text-base transition-all overflow-y-auto scrollbar-hide
            ${isDarkMode
              ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
          style={{ minHeight: '56px', maxHeight: '112px' }}
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
