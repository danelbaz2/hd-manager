import React from "react";

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  isDarkMode: boolean;
  isDisabled?: boolean;
  onColorChange: (color: string) => void;
}

/**
 * ColorPicker - Color selection buttons for user color assignment
 */
const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  isDarkMode,
  isDisabled = false,
  onColorChange,
}) => {
  return (
    <div className="flex items-center gap-1">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onColorChange(color)}
          disabled={isDisabled}
          className={`
            w-6 h-6 rounded-full transition-transform
            ${
              selectedColor === color
                ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                : ""
            }
            ${
              isDarkMode && selectedColor === color
                ? "ring-offset-slate-700"
                : ""
            }
          `}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
};

export default ColorPicker;
