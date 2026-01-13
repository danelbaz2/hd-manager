import React from "react";
import { ChevronDown, Shield, Plus, Trash2 } from "lucide-react";
import { LEVEL_COLORS } from "../constants";
import type { PikudData } from "../../../../../api/militaryHierarchyApi";
import { ActionButton } from "./ActionButton";
import { UgdaCard } from "./UgdaCard";

interface PikudCardProps {
  pikudKey: string;
  pikudData: PikudData;
  isDarkMode: boolean;
  expanded: boolean;
  expandedNodes: Set<string>;
  highlightedUnits?: Set<string>;
  newUnits?: Set<string>;
  onToggle: () => void;
  onToggleNode: (nodeId: string) => void;
  onDelete: () => void;
  onAddUgda: () => void;
  onDeleteUgda: (ugdaKey: string) => void;
  onAddHativa: (ugdaKey: string) => void;
  onDeleteHativa: (ugdaKey: string, hativaKey: string) => void;
  onAddGdud: (ugdaKey: string, hativaKey: string) => void;
  onDeleteGdud: (ugdaKey: string, hativaKey: string, gdudKey: string) => void;
}

export const PikudCard: React.FC<PikudCardProps> = ({
  pikudKey,
  pikudData,
  isDarkMode,
  expanded,
  expandedNodes,
  highlightedUnits = new Set(),
  newUnits = new Set(),
  onToggle,
  onToggleNode,
  onDelete,
  onAddUgda,
  onDeleteUgda,
  onAddHativa,
  onDeleteHativa,
  onAddGdud,
  onDeleteGdud,
}) => {
  const c = LEVEL_COLORS.pikud[isDarkMode ? "dark" : "light"];
  const ugdotCount = Object.keys(pikudData.ugdot).length;
  const isHighlighted = highlightedUnits.has(`pikud-${pikudKey}`);
  const isNew = newUnits.has(`pikud-${pikudKey}`);

  return (
    <div
      className={`
      rounded-2xl border-2 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md relative
      ${isDarkMode ? "bg-slate-800/50" : "bg-white"}
      ${isNew
        ? "border-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.3)] ring-1 ring-emerald-400/50"
        : isHighlighted
          ? "border-yellow-400 shadow-[0_0_0_3px_rgba(250,204,21,0.3)]"
          : isDarkMode
            ? "border-slate-700/50"
            : "border-slate-200"
      }
    `}
    >
      {/* Header */}
      <div
        className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${c.bg} hover:brightness-95 dark:hover:brightness-110`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 ${
              expanded ? "rotate-0" : "-rotate-90"
            }`}
          >
            <ChevronDown className={`w-5 h-5 ${c.icon}`} />
          </div>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.accent} shadow-lg shadow-blue-500/20`}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3
                className={`font-bold text-xl ${c.text} ${
                  isHighlighted
                    ? "bg-yellow-200/50 dark:bg-yellow-500/20 px-2 rounded"
                    : ""
                }`}
              >
                פיקוד {pikudKey}
              </h3>
              {isNew && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                  חדש
                </span>
              )}
            </div>
            <p
              className={`text-xs ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {ugdotCount} {ugdotCount === 1 ? "אוגדה" : "אוגדות"}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <ActionButton
            icon={<Plus className="w-4 h-4" />}
            onClick={onAddUgda}
            tooltip="הוסף אוגדה"
            isDarkMode={isDarkMode}
          />
          <ActionButton
            icon={<Trash2 className="w-4 h-4" />}
            onClick={onDelete}
            tooltip="מחק פיקוד"
            isDarkMode={isDarkMode}
            danger
          />
        </div>
      </div>

      {/* Ugdot - Using grid for smooth animation */}
      <div
        className={`
          grid transition-all duration-500 ease-out
          ${
            expanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="overflow-hidden">
          <div className="p-4 space-y-3">
            {Object.entries(pikudData.ugdot).map(([ugdaKey, ugdaData]) => (
              <UgdaCard
                key={ugdaKey}
                pikudKey={pikudKey}
                ugdaKey={ugdaKey}
                ugdaData={ugdaData}
                isDarkMode={isDarkMode}
                expanded={expandedNodes.has(`ugda-${pikudKey}-${ugdaKey}`)}
                expandedNodes={expandedNodes}
                highlightedUnits={highlightedUnits}
                newUnits={newUnits}
                onToggle={() => onToggleNode(`ugda-${pikudKey}-${ugdaKey}`)}
                onToggleNode={onToggleNode}
                onDelete={() => onDeleteUgda(ugdaKey)}
                onAddHativa={() => onAddHativa(ugdaKey)}
                onDeleteHativa={(hativaKey) =>
                  onDeleteHativa(ugdaKey, hativaKey)
                }
                onAddGdud={(hativaKey) => onAddGdud(ugdaKey, hativaKey)}
                onDeleteGdud={(hativaKey, gdudKey) =>
                  onDeleteGdud(ugdaKey, hativaKey, gdudKey)
                }
              />
            ))}

            {ugdotCount === 0 && (
              <button
                onClick={onAddUgda}
                className={`w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                  isDarkMode
                    ? "border-slate-600 hover:border-blue-500 hover:bg-blue-900/10 text-slate-500 hover:text-blue-400"
                    : "border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-400 hover:text-blue-600"
                }`}
              >
                <Plus className="w-6 h-6" />
                <span className="font-medium">
                  הוסף אוגדה ראשונה לפיקוד {pikudKey}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
