import React from "react";
import { X } from "lucide-react";
import { type PrimaryTagData, getTextColor } from "../../../../schemas/tagTypes";

interface PrimaryTagChipProps {
    tag: PrimaryTagData;
    onRemove: (e: React.MouseEvent) => void;
}

/**
 * Chip component for displaying a selected primary tag
 */
const PrimaryTagChip: React.FC<PrimaryTagChipProps> = ({ tag, onRemove }) => {
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
                backgroundColor: tag.color,
                color: getTextColor(tag.color),
            }}
        >
            {tag.name}
            <button
                type="button"
                onClick={onRemove}
                className="hover:opacity-70 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
};

export default PrimaryTagChip;
