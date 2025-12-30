import React from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useTheme } from "../../../contexts";

interface TaskStatusSummaryProps {
  open: number;
  inProgress: number;
  closed: number;
  title?: string;
}

const TaskStatusSummary: React.FC<TaskStatusSummaryProps> = ({
  open,
  inProgress,
  closed,
  title = "סטטיסטיקה כללית",
}) => {
  const { isDarkMode } = useTheme();

  const stats = [
    {
      label: "פתוח",
      value: open,
      icon: AlertCircle,
      color: "text-green-500",
      bg: isDarkMode ? "bg-green-500/10" : "bg-green-50",
    },
    {
      label: "בטיפול",
      value: inProgress,
      icon: Clock,
      color: "text-amber-500",
      bg: isDarkMode ? "bg-amber-500/10" : "bg-amber-50",
    },
    {
      label: "סגור",
      value: closed,
      icon: CheckCircle,
      color: "text-slate-400",
      bg: isDarkMode ? "bg-slate-500/10" : "bg-slate-100",
    },
  ];

  return (
    <div
      className={`rounded-lg border p-1.5 ${isDarkMode
        ? "bg-slate-800 border-slate-700"
        : "bg-white border-slate-200"
        }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-1 mb-2">
        <TrendingUp className="w-3 h-3 text-blue-500" />
        <h3
          className={`font-bold text-[10px] ${isDarkMode ? "text-white" : "text-slate-800"
            }`}
        >
          {title}
        </h3>
      </div>

      {/* Stats Grid - Compact cards */}
      <div className="grid grid-cols-3 gap-1">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-md p-2 text-center ${stat.bg}`}
            >
              <div className="flex items-center justify-center">
                <Icon className={`w-2.5 h-2.5 ${stat.color}`} />
              </div>
              <p className={`text-base font-bold leading-tight ${stat.color}`}>
                {stat.value}
              </p>
              <p
                className={`text-[8px] ${isDarkMode ? "text-slate-400" : "text-slate-500"
                  }`}
              >
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskStatusSummary;
