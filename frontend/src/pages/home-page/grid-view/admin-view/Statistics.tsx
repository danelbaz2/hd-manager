import React from "react";
import { CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { useTheme } from "../../../../contexts";

interface StatisticsProps {
  open: number;
  inProgress: number;
  closed: number;
  title?: string;
  showTrend?: boolean;
  trendPercent?: number;
}

const Statistics: React.FC<StatisticsProps> = ({
  open,
  inProgress,
  closed,
  title = "סטטיסטיקה יומית",
  showTrend = true,
  trendPercent = 12,
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
      color: "text-blue-500",
      bg: isDarkMode ? "bg-blue-500/10" : "bg-blue-50",
    },
  ];

  return (
    <div
      className={`rounded-2xl border p-4 ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <h3
            className={`font-bold text-sm ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {title}
          </h3>
        </div>
        {showTrend && (
          <div className="flex items-center gap-1 text-green-500 text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>{trendPercent}%</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
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
    <div className={`rounded-xl p-3 text-center ${stat.bg}`}>
      <div className="flex items-center justify-center gap-1 mb-1">
        <Icon className={`w-4 h-4 ${stat.color}`} />
      </div>
      <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
      <p
        className={`text-xs mt-1 ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        {stat.label}
      </p>
    </div>
  );
};

export default Statistics;
