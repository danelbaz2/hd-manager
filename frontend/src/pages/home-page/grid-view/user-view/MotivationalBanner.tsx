import React, { useMemo } from "react";
import { useTheme } from "../../../../contexts";

interface MotivationalBannerProps {
  userName?: string;
  userId?: string;
}

// 100 Fun emojis collection
const emojis = [
  "🎯",
  "🚀",
  "⭐",
  "🔥",
  "💎",
  "🌟",
  "🎉",
  "💫",
  "🏆",
  "✨",
  "🌈",
  "�",
  "⚡",
  "👑",
  "🎊",
  "🏅",
  "🎁",
  "🌸",
  "🦋",
  "🐬",
  "🦄",
  "�",
  "🦅",
  "🐝",
  "🌻",
  "🌺",
  "🍀",
  "🌴",
  "🎸",
  "🎹",
  "�",
  "🎭",
  "🎪",
  "🎠",
  "🎡",
  "🎢",
  "🛸",
  "🌍",
  "🌙",
  "☀️",
  "�",
  "❄️",
  "🔮",
  "💝",
  "💖",
  "💗",
  "🧡",
  "💛",
  "💚",
  "💙",
  "💜",
  "�",
  "🤍",
  "🤎",
  "❤️",
  "🩷",
  "🩵",
  "🩶",
  "🧸",
  "🎀",
  "🎈",
  "🎆",
  "�",
  "🧨",
  "🪄",
  "🔭",
  "🎤",
  "🎧",
  "🎵",
  "�",
  "🏄",
  "�",
  "⛷️",
  "🏊",
  "🧗",
  "🤸",
  "🏋️",
  "⚽",
  "🏀",
  "🎾",
  "🍕",
  "🍔",
  "🍟",
  "🌮",
  "🍦",
  "🧁",
  "🍩",
  "🍪",
  "☕",
  "🧃",
  "🌶️",
  "🥑",
  "🍉",
  "🍓",
  "🍇",
  "🍎",
  "🍊",
  "🥝",
  "🥥",
  "�",
];

// Generate consistent random index based on string + date
const getDailyIndex = (seed: string, arrayLength: number): number => {
  const today = new Date().toDateString();
  const combined = seed + today;
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % arrayLength;
};

// Get greeting based on time of day
const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 17) return "צהריים טובים";
  if (hour >= 17 && hour < 21) return "ערב טוב";
  return "לילה טוב";
};

const MotivationalBanner: React.FC<MotivationalBannerProps> = ({
  userName,
  userId = "",
}) => {
  const { isDarkMode } = useTheme();

  // Get daily random emoji for this user
  const dailyEmoji = useMemo(() => {
    return emojis[getDailyIndex(userId, emojis.length)];
  }, [userId]);

  const greeting = getTimeGreeting();

  return (
    <div
      className={`h-full flex flex-col items-center justify-center rounded-xl border transition-all ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
      dir="rtl"
    >
      {/* Time-based Greeting */}
      <p
        className={`text-lg font-bold mb-8 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        {greeting}
        {userName ? `, ${userName}` : ""}!
      </p>

      {/* Daily Emoji Section */}
      <div className="flex items-center gap-6">
        <p
          className={`text-sm font-medium ${
            isDarkMode ? "text-slate-400" : "text-slate-500"
          }`}
        >
          האימוג׳י היומי שלך הוא:
        </p>
        <div
          className="text-4xl animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          {dailyEmoji}
        </div>
      </div>
    </div>
  );
};

export default MotivationalBanner;
