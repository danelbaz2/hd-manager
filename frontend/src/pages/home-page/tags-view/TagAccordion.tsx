import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";
import {
  type PrimaryTagData,
  type SecondaryTagData,
} from "../../../schemas/tagTypes";
import TagTaskCard from "./TagTaskCard";

interface TagAccordionProps {
  primaryTag: PrimaryTagData;
  secondaryTags: SecondaryTagData[];
  tasks: Task[];
  users: UserData[];
}

const TagAccordion: React.FC<TagAccordionProps> = ({
  primaryTag,
  secondaryTags,
  tasks,
  users,
}) => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-200
        ${
          isDarkMode
            ? "border-slate-700 bg-slate-800/50"
            : "border-slate-200 bg-white shadow-sm"
        }`}
    >
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-5 py-4
          transition-colors duration-200
          ${isDarkMode ? "hover:bg-slate-700/50" : "hover:bg-slate-50"}`}
      >
        <div className="flex items-center gap-3">
          {/* Tag Color Badge */}
          <span
            className="px-4 py-1.5 rounded-lg text-sm font-bold text-white"
            style={{ backgroundColor: primaryTag.color }}
          >
            {primaryTag.name}
          </span>

          {/* Task Count */}
          <span
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {tasks.length} משימות
          </span>
        </div>

        {/* Chevron Icon */}
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-200
            ${isOpen ? "rotate-180" : ""}
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div
          className={`px-5 pb-4 border-t
            ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}
        >
          <div className="space-y-3 pt-4">
            {tasks.map((task) => (
              <TagTaskCard
                key={task.id}
                task={task}
                users={users}
                secondaryTags={secondaryTags}
                primaryColor={primaryTag.color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagAccordion;
