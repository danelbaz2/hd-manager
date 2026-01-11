import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ModalOverlay } from '../../../../common/ModalOverlay';
import { UNIT_LABELS, UNIT_ICONS, LEVEL_COLORS } from '../constants';
import type { UnitType } from '../constants';

interface AddUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  type: UnitType;
  parentName?: string;
  isDarkMode: boolean;
}

export const AddUnitModal: React.FC<AddUnitModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  type, 
  parentName, 
  isDarkMode 
}) => {
  const [value, setValue] = useState('');
  
  useEffect(() => {
    if (isOpen) setValue('');
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value.trim());
      setValue('');
    }
  };

  const Icon = UNIT_ICONS[type];
  const colors = LEVEL_COLORS[type][isDarkMode ? 'dark' : 'light'];
  const unitLabel = UNIT_LABELS[type];

  // Placeholder examples per type
  const placeholderExamples: Record<UnitType, string> = {
    pikud: 'פיקוד העורף',
    ugda: '162',
    hativa: '7',
    gdud: 'שקד'
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-md">
      <div 
        dir="rtl"
        className={`
          overflow-hidden rounded-2xl shadow-2xl border
          ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
        `}
      >
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between border-b ${colors.bg} ${colors.border}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${colors.accent}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${colors.text}`}>
                הוספת {unitLabel} חדש
              </h3>
              {parentName && (
                <p className={`text-xs opacity-80 ${colors.text}`}>
                  {parentName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'hover:bg-slate-700/50 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-white/50 text-slate-500 hover:text-slate-700'
              }
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={`
              block text-sm font-semibold mb-2
              ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}
            `}>
              שם/מספר ה{unitLabel}
            </label>
            <input
              autoFocus
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              dir="rtl"
              className={`
                w-full px-4 py-3 rounded-xl border-2 
                transition-all outline-none text-base text-right
                ${isDarkMode 
                  ? 'bg-slate-700/50 border-slate-600 text-white focus:border-blue-500 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 focus:bg-white placeholder-slate-400'
                }
              `}
              placeholder={`לדוגמה: ${placeholderExamples[type]}`}
            />
          </div>
          
          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`
                flex-1 px-5 py-2.5 rounded-xl text-sm font-medium 
                transition-colors border
                ${isDarkMode 
                  ? 'text-slate-400 border-slate-600 hover:bg-slate-700 hover:text-slate-200' 
                  : 'text-slate-500 border-slate-300 hover:bg-slate-100 hover:text-slate-700'
                }
              `}
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              className={`
                flex-1 px-6 py-2.5 text-white rounded-xl text-sm font-bold 
                shadow-lg transition-all transform active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                ${value.trim() ? colors.accent : 'bg-slate-400'} 
                hover:brightness-110
              `}
            >
              הוסף {unitLabel}
            </button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};
