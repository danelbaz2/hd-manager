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
  "🦁",
  "⚡",
  "👑",
  "🎊",
  "🏅",
  "🎁",
  "🌸",
  "🦋",
  "🐬",
  "🦄",
  "🐉",
  "🦅",
  "🐝",
  "🌻",
  "🌺",
  "🍀",
  "🌴",
  "🎸",
  "🎹",
  "🎺",
  "🎭",
  "🎪",
  "🎠",
  "🎡",
  "🎢",
  "🛸",
  "🌍",
  "🌙",
  "☀️",
  "🌤️",
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
  "🖤",
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
  "🎇",
  "🧨",
  "🪄",
  "🔭",
  "🎤",
  "🎧",
  "🎵",
  "🏂",
  "🏄",
  "🚴",
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
  "🥧",
];

// Get greeting based on time of day
const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return "בוקר טוב";
  }
  if (hour >= 12 && hour < 17) {
    return "צהריים טובים";
  }
  if (hour >= 17 && hour < 21) {
    return "ערב טוב";
  }
  return "לילה טוב";
};

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
    <div className="py-4 px-6" dir="rtl">
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
      <style>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(20deg); }
        }
        .animate-wave {
          display: inline-block;
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: 70% 70%;
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default MotivationalBanner;
