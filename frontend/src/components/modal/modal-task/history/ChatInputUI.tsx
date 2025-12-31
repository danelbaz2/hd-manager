/**
 * ChatInputUI - Pure UI component for the chat input.
 * Handles rendering only, no business logic.
 */
import React, { forwardRef } from "react";
import { Send, Loader2 } from "lucide-react";

interface ChatInputUIProps {
    text: string;
    isDarkMode: boolean;
    isSubmitting: boolean;
    placeholder: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onBlur: () => void;
    onSend: () => void;
}

const ChatInputUI = forwardRef<HTMLTextAreaElement, ChatInputUIProps>(
    (
        { text, isDarkMode, isSubmitting, placeholder, onChange, onKeyDown, onBlur, onSend },
        ref
    ) => (
        <div
            className={`
        flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200
        ${isDarkMode ? "bg-slate-700/60 border-slate-600" : "bg-white border-slate-200"}
        focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20
      `}
        >
            <textarea
                ref={ref}
                value={text}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onBlur={onBlur}
                placeholder={placeholder}
                rows={1}
                className={`
          flex-1 resize-none text-sm leading-normal bg-transparent border-none outline-none
          ${isDarkMode ? "text-white placeholder-slate-400" : "text-slate-800 placeholder-slate-400"}
        `}
                style={{ minHeight: "22px", maxHeight: "80px" }}
            />

            <button
                onClick={onSend}
                disabled={!text.trim() || isSubmitting}
                className={`
          shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
          ${!text.trim() || isSubmitting
                        ? isDarkMode
                            ? "bg-slate-600/50 text-slate-500 cursor-not-allowed"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                    }
        `}
            >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
        </div>
    )
);

ChatInputUI.displayName = "ChatInputUI";

export default ChatInputUI;
