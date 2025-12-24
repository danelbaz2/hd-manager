import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  List,
  MessageCircle,
  Layers,
  LogOut,
  Archive,
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface MenuBarProps {
  className?: string;
}

const MENU_ITEMS = [
  { id: "/", label: "בית", icon: Home },
  { id: "/tasks", label: "משימות", icon: List },
  { id: "/archive", label: "ארכיון", icon: Archive },
];

const MenuBar: React.FC<MenuBarProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogout = () => {
    // TODO: Add logout logic (clear tokens, etc.)
    navigate("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === path;
  };

  return (
    <aside
      className={`
        w-64 lg:w-64 xl:w-72
        shrink-0 flex flex-col
        py-4 lg:py-6 xl:py-8
        px-3 lg:px-4 xl:px-6
        ${isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"}
        ${className || ""}
      `}
      dir="ltr"
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-center gap-2 lg:gap-3 mb-6 lg:mb-8 px-2">
        <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-blue-600 tracking-wide">
          {import.meta.env.VITE_SYSTEM_NAME || "Flow Task"}{" "}
        </h1>
        <Layers
          className="text-blue-600 w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7"
          strokeWidth={2}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-1 lg:space-y-2">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.id}
            state={
              item.id === "/"
                ? { displayMode: "grid", viewMode: "daily" }
                : undefined
            }
            className={`
              w-full flex items-center justify-end
              gap-3 lg:gap-4
              px-3 lg:px-4 xl:px-6
              py-2.5 lg:py-3
              rounded-xl transition-all duration-200 group
              ${
                isActive(item.id)
                  ? isDarkMode
                    ? "bg-blue-900/30 text-blue-400"
                    : "bg-blue-50 text-blue-600"
                  : isDarkMode
                  ? "text-slate-400 hover:bg-slate-700/50"
                  : "text-slate-600 hover:bg-slate-100"
              }
            `}
          >
            <span className="font-medium text-sm lg:text-base xl:text-lg">
              {item.label}
            </span>
            <item.icon
              className={`w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 ${
                isActive(item.id) ? "" : "group-hover:text-blue-500"
              }`}
              strokeWidth={2}
            />
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center justify-end
            gap-3 lg:gap-4
            px-3 lg:px-4 xl:px-6
            py-2.5 lg:py-3
            rounded-xl w-full transition-all
            ${
              isDarkMode
                ? "text-red-400 hover:bg-red-900/20"
                : "text-red-500 hover:bg-red-50"
            }
          `}
        >
          <span className="text-sm lg:text-base xl:text-lg font-medium">
            יציאה
          </span>
          <LogOut
            className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 transform rotate-180"
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
};

export default MenuBar;
