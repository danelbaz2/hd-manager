import React, { useState, useCallback } from "react";
import { Send } from "lucide-react";
import type { MessageInputProps } from "./types";

export const MessageInput: React.FC<MessageInputProps> = ({
  isDarkMode,
  onSend,
  isLoading,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim() || isLoading) return;
      await onSend(content.trim());
      setContent("");
    },
    [content, isLoading, onSend]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-end gap-2 p-3 border-t ${
        isDarkMode
          ? "border-slate-700 bg-slate-800"
          : "border-slate-200 bg-white"
      }`}
      dir="rtl"
    >
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="כתוב עדכון לצוות..."
        rows={1}
        className={`flex-1 resize-none rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${
          isDarkMode
            ? "bg-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            : "bg-slate-100 text-slate-800 placeholder-slate-500 focus:ring-2 focus:ring-blue-400"
        }`}
        style={{ minHeight: "40px", maxHeight: "100px" }}
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={!content.trim() || isLoading}
        className={`p-2.5 rounded-xl transition-all ${
          content.trim() && !isLoading
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105"
            : isDarkMode
            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        }`}
      >
        <Send className={`w-5 h-5 ${isLoading ? "animate-pulse" : ""}`} />
      </button>
    </form>
  );
};
