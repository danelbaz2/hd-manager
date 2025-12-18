import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, List, MessageCircle, Layers, LogOut } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface MenuBarProps {
  className?: string;
}

const MENU_ITEMS = [
  { id: "/", label: "בית", icon: Home },
  { id: "/tasks", label: "משימות", icon: List },
  { id: "/chat", label: "צ'אט", icon: MessageCircle },
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
        w-64 lg:w-64 xl:w-72 2xl:w-80
        shrink-0 flex flex-col
        py-6 lg:py-8 xl:py-10 2xl:py-12
        px-4 lg:px-6 xl:px-8 2xl:px-10
        ${isDarkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"}
        ${className || ""}
      `}
      dir="ltr"
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-center gap-2 lg:gap-2.5 xl:gap-3 mb-8 lg:mb-10 xl:mb-12 px-2">
        <h1 className="text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl font-bold text-blue-600 tracking-wide">
          {import.meta.env.VITE_SYSTEM_NAME || "Flow Task"}{" "}
        </h1>
        <Layers
          className="text-blue-600 w-6 h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 2xl:w-9 2xl:h-9"
          strokeWidth={2}
        />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-2 lg:space-y-3 xl:space-y-4">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.id}
            className={`
              w-full flex items-center justify-end
              gap-3 lg:gap-4 xl:gap-5
              px-4 lg:px-6 xl:px-8
              py-3 lg:py-4 xl:py-5
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
            <span className="font-medium text-base lg:text-lg xl:text-xl 2xl:text-2xl">
              {item.label}
            </span>
            <item.icon
              className={`w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 ${
                isActive(item.id) ? "" : "group-hover:text-blue-500"
              }`}
              strokeWidth={2}
            />
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-2 lg:space-y-3">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`
            flex items-center justify-end
            gap-3 lg:gap-4 xl:gap-5
            px-4 lg:px-6 xl:px-8
            py-3 lg:py-4 xl:py-5
            rounded-xl w-full transition-all
            ${
              isDarkMode
                ? "text-red-400 hover:bg-red-900/20"
                : "text-red-500 hover:bg-red-50"
            }
          `}
        >
          <span className="text-base lg:text-lg xl:text-xl 2xl:text-2xl font-medium">
            יציאה
          </span>
          <LogOut
            className="w-5 h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8 transform rotate-180"
            strokeWidth={2}
          />
        </button>
      </div>
    </aside>
  );
};

export default MenuBar;
