import React from "react";
import { Outlet } from "react-router-dom";
import MenuBar from "./menu-bar/MenuBar";
import HeaderBar from "./header-bar/HeaderBar";
import { useTheme } from "../../contexts/ThemeContext";

const Layout: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-row-reverse h-screen max-h-screen overflow-hidden ${isDarkMode ? "bg-slate-900" : "bg-slate-50"
        }`}
    >
      {/* Right sidebar menu */}
      <MenuBar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <HeaderBar />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
