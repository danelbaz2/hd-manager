import React from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  isDarkMode: boolean;
  onChange: (value: string) => void;
}

/**
 * SearchInput - Styled search input with icon
 */
const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "חיפוש...",
  isDarkMode,
  onChange,
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-48 lg:w-64
          pl-10 pr-4 py-2 lg:py-2.5
          rounded-xl border
          text-sm
          transition-all duration-200
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-700 text-white placeholder-slate-400 focus:border-blue-500"
              : "bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 shadow-sm"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500/20
        `}
      />
      <Search
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
          isDarkMode ? "text-slate-400" : "text-slate-400"
        }`}
      />
    </div>
  );
};

export default SearchInput;
