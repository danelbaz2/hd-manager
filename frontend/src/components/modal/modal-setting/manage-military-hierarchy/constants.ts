import { Layers, Shield, Target, Users } from "lucide-react";

export const LEVEL_COLORS = {
  pikud: {
    light: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500', accent: 'bg-blue-500' },
    dark: { bg: 'bg-blue-900/20', border: 'border-blue-700/50', text: 'text-blue-300', icon: 'text-blue-400', accent: 'bg-blue-600' }
  },
  ugda: {
    light: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', accent: 'bg-emerald-500' },
    dark: { bg: 'bg-emerald-900/20', border: 'border-emerald-700/50', text: 'text-emerald-300', icon: 'text-emerald-400', accent: 'bg-emerald-600' }
  },
  hativa: {
    light: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', accent: 'bg-amber-500' },
    dark: { bg: 'bg-amber-900/20', border: 'border-amber-700/50', text: 'text-amber-300', icon: 'text-amber-400', accent: 'bg-amber-600' }
  },
  gdud: {
    light: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500', accent: 'bg-purple-500' },
    dark: { bg: 'bg-purple-900/20', border: 'border-purple-700/50', text: 'text-purple-300', icon: 'text-purple-400', accent: 'bg-purple-600' }
  }
};

export type UnitType = 'pikud' | 'ugda' | 'hativa' | 'gdud';

export const UNIT_LABELS: Record<UnitType, string> = {
  pikud: 'פיקוד',
  ugda: 'אוגדה',
  hativa: 'חטיבה',
  gdud: 'גדוד'
};

export const UNIT_ICONS = {
    pikud: Shield,
    ugda: Layers,
    hativa: Target,
    gdud: Users
};
