import React from "react";
import { User } from "lucide-react";
import { useTheme } from "../../../contexts";
import { type UserData } from "../../../schemas/userTypes";

interface TaskCounts {
    open: number;
    inProgress: number;
    closed: number;
}

interface UserCardProps {
    user: UserData;
    taskCounts: TaskCounts;
    onUserClick?: (user: UserData) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, taskCounts, onUserClick }) => {
    const { isDarkMode } = useTheme();

    const handleClick = () => {
        // Call parent handler instead of navigating with URL params
        onUserClick?.(user);
    };

    return (
        <button
            onClick={handleClick}
            className={`
        w-full p-3 lg:p-4
        rounded-xl border
        transition-all duration-200
        hover:shadow-md hover:scale-[1.02]
        ${isDarkMode
                    ? "bg-slate-800 border-slate-700 hover:border-slate-600"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }
      `}
        >
            {/* Avatar - Smaller */}
            <div className="flex justify-center mb-2">
                <div
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: user.color }}
                >
                    {user.profileImage ? (
                        <img
                            src={user.profileImage}
                            alt={user.fullName}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <User className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    )}
                </div>
            </div>

            {/* Name & Role - Compact */}
            <div className="text-center mb-2">
                <h3
                    className={`
            font-bold text-sm lg:text-base truncate
            ${isDarkMode ? "text-white" : "text-slate-800"}
          `}
                >
                    {user.fullName}
                </h3>
                <p
                    className={`
            text-[10px] lg:text-xs
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}
          `}
                >
                    {user.role === "admin" ? "מנהל מערכת" : "משתמש"}
                </p>
            </div>

            {/* Task Counts - Compact */}
            <div
                className={`
          flex items-center justify-between
          pt-2 border-t
          ${isDarkMode ? "border-slate-700" : "border-slate-100"}
        `}
            >
                {/* Open */}
                <div className="text-center flex-1">
                    <p className="text-green-500 font-bold text-sm lg:text-base">
                        {taskCounts.open}
                    </p>
                    <p
                        className={`
              text-[10px]
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
                    >
                        פתוח
                    </p>
                </div>

                {/* In Progress */}
                <div className="text-center flex-1">
                    <p className="text-amber-500 font-bold text-sm lg:text-base">
                        {taskCounts.inProgress}
                    </p>
                    <p
                        className={`
              text-[10px]
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
                    >
                        בטיפול
                    </p>
                </div>

                {/* Closed */}
                <div className="text-center flex-1">
                    <p
                        className={`
              font-bold text-sm lg:text-base
              ${isDarkMode ? "text-slate-400" : "text-slate-400"}
            `}
                    >
                        {taskCounts.closed}
                    </p>
                    <p
                        className={`
              text-[10px]
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
                    >
                        סגור
                    </p>
                </div>
            </div>
        </button>
    );
};

export default UserCard;
