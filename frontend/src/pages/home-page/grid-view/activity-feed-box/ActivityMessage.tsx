import React from "react";

export interface ActivityItem {
  id: string;
  user: string;
  message: string;
  time: string;
  type: "update" | "note" | "status";
}

interface ActivityMessageProps {
  activity: ActivityItem;
  isDarkMode: boolean;
}

export const ActivityMessage: React.FC<ActivityMessageProps> = ({
  activity,
  isDarkMode,
}) => (
  <div
    className={`p-3 rounded-xl ${
      isDarkMode ? "bg-slate-700/30" : "bg-blue-50/50"
    }`}
  >
    <div className="flex items-start gap-2 justify-between mb-1">
      <span
        className={`text-xs ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {activity.time}
      </span>
      <span
        className={`font-semibold text-sm ${
          isDarkMode ? "text-blue-400" : "text-blue-600"
        }`}
      >
        {activity.user}
      </span>
    </div>
    <p
      className={`text-sm leading-relaxed ${
        isDarkMode ? "text-slate-300" : "text-slate-700"
      }`}
    >
      {activity.message}
    </p>
  </div>
);
