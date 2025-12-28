import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTheme } from "../../../../contexts";

interface PasswordFieldProps {
  password: string;
  onPasswordChange: (password: string) => void;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  password,
  onPasswordChange,
}) => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-medium text-right ${
          isDarkMode ? "text-slate-300" : "text-slate-700"
        }`}
      >
        סיסמה חדשה (השאר ריק לשמירת הנוכחית)
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="הזן סיסמה חדשה..."
          dir="rtl"
          className={`
            w-full px-4 py-3 pr-4 pl-12 rounded-xl border text-right
            transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/30
            ${
              isDarkMode
                ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
            }
          `}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={`
            absolute left-3 top-1/2 -translate-y-1/2
            p-1 rounded transition-colors
            ${
              isDarkMode
                ? "text-slate-400 hover:text-slate-300"
                : "text-slate-500 hover:text-slate-600"
            }
          `}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordField;
