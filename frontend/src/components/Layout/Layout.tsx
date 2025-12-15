import React from "react";
import { Outlet } from "react-router-dom";
import MenuBar from "./MenuBar/MenuBar";
import HeaderBar from "./HeaderBar/HeaderBar";
import { useTheme } from "../../contexts/ThemeContext";

const Layout: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`flex flex-row-reverse min-h-screen ${
        isDarkMode ? "bg-slate-900" : "bg-slate-50"
      }`}
    >
      {/* Right sidebar menu */}
      <MenuBar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <HeaderBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
