import React from "react";
import { Layers } from "lucide-react";
import { getSystemName } from "../../lib/config/runtimeConfig";

interface LoginHeaderProps {
  isDarkMode: boolean;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ isDarkMode }) => {
  const systemName = getSystemName();

  return (
    <>
      {/* Logo/Icon */}
      <div className="flex justify-center mb-6">
        <div
          className={`
            p-4 rounded-2xl
            transition-all duration-300
            ${isDarkMode ? "bg-blue-500/10" : "bg-blue-50"}
          `}
        >
          <Layers size={40} className="text-blue-600" strokeWidth={2.5} />
        </div>
      </div>

      {/* Title */}
      <h1
        className={`
          text-center text-3xl md:text-4xl font-bold mb-3
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        ברוכים הבאים
      </h1>

      {/* Subtitle */}
      <p
        dir="rtl"
        className={`
          text-center text-sm mb-8
          ${isDarkMode ? "text-slate-400" : "text-slate-500"}
        `}
      >
        הזן את פרטיך כדי להיכנס אל{" "}
        <span className="font-semibold text-blue-600">{systemName}</span>
      </p>
    </>
  );
};

export default LoginHeader;
