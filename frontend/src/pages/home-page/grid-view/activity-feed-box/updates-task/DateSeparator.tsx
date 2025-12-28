import React from "react";

interface DateSeparatorProps {
  date: number;
  isDarkMode: boolean;
}

// Format relative date (Today, Yesterday, or full date)
const formatRelativeDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate()
  );

  if (dateOnly.getTime() === todayOnly.getTime()) return "היום";
  if (dateOnly.getTime() === yesterdayOnly.getTime()) return "אתמול";

  return date.toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const DateSeparator: React.FC<DateSeparatorProps> = ({
  date,
  isDarkMode,
}) => {
  return (
    <div className="flex items-center justify-center py-3" dir="rtl">
      <div
        className={`px-4 py-1.5 rounded-full text-xs font-medium shadow-sm ${
          isDarkMode
            ? "bg-slate-700 text-slate-200 border border-slate-600"
            : "bg-white text-slate-600 border border-slate-200"
        }`}
      >
        {formatRelativeDate(date)}
      </div>
    </div>
  );
};
