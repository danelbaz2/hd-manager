import React from "react";
import { Megaphone, MessageSquare } from "lucide-react";
import { DEMO_TEAM_UPDATES } from "../../../../../components/demos/shared/tourData";

interface NotificationTeamProps {
  isTourActive: boolean;
  isDarkMode: boolean;
}

export const NotificationTeam: React.FC<NotificationTeamProps> = ({
  isTourActive,
  isDarkMode,
}) => {
  if (isTourActive) {
    return (
      <div className="space-y-3">
        {/* @ts-ignore */}
        {DEMO_TEAM_UPDATES.map((update: any) => (
          <div
            key={update.id}
            className={`p-3 rounded-xl border ${
              isDarkMode
                ? "bg-slate-800/50 border-slate-700"
                : "bg-white border-slate-100 shadow-sm"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  update.type === "announcement"
                    ? "bg-blue-100 text-blue-600"
                    : update.type === "celebration"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {update.type === "announcement" && (
                  <Megaphone className="w-4 h-4" />
                )}
                {update.type === "celebration" && (
                  <span className="text-sm">🎉</span>
                )}
                {update.type === "update" && (
                  <MessageSquare className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-semibold ${
                      isDarkMode ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {update.author}
                  </span>
                  <span
                    className={`text-xs ${
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {new Date(update.timestamp).toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    isDarkMode ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {update.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Placeholder for non-tour mode
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div
        className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
          isDarkMode ? "bg-purple-500/20" : "bg-purple-100"
        }`}
      >
        <Megaphone
          className={`w-8 h-8 ${
            isDarkMode ? "text-purple-400" : "text-purple-500"
          }`}
        />
      </div>
      <h4
        className={`font-semibold text-lg mb-2 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        עדכוני צוות
      </h4>
      <p
        className={`text-sm text-center ${
          isDarkMode ? "text-slate-400" : "text-slate-500"
        }`}
      >
        בקרוב תוכלו לפרסם עדכונים
        <br />
        והודעות לכל הצוות
      </p>
      <span
        className={`mt-4 px-3 py-1 text-xs rounded-full ${
          isDarkMode
            ? "bg-purple-500/20 text-purple-300"
            : "bg-purple-100 text-purple-600"
        }`}
      >
        בפיתוח 🚀
      </span>
    </div>
  );
};
