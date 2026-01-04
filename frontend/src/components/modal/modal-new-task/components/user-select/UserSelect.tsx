import React from "react";
import { useTheme } from "../../../../../contexts/ThemeContext";
import { type UserData } from "../../../../../schemas/userTypes";
import UserChip from "./UserChip";
import SelectAllButton from "./SelectAllButton";

interface UserSelectProps {
  users: UserData[];
  selectedUserIds: string[];
  onChange: (userIds: string[]) => void;
  isLoading?: boolean;
}

/**
 * User selection component with multi-select capability
 * Includes select all / deselect all toggle
 */
const UserSelect: React.FC<UserSelectProps> = ({
  users,
  selectedUserIds,
  onChange,
  isLoading = false,
}) => {
  const { isDarkMode } = useTheme();

  // Check if all users are selected
  const allSelected =
    users.length > 0 && users.every((u) => selectedUserIds.includes(u.id));

  // Toggle user selection
  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  // Toggle all users selection
  const toggleAllUsers = () => {
    if (allSelected) {
      onChange([]);
    } else {
      onChange(users.map((u) => u.id));
    }
  };

  return (
    <div>
      <label
        className={`
          block text-sm lg:text-base font-medium mb-1
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
      >
        אחראים
      </label>

      <div
        className={`
          p-3 rounded-xl border-2
          ${isDarkMode
            ? "bg-slate-700/30 border-slate-600"
            : "bg-slate-50/50 border-slate-200"
          }
        `}
      >
        {isLoading ? (
          <div
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
          >
            טוען משתמשים...
          </div>
        ) : users.length === 0 ? (
          <div
            className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
          >
            אין משתמשים זמינים
          </div>
        ) : (
          <div className="space-y-3">
            <SelectAllButton allSelected={allSelected} onToggle={toggleAllUsers} />

            <div className="flex flex-wrap gap-2">
              {users.map((user) => (
                <UserChip
                  key={user.id}
                  user={user}
                  isSelected={selectedUserIds.includes(user.id)}
                  onToggle={() => toggleUser(user.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSelect;
