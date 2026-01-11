import React from 'react';

interface ActionButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip: string;
  isDarkMode: boolean;
  danger?: boolean;
  small?: boolean;
  tiny?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon, onClick, tooltip, isDarkMode, danger, small, tiny }) => {
  const sizeClass = tiny ? 'p-1' : small ? 'p-1.5' : 'p-2';
  const roundedClass = tiny ? 'rounded' : small ? 'rounded-lg' : 'rounded-xl';
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={tooltip}
      className={`${sizeClass} ${roundedClass} transition-all hover:scale-105 active:scale-95 ${
        danger
          ? 'text-red-500 hover:bg-red-500/10'
          : isDarkMode
            ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-600/50'
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      {icon}
    </button>
  );
};
