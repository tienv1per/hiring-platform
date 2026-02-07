"use client";

import { Check } from "lucide-react";
import { SKILL_COLORS, type SkillColor } from "@/lib/skill-colors";

interface ColorPickerProps {
  value?: string;
  onChange: (color: SkillColor) => void;
}

export function ColorPicker({ value = "gray", onChange }: ColorPickerProps) {
  const colors: SkillColor[] = [
    "gray",
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "teal",
    "indigo",
    "lime",
    "rose",
    "amber",
  ];

  return (
    <div className="grid grid-cols-7 gap-2 p-3">
      {colors.map((color) => {
        const colorClasses = SKILL_COLORS[color];
        const isSelected = color === value;

        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`
              relative w-8 h-8 rounded-md transition-all
              ${colorClasses.bg}
              hover:scale-110 hover:shadow-md
              ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
            `}
            title={color.charAt(0).toUpperCase() + color.slice(1)}
          >
            {isSelected && (
              <Check className={`w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${colorClasses.text}`} />
            )}
          </button>
        );
      })}
    </div>
  );
}
