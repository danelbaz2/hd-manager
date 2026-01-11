import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { ModalOverlay } from "../../../../common/ModalOverlay";
import { UNIT_LABELS } from "../constants";
import type { UnitType } from "../constants";

interface DeleteUnitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: UnitType;
  name: string;
  isDarkMode: boolean;
}

export const DeleteUnitModal: React.FC<DeleteUnitModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  name,
  isDarkMode,
}) => {
  const unitLabel = UNIT_LABELS[type];

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose} maxWidthClass="max-w-md">
      <div
        dir="rtl"
        className={`
          overflow-hidden rounded-2xl shadow-2xl border
          ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }
        `}
      >
        {/* Header */}
        <div
          className={`
          px-6 py-4 flex items-center justify-between border-b
          ${
            isDarkMode
              ? "bg-red-900/20 border-red-900/30"
              : "bg-red-50 border-red-100"
          }
        `}
        >
          <div className="flex items-center gap-3">
            <div
              className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDarkMode ? "bg-red-500/20" : "bg-red-100"}
            `}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3
              className={`text-lg font-bold ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              מחיקת {unitLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              }
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Main Message - Centered layout */}
          <div className="text-center">
            <div
              className={`
              w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center
              ${isDarkMode ? "bg-red-500/10" : "bg-red-50"}
            `}
            >
              <AlertTriangle className="w-7 h-7 text-red-500" />
            </div>

            <p
              className={`text-base mb-3 ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              האם אתה בטוח שברצונך למחוק את
            </p>

            <p
              className={`
              text-xl font-bold mb-1
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
            >
              ה{unitLabel} "{name}"?
            </p>
          </div>

          {/* Warning Box */}
          <div
            className={`
            p-4 rounded-xl border-2
            ${
              isDarkMode
                ? "bg-red-900/10 border-red-500/30"
                : "bg-red-50 border-red-200"
            }
          `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                px-2 py-1 rounded-lg text-xs font-bold tracking-wide flex-shrink-0
                ${
                  isDarkMode
                    ? "bg-red-500/20 text-red-400"
                    : "bg-red-100 text-red-600"
                }
              `}
              >
                ⚠️ שים לב
              </div>
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? "text-red-300" : "text-red-700"
                }`}
              >
                פעולה זו היא <strong>בלתי הפיכה</strong> ותמחק את כל היחידות
                הכפופות ל{unitLabel} זה.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          className={`
          px-6 py-4 flex gap-3 border-t
          ${
            isDarkMode
              ? "bg-slate-900/50 border-slate-700"
              : "bg-slate-50 border-slate-200"
          }
        `}
        >
          <button
            onClick={onClose}
            className={`
              flex-1 px-4 py-3 rounded-xl text-sm font-bold 
              transition-all duration-200
              ${
                isDarkMode
                  ? "text-slate-300 bg-slate-700 hover:bg-slate-600 border border-slate-600"
                  : "text-slate-600 bg-white hover:bg-slate-100 border border-slate-300"
              }
            `}
          >
            ביטול
          </button>
          <button
            onClick={onConfirm}
            className={`
              flex-1 px-4 py-3 rounded-xl text-sm font-bold
              bg-red-500 hover:bg-red-600 text-white
              shadow-lg shadow-red-500/20 hover:shadow-red-500/40
              transition-all duration-200
              transform active:scale-[0.98]
              flex items-center justify-center gap-2
            `}
          >
            <Trash2 className="w-4 h-4" />
            <span>כן, מחק {unitLabel}</span>
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};
