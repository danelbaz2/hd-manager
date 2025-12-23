import React from "react";
import { User, Calendar } from "lucide-react";
import { useTheme } from "../../contexts";
import { type Task } from "../../api/tasksApi";
import { type UserData } from "../../schemas/userTypes";
import { type SecondaryTagData } from "../../schemas/tagTypes";
import {
  getStatusStyle,
  getGradientStyle,
} from "../home-page/parts/taskItemUtils";
import { Tooltip } from "../../components/tags-tooltip";

interface Props {
  task: Task;
  users: UserData[];
  tags: SecondaryTagData[];
  onTaskClick?: (task: Task) => void;
}

const ArchiveTaskRow: React.FC<Props> = ({
  task,
  users,
  tags,
  onTaskClick,
}) => {
  const { isDarkMode } = useTheme();
  const status = getStatusStyle(task.status);
  const assigned = users.filter((u) => task.responsibleUserIds?.includes(u.id));
  const colors = assigned.map((u) => u.color);
  const taskTags = tags.filter((t) => task.secondaryTagIds?.includes(t.id));
  const fmtDate = (ts?: number) =>
    ts ? new Date(ts).toLocaleDateString("he-IL") : "---";

  return (
    <div
      className={`flex items-center gap-4 p-4 lg:p-5 border-b transition-all duration-200 hover:shadow-lg cursor-pointer group
      ${
        isDarkMode
          ? "bg-slate-800/50 border-slate-700/50 hover:bg-slate-800"
          : "bg-white border-slate-100 hover:bg-slate-50"
      }`}
      dir="rtl"
      onClick={() => onTaskClick?.(task)}
    >
      <div
        className="w-1 h-14 rounded-full shrink-0 group-hover:h-16 transition-all"
        style={getGradientStyle(colors)}
      />
      <div className="shrink-0 w-16 lg:w-20 text-xs font-mono text-center text-slate-400">
        {task.id?.slice(-6) || "---"}
      </div>
      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold text-sm lg:text-base truncate ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {task.title || "ללא כותרת"}
        </h3>
        {taskTags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {taskTags.slice(0, 3).map((tag) => (
              <Tooltip key={tag.id} content={tag.description} position="top">
                <span
                  className="px-2 py-0.5 rounded text-xs font-medium"
                  style={{
                    backgroundColor: (tag.color || "#94A3B8") + "40",
                    color: tag.color || "#94A3B8",
                  }}
                >
                  {tag.name}
                </span>
              </Tooltip>
            ))}
            {taskTags.length > 3 && (
              <span
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                +{taskTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="w-20 lg:w-24 shrink-0 flex justify-center">
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>
      <div className="w-24 lg:w-28 shrink-0 flex items-center gap-1.5">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span
          className={`text-xs lg:text-sm ${
            isDarkMode ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {fmtDate(task.date)}
        </span>
      </div>
      <div className="w-36 lg:w-44 shrink-0 flex items-center gap-2">
        {assigned.length > 0 ? (
          <>
            <div className="flex -space-x-2 space-x-reverse">
              {assigned.slice(0, 2).map((u, i) => (
                <div
                  key={u.id}
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: u.color, zIndex: 2 - i }}
                >
                  {u.profileImage ? (
                    <img
                      src={u.profileImage}
                      alt={u.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
              ))}
            </div>
            <div className="hidden lg:block min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  isDarkMode ? "text-slate-200" : "text-slate-700"
                }`}
              >
                {assigned[0].fullName}
              </p>
              {assigned.length > 1 && (
                <p
                  className={`text-xs ${
                    isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  +{assigned.length - 1} נוספים
                </p>
              )}
            </div>
          </>
        ) : (
          <span
            className={`text-xs ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            לא משויך
          </span>
        )}
      </div>
    </div>
  );
};

export default ArchiveTaskRow;
