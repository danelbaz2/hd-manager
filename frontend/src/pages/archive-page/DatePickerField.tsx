import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import Calendar from "../../components/layout/header-bar/Calendar";

interface Props {
  value: number | null;
  onChange: (ts: number) => void;
  placeholder?: string;
}

const DatePickerField: React.FC<Props> = ({
  value,
  onChange,
  placeholder = "בחר תאריך",
}) => {
  const { isDarkMode } = useTheme();
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setShow(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const fmt = (ts: number | null) =>
    ts
      ? new Date(ts).toLocaleDateString("he-IL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      : "";
  const box = `relative flex items-center h-10 rounded-lg border transition-all ${isDarkMode
      ? "bg-slate-800/60 border-slate-600/50 hover:border-slate-500"
      : "bg-slate-50 border-slate-200 hover:border-slate-300"
    }`;
  const ico =
    "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-slate-400";
  const ring = show
    ? isDarkMode
      ? "border-blue-500"
      : "border-blue-400 ring-2 ring-blue-500/20"
    : "";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={`${box} w-full cursor-pointer ${ring}`}
      >
        <CalendarIcon className={ico} />
        <span
          className={`w-full text-right text-sm pr-10 pl-3 ${value
              ? isDarkMode
                ? "text-white"
                : "text-slate-700"
              : "text-slate-400"
            }`}
        >
          {value ? fmt(value) : placeholder}
        </span>
      </button>
      {show && (
        <div className="absolute top-full mt-2 right-0 z-9999">
          <Calendar
            selectedDate={value || Date.now()}
            onDateSelect={(ts) => {
              onChange(ts);
              setShow(false);
            }}
            onClose={() => setShow(false)}
          />
        </div>
      )}
    </div>
  );
};

export default DatePickerField;
