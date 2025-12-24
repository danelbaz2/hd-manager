import React from "react";
import { MessageSquare, Filter, Search } from "lucide-react";
import { useTheme } from "../../../../contexts";
import { ActivityMessage, type ActivityItem } from "./ActivityMessage";

// Mock data - will be replaced with actual data later
const mockActivities: ActivityItem[] = [
  {
    id: "1",
    user: "דניאל כהן",
    message: "סגרתי את תקלה #4592 - לקוח מרוצה!",
    time: "10:30",
    type: "update",
  },
  {
    id: "2",
    user: "נועה שחם",
    message: "לקחתי לטיפול את הפניה הדחופה מ״אלוני״",
    time: "10:15",
    type: "status",
  },
  {
    id: "3",
    user: "יוסי מזרחי",
    message: "יצאתי להפסקת צהריים, חוזר עוד חצי שעה",
    time: "10:00",
    type: "note",
  },
  {
    id: "4",
    user: "שרה לוי",
    message: "דו״ח יומי נוצר בהצלחה",
    time: "09:00",
    type: "update",
  },
];

const ActivityFeedBox: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`h-full flex flex-col rounded-2xl border overflow-hidden ${
        isDarkMode
          ? "bg-slate-800 border-slate-700"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b ${
          isDarkMode
            ? "bg-slate-700/50 border-slate-600"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex items-center gap-2">
          <Filter
            className={`w-4 h-4 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          />
        </div>
        <div className="flex items-center gap-2" dir="rtl">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          <h3
            className={`font-bold text-sm ${
              isDarkMode ? "text-white" : "text-slate-800"
            }`}
          >
            עדכונים חמים
          </h3>
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        </div>
      </div>

      {/* Subtitle */}
      <div
        className={`px-4 py-2 text-xs text-center ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
        dir="rtl"
      >
        מחובר לשרת בזמן אמת
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3" dir="rtl">
        <div
          className={`text-center text-xs py-2 rounded-full ${
            isDarkMode
              ? "bg-slate-700/50 text-slate-400"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          היום
        </div>
        {mockActivities.map((activity) => (
          <ActivityMessage
            key={activity.id}
            activity={activity}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>

      {/* Search Input */}
      <div
        className={`px-3 py-3 border-t ${
          isDarkMode ? "border-slate-700" : "border-slate-200"
        }`}
      >
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
            isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
          }`}
          dir="rtl"
        >
          <Search
            className={`w-4 h-4 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          />
          <input
            type="text"
            placeholder="עדכונים אוטומטיים בלבד..."
            className={`flex-1 bg-transparent text-sm outline-none ${
              isDarkMode
                ? "text-white placeholder-slate-400"
                : "text-slate-800 placeholder-slate-500"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default ActivityFeedBox;
