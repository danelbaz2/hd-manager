import React from "react";
import { ChevronDown, ChevronRight, Target, Plus, Trash2 } from "lucide-react";
import { LEVEL_COLORS } from "../constants";
import type { HativaData } from "../../../../../api/militaryHierarchyApi";
import { ActionButton } from "./ActionButton";
import { GdudChip } from "./GdudChip";

interface HativaCardProps {
  pikudKey: string;
  ugdaKey: string;
  hativaKey: string;
  hativaData: HativaData;
  isDarkMode: boolean;
  expanded: boolean;
  highlightedUnits?: Set<string>;
  onToggle: () => void;
  onDelete: () => void;
  onAddGdud: () => void;
  onDeleteGdud: (gdudKey: string) => void;
}

export const HativaCard: React.FC<HativaCardProps> = ({
  pikudKey,
  ugdaKey,
  hativaKey,
  hativaData,
  isDarkMode,
  expanded,
  highlightedUnits = new Set(),
  onToggle,
  onDelete,
  onAddGdud,
  onDeleteGdud,
}) => {
  const c = LEVEL_COLORS.hativa[isDarkMode ? "dark" : "light"];
  const gdudimCount = Object.keys(hativaData.gdudim).length;
  const isHighlighted = highlightedUnits.has(
    `hativa-${pikudKey}-${ugdaKey}-${hativaKey}`
  );

  return (
    <div
      className={`
      rounded-lg border-2 overflow-hidden transition-all
      ${
        isHighlighted
          ? `${c.bg} border-yellow-400 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]`
          : `${c.bg} ${c.border}`
      }
    `}
    >
      <div
        className="px-3 py-2.5 flex items-center justify-between cursor-pointer hover:opacity-90 transition-opacity"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
              isDarkMode ? "bg-slate-800/20" : "bg-white/40"
            }`}
          >
            {expanded ? (
              <ChevronDown className={`w-3.5 h-3.5 ${c.icon}`} />
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${c.icon}`} />
            )}
          </div>
          <div
            className={`w-6 h-6 rounded flex items-center justify-center ${c.accent}`}
          >
            <Target className="w-3 h-3 text-white" />
          </div>
          <span
            className={`font-medium text-sm ${c.text} ${
              isHighlighted
                ? "bg-yellow-200/50 dark:bg-yellow-500/20 px-1 rounded"
                : ""
            }`}
          >
            חטיבה {hativaKey}
          </span>
          <span
            className={`text-xs ${
              isDarkMode ? "text-slate-500" : "text-slate-400"
            }`}
          >
            ({gdudimCount})
          </span>
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionButton
            icon={<Plus className="w-3 h-3" />}
            onClick={onAddGdud}
            tooltip="הוסף גדוד"
            isDarkMode={isDarkMode}
            tiny
          />
          <ActionButton
            icon={<Trash2 className="w-3 h-3" />}
            onClick={onDelete}
            tooltip="מחק חטיבה"
            isDarkMode={isDarkMode}
            danger
            tiny
          />
        </div>
      </div>

      {/* Gdudim - Using grid for smooth animation */}
      <div
        className={`
          grid transition-all duration-300 ease-out
          ${
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-2.5 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-wrap gap-2">
              {Object.entries(hativaData.gdudim).map(([gdudKey]) => (
                <GdudChip
                  key={gdudKey}
                  pikudKey={pikudKey}
                  ugdaKey={ugdaKey}
                  hativaKey={hativaKey}
                  gdudKey={gdudKey}
                  isDarkMode={isDarkMode}
                  isHighlighted={highlightedUnits.has(
                    `gdud-${pikudKey}-${ugdaKey}-${hativaKey}-${gdudKey}`
                  )}
                  onDelete={() => onDeleteGdud(gdudKey)}
                />
              ))}
              {gdudimCount === 0 && (
                <span
                  className={`text-xs italic ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  אין גדודים
                </span>
              )}

              {/* Quick Add Button Inline */}
              <button
                onClick={onAddGdud}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg border border-dashed text-xs font-medium transition-all ${
                  isDarkMode
                    ? "border-slate-600 text-slate-400 hover:text-blue-400 hover:border-blue-400/50 bg-slate-800/30"
                    : "border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 bg-white/50"
                }`}
              >
                <Plus className="w-3 h-3" />
                הוסף גדוד
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
