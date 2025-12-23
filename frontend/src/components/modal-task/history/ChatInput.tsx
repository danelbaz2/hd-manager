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
        flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200
        ${isDarkMode
          ? "bg-slate-700/60 border-slate-600"
          : "bg-white border-slate-200"
        }
        focus-within:border-blue-500
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
          flex-1 resize-none text-sm leading-normal
          bg-transparent border-none outline-none
          ${isDarkMode
            ? "text-white placeholder-slate-400"
            : "text-slate-800 placeholder-slate-400"
          }
        `}
        style={{ minHeight: "22px", maxHeight: "80px" }}
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!text.trim() || isSubmitting}
        className={`
          shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
          transition-all duration-200
          ${!text.trim() || isSubmitting
            ? isDarkMode
              ? "bg-slate-600/50 text-slate-500 cursor-not-allowed"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
          }
        `}
      >
        {isSubmitting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};

export default ChatInput;
