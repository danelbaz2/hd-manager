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
      className={`w-72 shrink-0 flex flex-col py-8 px-6 ${isDarkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
        } ${className || ""}`}
      dir="ltr"
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-center gap-3 mb-10 px-2">
        <h1 className="text-3xl font-bold text-blue-600 tracking-wide">
          {import.meta.env.VITE_SYSTEM_NAME || "Flow Task"}{" "}
        </h1>
        <Layers className="text-blue-600" size={32} strokeWidth={2} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-3">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.id}
            className={`w-full flex items-center justify-end gap-4 px-6 py-4 rounded-xl transition-all duration-200 group ${isActive(item.id)
              ? isDarkMode
                ? "bg-blue-900/30 text-blue-400"
                : "bg-blue-50 text-blue-600"
              : isDarkMode
                ? "text-slate-400 hover:bg-slate-700/50"
                : "text-slate-600 hover:bg-slate-100"
              }`}
          >
            <span className="font-medium text-lg">{item.label}</span>
            <item.icon
              size={24}
              strokeWidth={2}
              className={isActive(item.id) ? "" : "group-hover:text-blue-500"}
            />
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-3">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex items-center justify-end gap-4 px-6 py-4 rounded-xl w-full transition-all ${isDarkMode
            ? "text-red-400 hover:bg-red-900/20"
            : "text-red-500 hover:bg-red-50"
            }`}
        >
          <span className="text-lg font-medium">יציאה</span>
          <LogOut size={24} strokeWidth={2} className="transform rotate-180" />
        </button>
      </div>
    </aside>
  );
};

export default MenuBar;
