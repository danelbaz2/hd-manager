/**
 * ChatInput - Chat-like input for adding notes with send animation
 */
import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  isDarkMode: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isDarkMode,
  placeholder = "כתוב עדכון...",
}) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(
        inputRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [text]);

  const handleSend = async () => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSend(text.trim());
      setText("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`
        flex items-end gap-2 p-3 rounded-2xl border-2 transition-all
        ${
          isDarkMode
            ? "bg-slate-700/50 border-slate-600 focus-within:border-blue-500"
            : "bg-white border-slate-200 focus-within:border-blue-500"
        }
        focus-within:ring-2 focus-within:ring-blue-500/20
      `}
    >
      {/* Text Input */}
      <textarea
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className={`
          flex-1 resize-none text-sm leading-relaxed
          bg-transparent border-none outline-none
          ${
            isDarkMode
              ? "text-white placeholder-slate-400"
              : "text-slate-800 placeholder-slate-400"
          }
        `}
        style={{ minHeight: "24px", maxHeight: "120px" }}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || isSubmitting}
        className={`
          shrink-0 w-9 h-9 rounded-xl flex items-center justify-center
          transition-all duration-200 transform
          ${
            !text.trim() || isSubmitting
              ? isDarkMode
                ? "bg-slate-600 text-slate-400 cursor-not-allowed"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
              : showSuccess
              ? "bg-green-500 text-white scale-110"
              : "bg-blue-500 text-white hover:bg-blue-600 hover:scale-105 active:scale-95"
          }
        `}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : showSuccess ? (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default ChatInput;
