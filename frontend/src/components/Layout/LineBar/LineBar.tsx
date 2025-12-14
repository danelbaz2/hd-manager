import React from "react";

interface LineBarProps {
  className?: string;
}

const LineBar: React.FC<LineBarProps> = ({ className }) => {
  return (
    <div
      className={`p-4 bg-gray-100 border-b border-gray-300 ${className || ""}`}
    >
      <p>LineBar Component</p>
    </div>
  );
};

export default LineBar;
