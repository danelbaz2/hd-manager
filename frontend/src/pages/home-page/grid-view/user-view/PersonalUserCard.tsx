import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { type UserData } from "../../../../schemas/userTypes";

interface PersonalUserCardProps {
  user: UserData;
  taskCounts: { open: number; inProgress: number; closed: number };
  onClick?: () => void;
}

const PersonalUserCard: React.FC<PersonalUserCardProps> = ({
  user,
  taskCounts,
  onClick,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:scale-[1.01] ${
        isDarkMode
          ? "bg-slate-800 border-slate-700 hover:border-slate-600"
          : "bg-white border-slate-200 hover:border-slate-300"
      }`}
      dir="rtl"
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: user.color }}
        >
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.fullName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-right">
          <h3
            className={`font-bold text-lg ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            {user.fullName}
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            {user.role === "admin" ? "מנהל מערכת" : "משתמש"}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              מחובר
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4">
          <StatBadge
            label="פתוח"
            value={taskCounts.open}
            color="text-green-500"
            isDarkMode={isDarkMode}
          />
          <StatBadge
            label="בטיפול"
            value={taskCounts.inProgress}
            color="text-amber-500"
            isDarkMode={isDarkMode}
          />
          <StatBadge
            label="סגור"
            value={taskCounts.closed}
            color="text-slate-400"
            isDarkMode={isDarkMode}
          />
        </div>
      </div>
    </button>
  );
};

const StatBadge: React.FC<{
  label: string;
  value: number;
  color: string;
  isDarkMode: boolean;
}> = ({ label, value, color, isDarkMode }) => (
  <div className="text-center">
    <p className={`font-bold text-lg ${color}`}>{value}</p>
    <p
      className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
    >
      {label}
    </p>
  </div>
);

export default PersonalUserCard;
