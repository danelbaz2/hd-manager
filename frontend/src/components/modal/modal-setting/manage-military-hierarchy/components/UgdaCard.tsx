import React from "react";
import { ChevronDown, Layers, Plus, Trash2 } from "lucide-react";
import { LEVEL_COLORS } from "../constants";
import type { UgdaData } from "../../../../../api/militaryHierarchyApi";
import { ActionButton } from "./ActionButton";
import { HativaCard } from "./HativaCard";

interface UgdaCardProps {
  ugdaKey: string;
  ugdaData: UgdaData;
  isDarkMode: boolean;
  expanded: boolean;
  expandedNodes: Set<string>;
  highlightedUnits?: Set<string>;
  onToggle: () => void;
  onToggleNode: (nodeId: string) => void;
  onDelete: () => void;
  onAddHativa: () => void;
  onDeleteHativa: (hativaKey: string) => void;
  onAddGdud: (hativaKey: string) => void;
  onDeleteGdud: (hativaKey: string, gdudKey: string) => void;
  pikudKey: string;
}

export const UgdaCard: React.FC<UgdaCardProps> = ({
  ugdaKey,
  ugdaData,
  isDarkMode,
  expanded,
  expandedNodes,
  highlightedUnits = new Set(),
  onToggle,
  onToggleNode,
  onDelete,
  onAddHativa,
  onDeleteHativa,
  onAddGdud,
  onDeleteGdud,
  pikudKey,
}) => {
  const c = LEVEL_COLORS.ugda[isDarkMode ? "dark" : "light"];
  const hativotCount = Object.keys(ugdaData.hativot).length;
  const isHighlighted = highlightedUnits.has(`ugda-${pikudKey}-${ugdaKey}`);

  return (
    <div
      className={`
      rounded-xl border-2 overflow-hidden transition-all duration-300
      ${
        isHighlighted
          ? `${c.bg} border-yellow-400 shadow-[0_0_0_2px_rgba(250,204,21,0.3)]`
          : `${c.bg} ${c.border}`
      }
    `}
    >
      <div
        className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-300 ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          >
            <ChevronDown className={`w-4 h-4 ${c.icon}`} />
          </div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${c.accent} shadow-sm`}
          >
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <span
              className={`font-semibold ${c.text} ${
                isHighlighted
                  ? "bg-yellow-200/50 dark:bg-yellow-500/20 px-1.5 rounded"
                  : ""
              }`}
            >
              אוגדה {ugdaKey}
            </span>
            <span
              className={`text-xs mr-2 ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              ({hativotCount} חטיבות)
            </span>
          </div>
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionButton
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={onAddHativa}
            tooltip="הוסף חטיבה"
            isDarkMode={isDarkMode}
            small
          />
          <ActionButton
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={onDelete}
            tooltip="מחק אוגדה"
            isDarkMode={isDarkMode}
            danger
            small
          />
        </div>
      </div>

      {/* Hativot - Using grid for smooth animation */}
      <div
        className={`
          grid transition-all duration-400 ease-out
          ${
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-3 pt-1 space-y-2 border-t border-slate-200/50 dark:border-slate-700/50">
            {Object.entries(ugdaData.hativot).map(([hativaKey, hativaData]) => (
              <HativaCard
                key={hativaKey}
                pikudKey={pikudKey}
                ugdaKey={ugdaKey}
                hativaKey={hativaKey}
                hativaData={hativaData}
                isDarkMode={isDarkMode}
                expanded={expandedNodes.has(
                  `hativa-${pikudKey}-${ugdaKey}-${hativaKey}`
                )}
                highlightedUnits={highlightedUnits}
                onToggle={() =>
                  onToggleNode(`hativa-${pikudKey}-${ugdaKey}-${hativaKey}`)
                }
                onDelete={() => onDeleteHativa(hativaKey)}
                onAddGdud={() => onAddGdud(hativaKey)}
                onDeleteGdud={(gdudKey) => onDeleteGdud(hativaKey, gdudKey)}
              />
            ))}

            {hativotCount === 0 && (
              <button
                onClick={onAddHativa}
                className={`w-full py-3 rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  isDarkMode
                    ? "border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-900/10 text-slate-500"
                    : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-400"
                }`}
              >
                <span className="text-xs font-medium">
                  אין חטיבות - לחץ להוספה
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
