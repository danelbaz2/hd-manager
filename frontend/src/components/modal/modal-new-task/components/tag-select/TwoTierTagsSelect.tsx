import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { useTheme } from "../../../../../contexts/ThemeContext";
import {
    type PrimaryTagData,
    type SecondaryTagData,
} from "../../../../../schemas/tagTypes";
import PrimaryTagChip from "./PrimaryTagChip";
import SecondaryTagChip from "./SecondaryTagChip";
import TagDropdownContent from "./TagDropdownContent";

interface TwoTierTagsSelectProps {
    primaryTags: PrimaryTagData[];
    secondaryTags: SecondaryTagData[];
    selectedPrimaryTagIds?: string[];
    selectedSecondaryTagIds: string[];
    onChange: (secondaryTagIds: string[]) => void;
    onChangePrimary?: (primaryTagIds: string[]) => void;
    isLoading?: boolean;
}

/**
 * Two-Tier Tag Selection Component
 */
const TwoTierTagsSelect: React.FC<TwoTierTagsSelectProps> = ({
    primaryTags,
    secondaryTags,
    selectedPrimaryTagIds = [],
    selectedSecondaryTagIds,
    onChange,
    onChangePrimary,
    isLoading = false,
}) => {
    const { isDarkMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPrimaryIds, setSelectedPrimaryIds] = useState<string[]>(selectedPrimaryTagIds);
    const ref = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ top: 0, right: 0, width: 0 });

    // Sync local state when prop changes (handles external resets like clearing form)
    useEffect(() => {
        setSelectedPrimaryIds(prev => {
        const isDifferent =
                prev.length !== selectedPrimaryTagIds.length ||
                !prev.every(id => selectedPrimaryTagIds.includes(id));

            return isDifferent ? selectedPrimaryTagIds : prev;
        });
    }, [selectedPrimaryTagIds]);

    // Unique ID for this dropdown instance to prevent collisions
    const dropdownId = React.useId();
    const dropdownElementId = `tags-dropdown-${dropdownId}`;

    // Get selected secondary tags
    const selectedSecondaryTags = secondaryTags.filter((t) =>
        selectedSecondaryTagIds.includes(t.id)
    );

    // Get primary tags that have selected secondary tags
    const activePrimaryIds = useMemo(() => {
        const primaryIds = new Set<string>();
        selectedSecondaryTags.forEach((st) => {
            primaryIds.add(st.primaryTagId);
        });
        return Array.from(primaryIds);
    }, [selectedSecondaryTags]);

    // Get standalone primary tags
    const standalonePrimaryTags = useMemo(() => {
        return primaryTags.filter(
            (pt) =>
                selectedPrimaryIds.includes(pt.id) && !activePrimaryIds.includes(pt.id)
        );
    }, [primaryTags, selectedPrimaryIds, activePrimaryIds]);

    // Check if we have any tags to display
    const hasAnyTagsSelected =
        standalonePrimaryTags.length > 0 || selectedSecondaryTags.length > 0;

    // Auto-select primary tags that have selected secondary tags
    // Call onChangePrimary directly when adding new primary tags
    useEffect(() => {
        if (activePrimaryIds.length > 0) {
            // Check if all activePrimaryIds are already selected
            const allAlreadyIncluded = activePrimaryIds.every(id => selectedPrimaryIds.includes(id));
            if (!allAlreadyIncluded) {
                const newIds = [...new Set([...selectedPrimaryIds, ...activePrimaryIds])];
                setSelectedPrimaryIds(newIds);
                // Directly notify parent of the change
                onChangePrimary?.(newIds);
            }
        }
    }, [activePrimaryIds]); // eslint-disable-line react-hooks/exhaustive-deps
    // Note: We intentionally exclude selectedPrimaryIds and onChangePrimary from deps
    // to avoid loops. This effect only reacts to secondary tag selection changes.

    // Filter secondary tags by selected primary tags
    const filteredSecondaryTags = useMemo(() => {
        if (selectedPrimaryIds.length === 0) return [];
        return secondaryTags.filter((st) =>
            selectedPrimaryIds.includes(st.primaryTagId)
        );
    }, [secondaryTags, selectedPrimaryIds]);

    // Group secondary tags by primary tag
    const groupedSecondaryTags = useMemo(() => {
        const grouped: Record<string, SecondaryTagData[]> = {};
        filteredSecondaryTags.forEach((st) => {
            if (!grouped[st.primaryTagId]) {
                grouped[st.primaryTagId] = [];
            }
            grouped[st.primaryTagId].push(st);
        });
        return grouped;
    }, [filteredSecondaryTags]);

    // Toggle primary tag details
    const togglePrimaryTag = (primaryId: string) => {
        const isSelected = selectedPrimaryIds.includes(primaryId);
        if (isSelected) {
            const secondaryIdsToRemove = secondaryTags
                .filter((st) => st.primaryTagId === primaryId)
                .map((st) => st.id);
            const newPrimaryIds = selectedPrimaryIds.filter((id) => id !== primaryId);
            setSelectedPrimaryIds(newPrimaryIds);
            onChangePrimary?.(newPrimaryIds);
            onChange(
                selectedSecondaryTagIds.filter((id) => !secondaryIdsToRemove.includes(id))
            );
        } else {
            const newPrimaryIds = [...selectedPrimaryIds, primaryId];
            setSelectedPrimaryIds(newPrimaryIds);
            onChangePrimary?.(newPrimaryIds);
        }
    };

    const toggleSecondaryTag = (tagId: string) => {
        if (selectedSecondaryTagIds.includes(tagId)) {
            onChange(selectedSecondaryTagIds.filter((id) => id !== tagId));
        } else {
            onChange([...selectedSecondaryTagIds, tagId]);
        }
    };

    const removeSecondaryTag = (tagId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedSecondaryTagIds.filter((id) => id !== tagId));
    };

    const removePrimaryTag = (primaryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newPrimaryIds = selectedPrimaryIds.filter((id) => id !== primaryId);
        setSelectedPrimaryIds(newPrimaryIds);
        onChangePrimary?.(newPrimaryIds);
    };

    const getPrimaryTag = (primaryId: string): PrimaryTagData | undefined => {
        return primaryTags.find((pt) => pt.id === primaryId);
    };

    // Calculate position
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
                width: rect.width,
            });
        }
    }, [isOpen]);

    // Handle scroll/resize
    useEffect(() => {
        const handleScrollOrResize = (e: Event) => {
            // If resizing window, close
            if (e.type === "resize") {
                setIsOpen(false);
                return;
            }

            // If scrolling
            if (e.type === "scroll" && isOpen) {
                const target = e.target as HTMLElement;
                const dropdownEl = document.getElementById(dropdownElementId);

                // If scrolling INSIDE the dropdown, don't close
                if (dropdownEl && dropdownEl.contains(target)) {
                    return;
                }

                // If scrolling outside (e.g. main window or modal background), close
                setIsOpen(false);
            }
        };

        window.addEventListener("scroll", handleScrollOrResize, true);
        window.addEventListener("resize", handleScrollOrResize);
        return () => {
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [isOpen, dropdownElementId]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const dropdownEl = document.getElementById(dropdownElementId);
            if (
                ref.current &&
                !ref.current.contains(target) &&
                dropdownEl &&
                !dropdownEl.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, dropdownElementId]);

    return (
        <div ref={ref} className="relative">
            <label
                className={`
          block text-sm lg:text-base font-medium mb-1.5
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
            >
                תגיות
            </label>

            {/* Trigger */}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full min-h-10 lg:min-h-11 flex items-center justify-between gap-2
          px-3 py-2
          rounded-xl border-2
          text-sm lg:text-base
          transition-all duration-200
          ${isDarkMode
                        ? "bg-slate-700/50 border-slate-600 hover:border-slate-500"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }
          ${isOpen
                        ? isDarkMode
                            ? "border-blue-500 ring-2 ring-blue-500/20"
                            : "border-blue-500 ring-2 ring-blue-500/20"
                        : ""
                    }
        `}
            >
                <ChevronDown
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        } ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                />

                <div className={`flex-1 flex flex-wrap gap-1.5 justify-start max-h-[32px] overflow-y-auto scrollbar-hide`}>
                    {!hasAnyTagsSelected ? (
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-400"}>
                            בחר תגיות...
                        </span>
                    ) : (
                        <>
                            {standalonePrimaryTags.map((pt) => (
                                <PrimaryTagChip
                                    key={`primary-${pt.id}`}
                                    tag={pt}
                                    onRemove={(e) => removePrimaryTag(pt.id, e)}
                                />
                            ))}
                            {selectedSecondaryTags.map((tag) => (
                                <SecondaryTagChip
                                    key={tag.id}
                                    tag={tag}
                                    primaryTag={getPrimaryTag(tag.primaryTagId)}
                                    onRemove={(e) => removeSecondaryTag(tag.id, e)}
                                />
                            ))}
                        </>
                    )}
                </div>
            </button>

            {/* Portal Dropdown */}
            {isOpen && createPortal(
                <div
                    id={dropdownElementId}
                    className={`
            fixed z-[99999]

            max-h-72 overflow-y-auto scrollbar-hide
            rounded-xl border-2 shadow-xl
            ${isDarkMode
                            ? "bg-slate-800 border-slate-600"
                            : "bg-white border-slate-200"
                        }
          `}
                    style={{
                        top: position.top,
                        right: position.right,
                        width: position.width,
                    }}
                    dir="rtl"
                >
                    <TagDropdownContent
                        primaryTags={primaryTags}
                        secondaryTags={secondaryTags}
                        selectedPrimaryIds={selectedPrimaryIds}
                        selectedSecondaryTagIds={selectedSecondaryTagIds}
                        groupedSecondaryTags={groupedSecondaryTags}
                        onTogglePrimary={togglePrimaryTag}
                        onToggleSecondary={toggleSecondaryTag}
                        isLoading={isLoading}
                    />
                </div>,
                document.body
            )}
        </div>
    );
};

export default TwoTierTagsSelect;
