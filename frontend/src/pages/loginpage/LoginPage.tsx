import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, User, Lock, Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add authentication logic here
    console.log("Login attempt:", { username, password });
    // For now, just navigate to home
    navigate("/");
  };

  return (
    <div
      className={`
        min-h-screen flex items-center justify-center
        px-4 py-8
        ${
          isDarkMode
            ? "bg-slate-900"
            : "bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100"
        }
      `}
    >
      {/* Login Card */}
      <div
        className={`
          w-full max-w-md
          p-8 md:p-10
          rounded-3xl shadow-2xl
          ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white"}
        `}
      >
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4  rounded-2xl">
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
          className={`
            text-center text-sm mb-8
            ${isDarkMode ? "text-slate-400" : "text-slate-500"}
          `}
        >
          Flow Task הזן את פרטי כדי להיכנס אל
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className={`
                block text-sm font-medium mb-2 text-right
                ${isDarkMode ? "text-slate-300" : "text-slate-700"}
              `}
            >
              שם משתמש
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="הקלד שם משתמש"
                className={`
                  w-full px-4 py-3 pr-12
                  rounded-xl border
                  text-right
                  transition-all duration-200
                  ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                `}
                required
              />
              <User
                size={20}
                className={`
                  absolute left-4 top-1/2 -translate-y-1/2
                  ${isDarkMode ? "text-slate-400" : "text-slate-400"}
                `}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className={`
                block text-sm font-medium mb-2 text-right
                ${isDarkMode ? "text-slate-300" : "text-slate-700"}
              `}
            >
              סיסמה
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="הקלד סיסמה"
                className={`
                  w-full px-4 py-3 pr-12
                  rounded-xl border
                  text-right
                  transition-all duration-200
                  ${
                    isDarkMode
                      ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:bg-slate-600"
                      : "bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white"
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                `}
                required
              />
              <Lock
                size={20}
                className={`
                  absolute left-4 top-1/2 -translate-y-1/2
                  ${isDarkMode ? "text-slate-400" : "text-slate-400"}
                `}
              />
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer"></label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="
              w-full py-3.5 px-6
              bg-blue-600 hover:bg-blue-700
              text-white font-semibold text-base
              rounded-xl
              transition-all duration-200
              shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40
              hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            התחבר למערכת
          </button>
        </form>
      </div>

      {/* Dark Mode Toggle - Bottom Left Corner */}
      <button
        onClick={toggleDarkMode}
        className={`
          fixed bottom-6 left-6
          p-3 rounded-full
          shadow-lg border
          transition-all duration-300
          hover:scale-110
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }
        `}
        aria-label="Toggle dark mode"
      >
        {isDarkMode ? (
          <Sun size={22} className="text-yellow-400" />
        ) : (
          <Moon size={22} className="text-slate-600" />
        )}
      </button>
    </div>
  );
};

export default LoginPage;
