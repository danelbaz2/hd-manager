import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  List,
  MessageCircle,
  Layers,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface MenuBarProps {
  className?: string;
}

const MENU_ITEMS = [
  { id: "/", label: "Home", icon: Home },
  { id: "/tasks", label: "Missions", icon: List },
  { id: "/chat", label: "Chat", icon: MessageCircle },
];

const MenuBar: React.FC<MenuBarProps> = ({ className }) => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }
    return location.pathname === path;
  };

  return (
    <aside
      className={`w-96 shrink-0 flex flex-col py-12 px-10 ${
        isDarkMode ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-900"
      } ${className || ""}`}
      dir="rtl"
    >
      {/* Logo/Header */}
      <div className="flex items-center justify-start gap-4 mb-14 px-2">
        <h1 className="text-4xl font-bold text-blue-600 tracking-wide">
          LigthHouse
        </h1>
        <Layers className="text-blue-600" size={42} strokeWidth={2} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 w-full space-y-5">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.id}
            to={item.id}
            className={`w-full flex items-center justify-end gap-5 px-8 py-5 rounded-xl transition-all duration-200 group ${
              isActive(item.id)
                ? isDarkMode
                  ? "bg-blue-900/30 text-blue-400"
                  : "bg-blue-50 text-blue-600"
                : isDarkMode
                ? "text-slate-400 hover:bg-slate-700/50"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="font-medium text-xl">{item.label}</span>
            <item.icon
              size={28}
              strokeWidth={2}
              className={isActive(item.id) ? "" : "group-hover:text-blue-500"}
            />
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className={`flex items-center justify-end gap-5 px-8 py-5 rounded-xl w-full transition-all ${
            isDarkMode
              ? "text-slate-400 hover:bg-slate-700/50"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span className="text-xl font-medium">
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </span>
          {isDarkMode ? (
            <Sun size={28} strokeWidth={2} />
          ) : (
            <Moon size={28} strokeWidth={2} />
          )}
        </button>

        {/* Logout Button */}
        <button
          className={`flex items-center justify-end gap-5 px-8 py-5 rounded-xl w-full transition-all ${
            isDarkMode
              ? "text-red-400 hover:bg-red-900/20"
              : "text-red-500 hover:bg-red-50"
          }`}
        >
          <span className="text-xl font-medium">יציאה</span>
          <LogOut size={28} strokeWidth={2} className="transform rotate-180" />
        </button>
      </div>
    </aside>
  );
};

export default MenuBar;
