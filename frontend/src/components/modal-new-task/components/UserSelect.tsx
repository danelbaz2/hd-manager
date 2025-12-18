import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { type UserData } from "../../../schemas/userTypes";
import defaultProfileImage from "../../../assets/default-profile.jpg";

interface UserSelectProps {
  users: UserData[];
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  isLoading?: boolean;
}

// Helper function to determine if a color is light or dark
const isLightColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
};

// Get contrasting text color for a background color
const getContrastTextColor = (bgColor: string): string => {
  return isLightColor(bgColor) ? "#1e293b" : "#ffffff"; // slate-800 or white
};

const UserSelect: React.FC<UserSelectProps> = ({
  users,
  selectedUserIds,
  onChange,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();

  // Toggle user selection
  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  return (
    <div>
      <label
        className={`
          block text-sm lg:text-base font-medium mb-3
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        אחראים
      </label>

      <div
        className={`
          p-4 rounded-xl border-2
          ${
            isDarkMode
              ? "bg-slate-700/30 border-slate-600"
              : "bg-slate-50/50 border-slate-200"
          }
        `}
      >
        {isLoading ? (
          <div
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            טוען משתמשים...
          </div>
        ) : users.length === 0 ? (
          <div
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            אין משתמשים זמינים
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {users.map((user) => {
              const isSelected = selectedUserIds.includes(user.id);
              const textColor = isSelected
                ? getContrastTextColor(user.color)
                : undefined;
              const checkmarkColor = isLightColor(user.color)
                ? "#1e293b"
                : user.color;

              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className={`
                    group flex items-center gap-2
                    px-3 py-2
                    rounded-xl border-2
                    text-sm lg:text-base font-medium
                    transition-all duration-200
                    ${
                      isSelected
                        ? "shadow-md"
                        : isDarkMode
                        ? "bg-slate-700/50 border-slate-600 text-slate-300 hover:border-slate-500 hover:bg-slate-700"
                        : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-sm"
                    }
                  `}
                  style={
                    isSelected
                      ? {
                          backgroundColor: user.color,
                          borderColor: user.color,
                          color: textColor,
                          boxShadow: `0 4px 6px -1px ${user.color}40, 0 2px 4px -2px ${user.color}40`,
                        }
                      : undefined
                  }
                >
                  <span>{user.fullName}</span>
                  <div className="relative">
                    <img
                      src={user.profileImage || defaultProfileImage}
                      alt={user.fullName}
                      className={`
                        w-7 h-7 rounded-full object-cover
                        ring-2 transition-all
                        ${
                          isSelected
                            ? "ring-white/50"
                            : "ring-transparent group-hover:ring-blue-500/30"
                        }
                      `}
                      style={{
                        borderColor: isSelected ? "transparent" : user.color,
                        borderWidth: isSelected ? 0 : 2,
                      }}
                    />
                    {isSelected && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg
                          className="w-2.5 h-2.5"
                          style={{ color: checkmarkColor }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelect;
