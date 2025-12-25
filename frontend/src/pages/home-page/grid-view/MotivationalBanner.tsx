import React, { useMemo } from "react";
import { useTheme } from "../../../contexts";
import { emojis } from "./motivationalEmojis";
import {
  getTimeGreeting,
  getDailyIndex,
  bannerAnimationStyles,
} from "./motivationalUtils";

interface MotivationalBannerProps {
  userName?: string;
  userId?: string;
}

/**
 * MotivationalBanner - Displays a personalized greeting with daily emoji
 * Used in both UserView and AdminView as a headline component
 */
const MotivationalBanner: React.FC<MotivationalBannerProps> = ({
  userName,
  userId = "",
}) => {
  const { isDarkMode } = useTheme();
  const greeting = getTimeGreeting();

  // Get daily random emoji for this user
  const dailyEmoji = useMemo(() => {
    return emojis[getDailyIndex(userId, emojis.length)];
  }, [userId]);

  return (
    <div className="px-6" dir="rtl">
      {/* Main Content */}
      <div className="flex flex-col gap-2">
        {/* Greeting with wave emoji */}
        <h1
          className={`text-2xl font-semibold ${
            isDarkMode ? "text-white" : "text-slate-800"
          }`}
        >
          {greeting}
          {userName ? `, ${userName}` : ""}{" "}
          <span className="inline-block animate-wave">👋</span>
        </h1>

        {/* Daily Emoji Section */}
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            האימוג׳י היומי שלך הוא:
          </span>
          <span className="text-2xl animate-bounce-subtle">{dailyEmoji}</span>
        </div>
      </div>

      {/* Animations */}
      <style>{bannerAnimationStyles}</style>
    </div>
  );
};

export default MotivationalBanner;
