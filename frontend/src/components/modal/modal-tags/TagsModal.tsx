import React, { useState, useEffect } from "react";
import { X, Tag, Users } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useTagsModal } from "./TagsModalContext";
import ContactCard from "./ContactCard";

/**
 * TagsModal - Left-side slide-in panel showing tag details and related contacts
 * Slides in from the left with smooth animation, no backdrop blocking the task modal
 */
const TagsModal: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { state, closeTagsModal } = useTagsModal();
  const { isOpen, tag, relatedContacts } = state;

  // Animation state for slide-in effect
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Delay for animation to kick in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender || !tag) return null;

  return (
    <>
      {/* Subtle backdrop - semi-transparent, doesn't fully block task modal */}
      <div
        className={`
                    fixed inset-0 z-[99998] transition-opacity duration-300
                    ${isVisible ? "bg-black/20" : "bg-transparent"}
                `}
        onClick={closeTagsModal}
      />

      {/* Modal Panel - Left Side with slide animation */}
      <div
        className={`
                    fixed top-0 left-0 h-full w-[320px] z-[99999]
                    shadow-2xl transition-transform duration-300 ease-out
                    flex flex-col overflow-hidden
                    ${
                      isDarkMode
                        ? "bg-slate-800 border-r border-slate-700"
                        : "bg-white border-r border-slate-200"
                    }
                    ${isVisible ? "translate-x-0" : "-translate-x-full"}
                `}
        dir="rtl"
      >
        {/* Header */}
        <div
          className={`
                        flex items-center justify-between px-5 py-4
                        border-b ${
                          isDarkMode ? "border-slate-700" : "border-slate-200"
                        }
                    `}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${tag.color}20` }}
            >
              <Tag className="w-5 h-5" style={{ color: tag.color }} />
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                {tag.name}
              </h2>
              <span
                className={`text-xs ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {tag.isPrimary ? "תגית ראשית" : "תגית משנית"}
              </span>
            </div>
          </div>
          <button
            onClick={closeTagsModal}
            className={`
                            p-2 rounded-lg transition-colors
                            ${
                              isDarkMode
                                ? "hover:bg-slate-700 text-slate-400"
                                : "hover:bg-slate-100 text-slate-500"
                            }
                        `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Tag Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: tag.color, color: "#fff" }}
          >
            <Tag className="w-4 h-4" />
            <span className="font-semibold text-sm">{tag.name}</span>
          </div>

          {/* Description */}
          {tag.description && (
            <div
              className={`p-4 rounded-xl ${
                isDarkMode ? "bg-slate-700/50" : "bg-slate-50"
              }`}
            >
              <p
                className={`text-sm leading-relaxed ${
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                {tag.description}
              </p>
            </div>
          )}

          {/* Related Contacts */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users
                className={`w-4 h-4 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                אנשי קשר קשורים ({relatedContacts.length})
              </span>
            </div>

            {relatedContacts.length > 0 ? (
              <div className="space-y-2">
                {relatedContacts.map((contact) => (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isDarkMode={isDarkMode}
                  />
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-8 rounded-xl ${
                  isDarkMode ? "bg-slate-700/30" : "bg-slate-50"
                }`}
              >
                <Users
                  className={`w-8 h-8 mx-auto mb-2 ${
                    isDarkMode ? "text-slate-600" : "text-slate-300"
                  }`}
                />
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  אין אנשי קשר מקושרים לתגית זו
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TagsModal;
