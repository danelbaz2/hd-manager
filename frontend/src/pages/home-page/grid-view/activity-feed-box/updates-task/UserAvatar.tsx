import React from "react";
import type { UserData } from "./types";

interface UserAvatarProps {
  user?: UserData;
  userName: string;
  userColor: string;
  actionIcon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  actionColor: string;
  isDarkMode: boolean;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  userName,
  userColor,
  actionIcon: Icon,
  actionColor,
  isDarkMode,
}) => {
  return (
    <div className="relative shrink-0">
      {user?.profileImage ? (
        <img
          src={user.profileImage}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover border-2"
          style={{ borderColor: userColor }}
        />
      ) : (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{ backgroundColor: userColor }}
        >
          {userName.charAt(0)}
        </div>
      )}
      <div
        className="absolute -bottom-0.5 -left-0.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
        style={{
          backgroundColor: actionColor,
          border: `2px solid ${isDarkMode ? "#1e293b" : "#fff"}`,
        }}
      >
        <Icon className="w-3 h-3 text-white" />
      </div>
    </div>
  );
};
