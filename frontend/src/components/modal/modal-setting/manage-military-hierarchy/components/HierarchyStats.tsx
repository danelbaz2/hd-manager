import React from 'react';
import { Shield, Layers, Target, Users } from 'lucide-react';

interface HierarchyStatsProps {
  isDarkMode: boolean;
  stats: {
    pikudim: number;
    ugdot: number;
    hativot: number;
    gdudim: number;
  };
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  isDarkMode: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, color, isDarkMode }) => {
  const colorClasses = {
    blue: isDarkMode 
      ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
      : 'bg-blue-100 text-blue-700 border-blue-200',
    emerald: isDarkMode 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
      : 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: isDarkMode 
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
      : 'bg-amber-100 text-amber-700 border-amber-200',
    purple: isDarkMode 
      ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' 
      : 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-xl border
      transition-all duration-200 hover:scale-105
      ${colorClasses[color]}
    `}>
      <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">
        {icon}
      </div>
      <div className="text-right">
        <div className="text-lg font-bold leading-none">{value}</div>
        <div className="text-xs opacity-80 font-medium">{label}</div>
      </div>
    </div>
  );
};

export const HierarchyStats: React.FC<HierarchyStatsProps> = ({ isDarkMode, stats }) => {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap mb-6">
      <StatItem 
        icon={<Shield className="w-4 h-4" />} 
        label="פיקודים" 
        value={stats.pikudim} 
        color="blue" 
        isDarkMode={isDarkMode} 
      />
      <StatItem 
        icon={<Layers className="w-4 h-4" />} 
        label="אוגדות" 
        value={stats.ugdot} 
        color="emerald" 
        isDarkMode={isDarkMode} 
      />
      <StatItem 
        icon={<Target className="w-4 h-4" />} 
        label="חטיבות" 
        value={stats.hativot} 
        color="amber" 
        isDarkMode={isDarkMode} 
      />
      <StatItem 
        icon={<Users className="w-4 h-4" />} 
        label="גדודים" 
        value={stats.gdudim} 
        color="purple" 
        isDarkMode={isDarkMode} 
      />
    </div>
  );
};
