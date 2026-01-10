import React from "react";
import { X } from "lucide-react";
import {
    type SecondaryTagData,
    type PrimaryTagData,
    getLighterColor,
    getTextColor,
} from "../../../../../schemas/tagTypes";

interface SecondaryTagChipProps {
    tag: SecondaryTagData;
    primaryTag?: PrimaryTagData;
    onRemove: (e: React.MouseEvent) => void;
}

/**
 * Chip component for displaying a selected secondary tag
 */
const SecondaryTagChip: React.FC<SecondaryTagChipProps> = ({
    tag,
    primaryTag,
    onRemove,
}) => {
    const lightColor = primaryTag ? getLighterColor(primaryTag.color) : "#93C5FD";

    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold"
            style={{
                backgroundColor: lightColor,
                color: getTextColor(lightColor),
            }}
        >
            {tag.name}
            <span
                role="button"
                tabIndex={0}
                onClick={onRemove}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRemove(e as unknown as React.MouseEvent); }}
                className="hover:opacity-70 transition-opacity cursor-pointer"
            >
                <X className="w-3 h-3" />
            </span>
        </span>
    );
};

export default SecondaryTagChip;
