import React from "react";
import { AVAILABLE_COLORS } from "../../../../schemas/userTypes";
import { useTheme } from "../../../../contexts";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  selectedColor,
  onColorChange,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-2">
      <label
        className={`block text-sm font-medium text-right ${
          isDarkMode ? "text-slate-300" : "text-slate-700"
        }`}
      >
        צבע פרופיל
      </label>
      <div className="flex flex-wrap gap-2 justify-end">
        {AVAILABLE_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorChange(color)}
            className={`
              w-8 h-8 rounded-full transition-transform hover:scale-110
              ${
                selectedColor === color
                  ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                  : ""
              }
              ${
                isDarkMode && selectedColor === color
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
