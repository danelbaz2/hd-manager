import React, { useState, useRef, useEffect, useMemo } from "react";
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
    selectedPrimaryTagIds?: string[];  // Optional: for loading existing primary tags
    selectedSecondaryTagIds: string[];
    onChange: (secondaryTagIds: string[]) => void;
    onChangePrimary?: (primaryTagIds: string[]) => void;  // Optional: for saving primary tags
    isLoading?: boolean;
}

/**
 * Two-Tier Tag Selection Component
 *
 * Flow:
 * 1. User selects Primary Tags (categories like DB, APP, NETWORK)
 * 2. If no secondary tags are chosen, the primary tag is displayed
 * 3. When secondary tags are selected, they replace the primary tag display
 * 4. Both Primary and Secondary Tag IDs can be stored on the task
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

    // Get standalone primary tags (selected but no secondary tags from them are chosen)
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
    useEffect(() => {
        if (activePrimaryIds.length > 0) {
            setSelectedPrimaryIds((prev) => {
                const newIds = [...new Set([...prev, ...activePrimaryIds])];
                return newIds;
            });
        }
    }, [activePrimaryIds]);

    // Propagate primary tag selection changes to parent
    useEffect(() => {
        if (onChangePrimary) {
            onChangePrimary(selectedPrimaryIds);
        }
    }, [selectedPrimaryIds, onChangePrimary]);

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

    // Toggle primary tag selection
    const togglePrimaryTag = (primaryId: string) => {
        const isSelected = selectedPrimaryIds.includes(primaryId);
        if (isSelected) {
            // Remove primary and its secondary tags
            const secondaryIdsToRemove = secondaryTags
                .filter((st) => st.primaryTagId === primaryId)
                .map((st) => st.id);
            setSelectedPrimaryIds((prev) => prev.filter((id) => id !== primaryId));
            onChange(
                selectedSecondaryTagIds.filter((id) => !secondaryIdsToRemove.includes(id))
            );
        } else {
            setSelectedPrimaryIds((prev) => [...prev, primaryId]);
        }
    };

    // Toggle secondary tag selection
    const toggleSecondaryTag = (tagId: string) => {
        if (selectedSecondaryTagIds.includes(tagId)) {
            onChange(selectedSecondaryTagIds.filter((id) => id !== tagId));
        } else {
            onChange([...selectedSecondaryTagIds, tagId]);
        }
    };

    // Remove a secondary tag
    const removeSecondaryTag = (tagId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selectedSecondaryTagIds.filter((id) => id !== tagId));
    };

    // Remove a standalone primary tag (deselects it)
    const removePrimaryTag = (primaryId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedPrimaryIds((prev) => prev.filter((id) => id !== primaryId));
    };

    // Get primary tag by ID
    const getPrimaryTag = (primaryId: string): PrimaryTagData | undefined => {
        return primaryTags.find((pt) => pt.id === primaryId);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div ref={ref} className="relative">
            <label
                className={`
          block text-sm lg:text-base font-medium mb-2
          ${isDarkMode ? "text-slate-300" : "text-slate-700"}
        `}
            >
                תגיות
            </label>

            {/* Selected Tags Display / Dropdown Trigger */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
          w-full min-h-[48px] flex items-center justify-between gap-2
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

                <div className="flex-1 flex flex-wrap gap-1.5 justify-end">
                    {!hasAnyTagsSelected ? (
                        <span className={isDarkMode ? "text-slate-400" : "text-slate-400"}>
                            בחר תגיות...
                        </span>
                    ) : (
                        <>
                            {/* Standalone Primary Tags */}
                            {standalonePrimaryTags.map((pt) => (
                                <PrimaryTagChip
                                    key={`primary-${pt.id}`}
                                    tag={pt}
                                    onRemove={(e) => removePrimaryTag(pt.id, e)}
                                />
                            ))}
                            {/* Secondary Tags */}
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

            {/* Dropdown */}
            {isOpen && (
                <div
                    className={`
            absolute top-full mt-2 right-0 left-0 z-30
            max-h-72 overflow-y-auto
            ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}
            rounded-xl border-2 shadow-xl
            ${isDarkMode
                            ? "bg-slate-800 border-slate-600"
                            : "bg-white border-slate-200"
                        }
          `}
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
                </div>
            )}
        </div>
    );
};

export default TwoTierTagsSelect;
