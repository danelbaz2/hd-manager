import React, { useState } from "react";
import { Trash2, Pencil } from "lucide-react";
import { type UserData } from "../../../../../schemas/userTypes";
import defaultProfileImage from "../../../../../assets/default-profile.jpg";
import { darkenColor, hexWithAlpha } from "../../../../../utils/colorUtils";

interface UserCardProps {
  user: UserData;
  isEditing: boolean;
  isDarkMode: boolean;
  onEdit: (user: UserData) => void;
  onCancelEdit: () => void;
  onDeleteRequest: (user: UserData) => void;
}

/**
 * UserCard - Individual user display card with edit/delete actions
 */
const UserCard: React.FC<UserCardProps> = ({
  user,
  isEditing,
  isDarkMode,
  onEdit,
  onCancelEdit,
  onDeleteRequest,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate colors based on hover state - subtle effect
  const bgOpacity = isHovered
    ? isDarkMode
      ? 0.1
      : 0.08
    : isDarkMode
    ? 0.06
    : 0.04;

  const borderOpacity = isEditing
    ? 0.5
    : isHovered
    ? isDarkMode
      ? 0.3
      : 0.25
    : isDarkMode
    ? 0.2
    : 0.15;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{
        backgroundColor: hexWithAlpha(user.color, bgOpacity),
        borderColor: hexWithAlpha(user.color, borderOpacity),
        transition: "background-color 400ms ease, border-color 400ms ease",
      }}
      onClick={() => console.log(user)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Color Banner - Static height */}
      <div
        className="w-full h-1"
        style={{ backgroundColor: darkenColor(user.color, 15) }}
      />

      <div className="flex items-center justify-between px-5 py-3">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(user);
            }}
            className={`
              p-2 rounded-lg transition-colors cursor-pointer
              ${
                isDarkMode
                  ? "text-red-400 hover:bg-red-900/30"
                  : "text-red-500 hover:bg-red-50"
              }
            `}
          >
            <Trash2 size={18} />
          </div>
          <div
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              isEditing ? onCancelEdit() : onEdit(user);
            }}
            className={`
              p-2 rounded-lg transition-colors cursor-pointer
              ${
                isEditing
                  ? "bg-blue-500 text-white"
                  : isDarkMode
                  ? "text-blue-400 hover:bg-blue-900/30"
                  : "text-blue-500 hover:bg-blue-50"
              }
            `}
          >
            <Pencil size={18} />
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p
              className={`font-medium ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              {user.fullName}
            </p>
            <p
              className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              @{user.username}
            </p>
          </div>
          <span
            className={`
              px-2 py-0.5 rounded-full text-xs font-medium
              ${
                user.role === "admin"
                  ? isDarkMode
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                  : isDarkMode
                  ? "bg-slate-600 text-slate-300"
                  : "bg-slate-200 text-slate-600"
              }
            `}
          >
            {user.role === "admin" ? "מנהל" : "משתמש"}
          </span>
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: user.color }}
          >
            <img
              src={user.profileImage || defaultProfileImage}
              alt={user.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
