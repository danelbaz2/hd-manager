import React, { useState } from "react";
import { Tag, Layers, Loader2, Trash2, Pencil, ChevronDown } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSettings } from "../../../contexts/SettingsContext";
import {
    type PrimaryTagData,
    type PrimaryTagFormData,
    type SecondaryTagData,
    type SecondaryTagFormData,
    PRIMARY_TAG_COLORS,
    TAG_COLORS,
    DEFAULT_PRIMARY_TAG_FORM,
    DEFAULT_SECONDARY_TAG_FORM,
    getTextColor,
    getLighterColor,
} from "../../../schemas/tagTypes";
import {
    createPrimaryTag,
    updatePrimaryTag,
    deletePrimaryTag,
} from "../../../api/primaryTagsApi";
import {
    createSecondaryTag,
    updateSecondaryTag,
    deleteSecondaryTag,
} from "../../../api/secondaryTagsApi";
import { darkenColor, hexWithAlpha } from "../../../utils/colorUtils";
import { ToastContainer, useToast } from "../../alert-feedback";
import DelayedLoader from "../../delay-loader";
import DeleteConfirmModal from "../../delete-confirm-modal";

type TagMode = "primary" | "secondary";

const ManageTagsTwoTier: React.FC = () => {
    const { isDarkMode } = useTheme();
    const { primaryTags, secondaryTags, isLoadingTags, refreshTags } = useSettings();
    const { alerts, showSuccess, showError, showWarning, dismissAlert } = useToast();

    // Mode toggle (Primary or Secondary)
    const [mode, setMode] = useState<TagMode>("primary");

    // Primary tag form state
    const [primaryFormData, setPrimaryFormData] = useState<PrimaryTagFormData>(DEFAULT_PRIMARY_TAG_FORM);
    const [editingPrimaryId, setEditingPrimaryId] = useState<string | null>(null);
    const [isSavingPrimary, setIsSavingPrimary] = useState(false);

    // Secondary tag form state
    const [secondaryFormData, setSecondaryFormData] = useState<SecondaryTagFormData>(DEFAULT_SECONDARY_TAG_FORM);
    const [editingSecondaryId, setEditingSecondaryId] = useState<string | null>(null);
    const [isSavingSecondary, setIsSavingSecondary] = useState(false);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<{ type: TagMode; tag: PrimaryTagData | SecondaryTagData } | null>(null);

    // ===== Primary Tag Handlers =====
    const handleSubmitPrimary = async () => {
        if (!primaryFormData.name || primaryFormData.name.length < 1) {
            showWarning("שגיאת אימות", "שם הקטגוריה חייב להכיל לפחות תו אחד");
            return;
        }

        setIsSavingPrimary(true);
        try {
            if (editingPrimaryId) {
                const response = await updatePrimaryTag(editingPrimaryId, {
                    name: primaryFormData.name.trim(),
                    color: primaryFormData.color,
                    description: primaryFormData.description,
                });
                if (response.success) {
                    showSuccess("הצלחה", "הקטגוריה עודכנה בהצלחה");
                    handleCancelPrimaryEdit();
                    refreshTags();
                } else {
                    showError("שגיאה", response.error || "שגיאה בעדכון הקטגוריה");
                }
            } else {
                const response = await createPrimaryTag({
                    name: primaryFormData.name.trim(),
                    color: primaryFormData.color,
                    description: primaryFormData.description,
                });
                if (response.success) {
                    showSuccess("הצלחה", "הקטגוריה נוספה בהצלחה");
                    setPrimaryFormData(DEFAULT_PRIMARY_TAG_FORM);
                    refreshTags();
                } else {
                    showError("שגיאה", response.error || "שגיאה ביצירת הקטגוריה");
                }
            }
        } catch (error) {
            console.error("Error saving primary tag:", error);
            showError("שגיאה", "אירעה שגיאה בלתי צפויה");
        } finally {
            setIsSavingPrimary(false);
        }
    };

    const handleEditPrimary = (tag: PrimaryTagData) => {
        setPrimaryFormData({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            description: tag.description,
        });
        setEditingPrimaryId(tag.id);
    };

    const handleCancelPrimaryEdit = () => {
        setEditingPrimaryId(null);
        setPrimaryFormData(DEFAULT_PRIMARY_TAG_FORM);
    };

    const handleDeletePrimary = async () => {
        if (!deleteTarget || deleteTarget.type !== "primary") return;
        try {
            const response = await deletePrimaryTag(deleteTarget.tag.id);
            if (response.success) {
                showSuccess("הצלחה", "הקטגוריה נמחקה בהצלחה");
                if (editingPrimaryId === deleteTarget.tag.id) handleCancelPrimaryEdit();
                refreshTags();
            } else {
                showError("שגיאה", response.error || "לא ניתן למחוק קטגוריה עם תגיות משניות");
            }
        } catch (error) {
            console.error("Error deleting primary tag:", error);
            showError("שגיאה", "אירעה שגיאה בלתי צפויה");
        }
        setDeleteTarget(null);
    };

    // ===== Secondary Tag Handlers =====
    const handleSubmitSecondary = async () => {
        if (!secondaryFormData.name || secondaryFormData.name.length < 1) {
            showWarning("שגיאת אימות", "שם התגית חייב להכיל לפחות תו אחד");
            return;
        }
        if (!secondaryFormData.primaryTagId) {
            showWarning("שגיאת אימות", "יש לבחור קטגוריה ראשית");
            return;
        }

        setIsSavingSecondary(true);
        try {
            if (editingSecondaryId) {
                const response = await updateSecondaryTag(editingSecondaryId, {
                    name: secondaryFormData.name.trim(),
                    primaryTagId: secondaryFormData.primaryTagId,
                    description: secondaryFormData.description,
                });
                if (response.success) {
                    showSuccess("הצלחה", "התגית עודכנה בהצלחה");
                    handleCancelSecondaryEdit();
                    refreshTags();
                } else {
                    showError("שגיאה", response.error || "שגיאה בעדכון התגית");
                }
            } else {
                const response = await createSecondaryTag({
                    name: secondaryFormData.name.trim(),
                    primaryTagId: secondaryFormData.primaryTagId,
                    description: secondaryFormData.description,
                });
                if (response.success) {
                    showSuccess("הצלחה", "התגית נוספה בהצלחה");
                    setSecondaryFormData(DEFAULT_SECONDARY_TAG_FORM);
                    refreshTags();
                } else {
                    showError("שגיאה", response.error || "שגיאה ביצירת התגית");
                }
            }
        } catch (error) {
            console.error("Error saving secondary tag:", error);
            showError("שגיאה", "אירעה שגיאה בלתי צפויה");
        } finally {
            setIsSavingSecondary(false);
        }
    };

    const handleEditSecondary = (tag: SecondaryTagData) => {
        setSecondaryFormData({
            id: tag.id,
            name: tag.name,
            primaryTagId: tag.primaryTagId,
            description: tag.description,
        });
        setEditingSecondaryId(tag.id);
    };

    const handleCancelSecondaryEdit = () => {
        setEditingSecondaryId(null);
        setSecondaryFormData(DEFAULT_SECONDARY_TAG_FORM);
    };

    const handleDeleteSecondary = async () => {
        if (!deleteTarget || deleteTarget.type !== "secondary") return;
        try {
            const response = await deleteSecondaryTag(deleteTarget.tag.id);
            if (response.success) {
                showSuccess("הצלחה", "התגית נמחקה בהצלחה");
                if (editingSecondaryId === deleteTarget.tag.id) handleCancelSecondaryEdit();
                refreshTags();
            } else {
                showError("שגיאה", response.error || "שגיאה במחיקת התגית");
            }
        } catch (error) {
            console.error("Error deleting secondary tag:", error);
            showError("שגיאה", "אירעה שגיאה בלתי צפויה");
        }
        setDeleteTarget(null);
    };

    // Get primary tag by ID
    const getPrimaryById = (id: string) => primaryTags.find((pt) => pt.id === id);

    // Current color for form styling
    const formColor = mode === "primary"
        ? primaryFormData.color
        : (getPrimaryById(secondaryFormData.primaryTagId)?.color || TAG_COLORS[0].bg);

    const isEditing = mode === "primary" ? editingPrimaryId !== null : editingSecondaryId !== null;
    const isSaving = mode === "primary" ? isSavingPrimary : isSavingSecondary;

    return (
        <div className="flex-1 flex flex-col p-8 overflow-hidden">
            {/* Toast Notifications */}
            <ToastContainer alerts={alerts} onDismiss={dismissAlert} isDarkMode={isDarkMode} />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                isOpen={deleteTarget !== null}
                title={deleteTarget?.type === "primary" ? "מחיקת קטגוריה" : "מחיקת תגית"}
                text={
                    <>
                        האם אתה בטוח שברצונך למחוק את {deleteTarget?.type === "primary" ? "הקטגוריה" : "התגית"}
                        <span className="font-semibold"> {deleteTarget?.tag?.name}</span>?
                    </>
                }
                isDarkMode={isDarkMode}
                onConfirm={deleteTarget?.type === "primary" ? handleDeletePrimary : handleDeleteSecondary}
                onCancel={() => setDeleteTarget(null)}
            />

            {/* Header */}
            <h1 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                ניהול תגיות משימה
            </h1>

            {/* Mode Toggle - RTL: Primary on Right */}
            <div className="flex justify-center gap-2 mb-6" dir="rtl">
                <button
                    onClick={() => { setMode("primary"); handleCancelSecondaryEdit(); }}
                    className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                        ${mode === "primary"
                            ? "bg-blue-500 text-white shadow-lg"
                            : isDarkMode
                                ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        }
                    `}
                >
                    <Tag size={16} />
                    קטגוריות ראשיות
                </button>
                <button
                    onClick={() => { setMode("secondary"); handleCancelPrimaryEdit(); }}
                    className={`
                        flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                        ${mode === "secondary"
                            ? "bg-blue-500 text-white shadow-lg"
                            : isDarkMode
                                ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                        }
                    `}
                >
                    <Layers size={16} />
                    תגיות משניות
                </button>
            </div>

            {/* Add/Edit Form - Original Design */}
            <div
                className="rounded-xl border mb-6 overflow-hidden transition-colors duration-300"
                style={{
                    backgroundColor: hexWithAlpha(formColor, isDarkMode ? 0.1 : 0.08),
                    borderColor: hexWithAlpha(formColor, isDarkMode ? 0.3 : 0.25),
                }}
            >
                {/* Color Banner */}
                <div
                    className="h-2 w-full transition-colors duration-300"
                    style={{ backgroundColor: darkenColor(formColor, 20) }}
                />

                <div className="p-6">
                    <div className="flex items-center justify-end gap-2 mb-4">
                        <span className={`font-medium ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}>
                            {isEditing
                                ? (mode === "primary" ? "עריכת קטגוריה" : "עריכת תגית")
                                : (mode === "primary" ? "הוספת קטגוריה חדשה" : "הוספת תגית חדשה")
                            }
                        </span>
                        {mode === "primary" ? <Tag size={18} className="text-slate-400" /> : <Layers size={18} className="text-slate-400" />}
                    </div>

                    <div className="flex flex-wrap items-center gap-4" dir="rtl">
                        {/* Primary: Category Selector (only for secondary) */}
                        {mode === "secondary" && (
                            <div className="relative min-w-[160px]">
                                <select
                                    value={secondaryFormData.primaryTagId}
                                    onChange={(e) => setSecondaryFormData({ ...secondaryFormData, primaryTagId: e.target.value })}
                                    disabled={isSaving}
                                    dir="rtl"
                                    className={`
                                        w-full px-4 py-2.5 pl-10 rounded-lg border text-right appearance-none cursor-pointer
                                        text-sm font-medium
                                        transition-colors
                                        ${isDarkMode
                                            ? "bg-slate-700 border-slate-600 text-white"
                                            : "bg-white border-slate-300 text-slate-800"
                                        }
                                        focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                        disabled:opacity-50 disabled:cursor-not-allowed
                                    `}
                                >
                                    <option value="">בחר קטגוריה</option>
                                    {primaryTags.map((pt) => (
                                        <option key={pt.id} value={pt.id}>{pt.name}</option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={18}
                                    className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                                />
                            </div>
                        )}

                        {/* Name Input */}
                        <input
                            type="text"
                            placeholder={mode === "primary" ? "שם הקטגוריה" : "שם התגית"}
                            value={mode === "primary" ? primaryFormData.name : secondaryFormData.name}
                            onChange={(e) => {
                                if (mode === "primary") {
                                    setPrimaryFormData({ ...primaryFormData, name: e.target.value });
                                } else {
                                    setSecondaryFormData({ ...secondaryFormData, name: e.target.value });
                                }
                            }}
                            disabled={isSaving}
                            className={`
                                flex-1 min-w-[180px] px-4 py-2.5
                                rounded-lg border text-right text-sm
                                transition-colors
                                ${isDarkMode
                                    ? "bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                                    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400"
                                }
                                focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500
                                disabled:opacity-50 disabled:cursor-not-allowed
                            `}
                        />

                        {/* Color Selection (only for primary) */}
                        {mode === "primary" && (
                            <div className="flex items-center gap-1.5">
                                {PRIMARY_TAG_COLORS.map((color) => (
                                    <button
                                        key={color.bg}
                                        onClick={() => setPrimaryFormData({ ...primaryFormData, color: color.bg })}
                                        disabled={isSaving}
                                        className={`
                      w-6 h-6 rounded-full transition-transform
                      ${primaryFormData.color === color.bg
                                                ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                                                : ""
                                            }
                      ${isDarkMode && primaryFormData.color === color.bg
                                                ? "ring-offset-slate-700"
                                                : ""
                                            }
                    `}
                                        style={{ backgroundColor: color.bg }}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Cancel Button (when editing) */}
                        {isEditing && (
                            <button
                                onClick={mode === "primary" ? handleCancelPrimaryEdit : handleCancelSecondaryEdit}
                                disabled={isSaving}
                                className={`
                  px-4 py-2.5 rounded-lg font-medium transition-colors
                  ${isDarkMode
                                        ? "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                    }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                            >
                                ביטול
                            </button>
                        )}

                        {/* Submit Button */}
                        <button
                            onClick={mode === "primary" ? handleSubmitPrimary : handleSubmitSecondary}
                            disabled={isSaving}
                            className={`
                flex items-center gap-2
                px-6 py-2.5 rounded-lg
                bg-blue-500 hover:bg-blue-600
                text-white font-medium
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
                        >
                            {isSaving ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : mode === "primary" ? (
                                <Tag size={18} />
                            ) : (
                                <Layers size={18} />
                            )}
                            <span>{isSaving ? "שומר..." : isEditing ? "עדכן" : "הוסף"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Tags List - Original Card Design */}
            <DelayedLoader isLoading={isLoadingTags} delay={300}>
                {mode === "primary" ? (
                    // Primary Tags Grid
                    primaryTags.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center py-12">
                            <p className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                אין קטגוריות להצגה
                            </p>
                        </div>
                    ) : (
                        <div className={`flex-1 overflow-y-auto ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}>
                            <div className="grid grid-cols-2 gap-3">
                                {primaryTags.map((tag) => {
                                    const isTagEditing = editingPrimaryId === tag.id;
                                    const childCount = secondaryTags.filter((st) => st.primaryTagId === tag.id).length;

                                    return (
                                        <TagCard
                                            key={tag.id}
                                            color={tag.color}
                                            name={tag.name}
                                            badge={
                                                <span className={`text-xs ${isDarkMode ? "text-slate-300" : "text-slate-500"}`}>({childCount} תגיות)</span>
                                            }
                                            isEditing={isTagEditing}
                                            isDarkMode={isDarkMode}
                                            onEdit={() => handleEditPrimary(tag)}
                                            onCancelEdit={handleCancelPrimaryEdit}
                                            onDeleteRequest={() => setDeleteTarget({ type: "primary", tag })}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                ) : (
                    // Secondary Tags Grid
                    secondaryTags.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center py-12">
                            <p className={`text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                                אין תגיות להצגה
                            </p>
                        </div>
                    ) : (
                        <div className={`flex-1 overflow-y-auto ${isDarkMode ? "dark-scrollbar" : "light-scrollbar"}`}>
                            <div className="grid grid-cols-2 gap-3">
                                {secondaryTags.map((tag) => {
                                    const isTagEditing = editingSecondaryId === tag.id;
                                    const parentTag = getPrimaryById(tag.primaryTagId);
                                    const displayColor = parentTag ? getLighterColor(parentTag.color) : TAG_COLORS[0].bg;

                                    return (
                                        <TagCard
                                            key={tag.id}
                                            color={displayColor}
                                            name={tag.name}
                                            badge={
                                                parentTag && (
                                                    <span
                                                        className="text-xs px-2 py-0.5 rounded font-medium"
                                                        style={{
                                                            backgroundColor: hexWithAlpha(parentTag.color, isDarkMode ? 0.3 : 0.15),
                                                            color: isDarkMode ? getLighterColor(parentTag.color) : darkenColor(parentTag.color, 20)
                                                        }}
                                                    >
                                                        {parentTag.name}
                                                    </span>
                                                )
                                            }
                                            isEditing={isTagEditing}
                                            isDarkMode={isDarkMode}
                                            onEdit={() => handleEditSecondary(tag)}
                                            onCancelEdit={handleCancelSecondaryEdit}
                                            onDeleteRequest={() => setDeleteTarget({ type: "secondary", tag })}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )
                )}
            </DelayedLoader>
        </div>
    );
};

// ===== Tag Card Component (matching original design) =====
interface TagCardProps {
    color: string;
    name: string;
    badge?: React.ReactNode;
    isEditing: boolean;
    isDarkMode: boolean;
    onEdit: () => void;
    onCancelEdit: () => void;
    onDeleteRequest: () => void;
}

const TagCard: React.FC<TagCardProps> = ({
    color,
    name,
    badge,
    isEditing,
    isDarkMode,
    onEdit,
    onCancelEdit,
    onDeleteRequest,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const bgOpacity = isHovered
        ? isDarkMode ? 0.1 : 0.08
        : isDarkMode ? 0.06 : 0.04;

    const borderOpacity = isEditing
        ? 0.5
        : isHovered
            ? isDarkMode ? 0.3 : 0.25
            : isDarkMode ? 0.2 : 0.15;

    return (
        <div
            className="rounded-xl border overflow-hidden"
            style={{
                backgroundColor: hexWithAlpha(color, bgOpacity),
                borderColor: hexWithAlpha(color, borderOpacity),
                transition: "background-color 400ms ease, border-color 400ms ease",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Color Banner */}
            <div
                className="w-full h-1"
                style={{ backgroundColor: darkenColor(color, 15) }}
            />

            <div className="flex items-center justify-between px-4 py-3">
                {/* Actions */}
                <div className="flex items-center gap-1">
                    <div
                        role="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteRequest(); }}
                        className={`
              p-1.5 rounded-lg transition-colors cursor-pointer
              ${isDarkMode
                                ? "text-red-400 hover:bg-red-900/30"
                                : "text-red-500 hover:bg-red-50"
                            }
            `}
                    >
                        <Trash2 size={16} />
                    </div>
                    <div
                        role="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isEditing) {
                                onCancelEdit();
                            } else {
                                onEdit();
                            }
                        }}
                        className={`
              p-1.5 rounded-lg transition-colors cursor-pointer
              ${isEditing
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                    ? "text-blue-400 hover:bg-blue-900/30"
                                    : "text-blue-500 hover:bg-blue-50"
                            }
            `}
                    >
                        <Pencil size={16} />
                    </div>
                </div>

                {/* Right side: Badge + Tag */}
                <div className="flex items-center gap-3">
                    {badge}
                    <span
                        className="px-4 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                            backgroundColor: color,
                            color: getTextColor(color),
                        }}
                    >
                        {name}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ManageTagsTwoTier;
