import React from "react";
import {
  PrioritySelect,
  TwoTierTagsSelect,
  UserSelect,
  DatePicker,
} from "../../modal-new-task/components";
import type { TaskPriority } from "../../../schemas/taskTypes";
import type { UserData } from "../../../schemas/userTypes";
import type { PrimaryTagData, SecondaryTagData } from "../../../schemas/tagTypes";

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
}) => {
  return (
    <div className="space-y-4">
      {/* Title & Priority Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label
            className={`block text-sm lg:text-base font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"
              }`}
          >
            כותרת המשימה
          </label>
          <input
            type="text"
            placeholder="לדוגמה: עדכון שרתי בסיס נתונים"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`
              w-full px-4 py-3 rounded-xl border-2 text-sm lg:text-base font-medium transition-all
              ${isDarkMode
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
          className={`block text-sm lg:text-base font-medium mb-2 ${isDarkMode ? "text-slate-300" : "text-slate-700"
            }`}
        >
          תיאור
        </label>
        <textarea
          placeholder="פרט את דרישות המשימה..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={`
            w-full px-4 py-3 rounded-xl border-2 resize-none text-sm lg:text-base transition-all
            ${isDarkMode
              ? "bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 hover:border-slate-500 focus:border-blue-500"
              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-blue-500"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20
          `}
        />
      </div>

      {/* Tags & Dates Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TwoTierTagsSelect
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          selectedSecondaryTagIds={selectedSecondaryTagIds}
          onChange={setSelectedSecondaryTagIds}
          selectedPrimaryTagIds={selectedPrimaryTagIds}
          onChangePrimary={setSelectedPrimaryTagIds}
          isLoading={false}
        />
        <DatePicker
          label="תאריך התחלה"
          value={startDate}
          onChange={setStartDate}
          placeholder="בחר תאריך"
        />
        <DatePicker
          label="תאריך יעד"
          value={deadline}
          onChange={setDeadline}
          placeholder="בחר תאריך"
        />
      </div>

      {/* Assignees */}
      <UserSelect
        users={users}
        selectedUserIds={selectedUserIds}
        onChange={setSelectedUserIds}
        isLoading={false}
      />
    </div>
  );
};
