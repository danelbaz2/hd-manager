import React from "react";
import { AVAILABLE_COLORS } from "../../../../schemas/userTypes";
import { useTheme } from "../../../../contexts";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  compact?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
  compact = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={compact ? "" : "space-y-2"}>
      <div className={`flex ${compact ? "gap-1.5 justify-center" : "flex-wrap gap-2 justify-center"}`}>
        {AVAILABLE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`
              ${compact ? "w-5 h-5" : "w-8 h-8"} rounded-full transition-transform hover:scale-110
              ${selectedColor === color
                ? `ring-2 ${compact ? "ring-offset-1" : "ring-offset-2"} ring-blue-500 scale-110`
                : ""
              }
              ${isDarkMode && selectedColor === color
                ? "ring-offset-slate-800"
                : ""
              }
            `}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;

