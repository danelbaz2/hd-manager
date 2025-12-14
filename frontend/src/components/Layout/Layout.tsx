import React from "react";
import { Outlet } from "react-router-dom";
import MenuBar from "./MenuBar/MenuBar";
import LineBar from "./LineBar/LineBar";

const Layout: React.FC = () => {
  return (
    <div className="flex flex-row-reverse min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Right sidebar menu */}
      <MenuBar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        <LineBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
