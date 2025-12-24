import React from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useTheme } from "../../../contexts";

interface StatisticsProps {
  open: number;
  inProgress: number;
  closed: number;
  title?: string;
}

const Statistics: React.FC<StatisticsProps> = ({
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
      className={`rounded-2xl border p-3 ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-blue-500" />
        <h3
          className={`font-bold text-sm ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {title}
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} isDarkMode={isDarkMode} />
        ))}
      </div>
    </div>
  );
};

interface StatCardProps {
  stat: {
    label: string;
    value: number;
    icon: React.ElementType;
    color: string;
    bg: string;
  };
  isDarkMode: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ stat, isDarkMode }) => {
  const Icon = stat.icon;
  return (
    <div className={`rounded-xl p-2 text-center ${stat.bg}`}>
      <div className="flex items-center justify-center gap-1">
        <Icon className={`w-3 h-3 ${stat.color}`} />
      </div>
      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
      <p
        className={`text-[10px] ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {stat.label}
      </p>
    </div>
  );
};

export default Statistics;
