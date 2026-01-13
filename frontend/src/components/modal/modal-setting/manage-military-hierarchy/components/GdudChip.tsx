import React from 'react';
import { X, Users } from 'lucide-react';
import { LEVEL_COLORS } from '../constants';

interface GdudChipProps {
  pikudKey: string;
  ugdaKey: string;
  hativaKey: string;
  gdudKey: string;
  isDarkMode: boolean;
  isHighlighted?: boolean;
  isNew?: boolean;
  onDelete: () => void;
}

export const GdudChip: React.FC<GdudChipProps> = ({ 
  gdudKey, 
  isDarkMode, 
  isHighlighted = false,
  isNew = false,
  onDelete 
}) => {
  const c = LEVEL_COLORS.gdud[isDarkMode ? 'dark' : 'light'];
  
  return (
    <div className={`
      group flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-lg border-2 
      transition-all hover:shadow-sm relative
      ${isNew
        ? 'border-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,0.3)] bg-emerald-100/50 dark:bg-emerald-500/10'
        : isHighlighted 
          ? 'border-yellow-400 shadow-[0_0_0_2px_rgba(250,204,21,0.3)] bg-yellow-100/50 dark:bg-yellow-500/10' 
          : `${c.border} ${c.bg}`
      }
    `}>
      <div className={`w-5 h-5 rounded flex items-center justify-center ${c.accent}`}>
        <Users className="w-3 h-3 text-white" />
      </div>
      <span className={`text-xs font-medium ${c.text} ${isHighlighted || isNew ? 'font-bold' : ''}`}>
        גדוד {gdudKey}
      </span>
      {isNew && (
        <span className="px-1 py-0 rounded text-[8px] font-bold bg-emerald-500 text-white">
          חדש
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className={`opacity-0 group-hover:opacity-100 p-0.5 rounded transition-all hover:bg-red-500/20 ${
          isDarkMode ? 'text-red-400' : 'text-red-500'
        }`}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
