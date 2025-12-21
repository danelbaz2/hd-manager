import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme, useAuth } from "../../../contexts";
import ManageSetting from "../../modal-setting/ManageSetting";

interface MenuItemProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuItemProfile: React.FC<MenuItemProfileProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    logout(); // Clear auth context and sessionStorage
    navigate("/login");
    onClose();
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    onClose(); // Close the profile menu
  };

  // Get role display text in Hebrew

  if (!isOpen && !isSettingsOpen) return null;

  return (
    <>
      {isOpen && (
        <div
          className={`
            absolute top-full left-0 mt-2
            w-48 md:w-56
            rounded-xl shadow-xl border
            overflow-hidden
            z-50
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }
          `}
        >
          {/* User Info Header */}
          <div
            className={`
              p-3 md:p-4 border-b
              ${isDarkMode ? "border-slate-700" : "border-slate-100"}
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
                `}
                style={
                  user?.color ? { backgroundColor: `${user.color}20` } : {}
                }
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={20} className="text-blue-500" />
                )}
              </div>
              <div>
                <p
                  className={`
                    font-bold text-sm
                    ${isDarkMode ? "text-white" : "text-slate-800"}
                  `}
                >
                  {user?.fullName || "משתמש"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`
                w-full flex items-center justify-between
                px-4 py-3
                text-sm transition-colors
                ${
                  isDarkMode
                    ? "hover:bg-slate-700 text-slate-200"
                    : "hover:bg-slate-50 text-slate-700"
                }
              `}
            >
              <span>מצב חשוך</span>
              {isDarkMode ? (
                <Moon size={18} className="text-slate-400" />
              ) : (
                <Sun size={18} className="text-slate-400" />
              )}
            </button>

            {/* Settings - Only visible for admin users */}
            {isAdmin && (
              <button
                onClick={handleOpenSettings}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3
                  text-sm transition-colors
                  ${
                    isDarkMode
                      ? "hover:bg-slate-700 text-slate-200"
                      : "hover:bg-slate-50 text-slate-700"
                  }
                `}
              >
                <span>הגדרות</span>
                <Settings size={18} className="text-slate-400" />
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center justify-between
                px-4 py-3
                text-sm transition-colors
                text-red-500 hover:bg-red-50
                ${isDarkMode ? "hover:bg-red-900/20" : ""}
              `}
            >
              <span>התנתק</span>
              <LogOut size={18} className="transform rotate-180" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal - Only render for admin */}
      {isAdmin && (
        <ManageSetting
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
};

export default MenuItemProfile;
