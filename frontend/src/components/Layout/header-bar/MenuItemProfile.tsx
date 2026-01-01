import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Moon, Sun, LogOut, FileOutput } from "lucide-react";
import { useTheme, useAuth } from "../../../contexts";
import ManageSetting from "../../modal/modal-setting/ManageSetting";
import { ExportModal } from "../../modal/modal-export-excel";

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
  const [isExportOpen, setIsExportOpen] = useState(false);

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

  const handleOpenExport = () => {
    setIsExportOpen(true);
    onClose(); // Close the profile menu
  };

  if (!isOpen && !isSettingsOpen && !isExportOpen)
    return null;

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
            ${isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
            }
          `}
        >
          {/* Menu Items */}
          <div className="py-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`
                w-full flex items-center justify-between
                px-4 py-3
                text-sm transition-colors
                ${isDarkMode
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

            {/* Settings - Available for ALL users (content filtered by role inside) */}
            <button
              onClick={handleOpenSettings}
              className={`
                w-full flex items-center justify-between
                px-4 py-3
                text-sm transition-colors
                ${isDarkMode
                  ? "hover:bg-slate-700 text-slate-200"
                  : "hover:bg-slate-50 text-slate-700"
                }
              `}
            >
              <span>הגדרות</span>
              <Settings size={18} className="text-slate-400" />
            </button>

            {/* Export Reports - Only visible for admin users */}
            {isAdmin && (
              <button
                onClick={handleOpenExport}
                className={`
                  w-full flex items-center justify-between
                  px-4 py-3
                  text-sm transition-colors
                  ${isDarkMode
                    ? "hover:bg-slate-700 text-slate-200"
                    : "hover:bg-slate-50 text-slate-700"
                  }
                `}
              >
                <span>הפקת דוחות</span>
                <FileOutput size={18} className="text-slate-400" />
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

      {/* Settings Modal - Available for all users (tabs filtered by role inside) */}
      <ManageSetting
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Export Modal - Only render for admin */}
      {isAdmin && (
        <ExportModal
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </>
  );
};

export default MenuItemProfile;

