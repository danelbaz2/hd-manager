import React, { useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface HierarchySearchProps {
  isDarkMode: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount: number;
}

export const HierarchySearch: React.FC<HierarchySearchProps> = ({
  isDarkMode,
  searchQuery,
  onSearchChange,
  resultsCount,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus on Ctrl+F or Cmd+F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Clear on Escape
      if (e.key === 'Escape' && searchQuery) {
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, onSearchChange]);

  const hasQuery = searchQuery.length > 0;

  return (
    <div className={`
      flex items-center gap-2 rounded-xl w-64
      ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/80'}
      border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}
      shadow-sm
      transition-all duration-200
      ${hasQuery 
        ? isDarkMode 
          ? 'border-blue-500/50' 
          : 'border-blue-300'
        : ''
      }
    `}>
      {/* Search Icon */}
      <div className={`
        pr-3 pl-1 py-2
        ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}
      `}>
        <Search className="w-4 h-4" />
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="פיקוד, אוגדה, חטיבה..."
        dir="rtl"
        className={`
          flex-1 py-2 text-sm min-w-0
          bg-transparent outline-none
          ${isDarkMode 
            ? 'text-white placeholder-slate-500' 
            : 'text-slate-800 placeholder-slate-400'
          }
        `}
      />

      {/* Results Count & Clear Button */}
      {hasQuery && (
        <div className="flex items-center gap-1.5 pl-2">
          {/* Results Badge */}
          <span className={`
            text-xs font-medium px-1.5 py-0.5 rounded
            ${resultsCount > 0
              ? isDarkMode 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
              : isDarkMode 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-red-100 text-red-600'
            }
          `}>
            {resultsCount}
          </span>

          {/* Clear Button */}
          <button
            onClick={() => onSearchChange('')}
            className={`
              p-1 rounded transition-colors
              ${isDarkMode 
                ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
              }
            `}
            title="נקה (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
