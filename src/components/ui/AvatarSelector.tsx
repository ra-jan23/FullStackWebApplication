"use client";

import React from "react";
import { Check } from "lucide-react";
import { AVATAR_OPTIONS, type AvatarOption } from "@/lib/avatars";

interface AvatarSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: "w-9 h-9",
  md: "w-12 h-12",
  lg: "w-14 h-14",
};

const iconSizeMap = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

function AvatarCircle({ option, size }: { option: AvatarOption; size: "sm" | "md" | "lg" }) {
  const Icon = option.icon;
  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-gradient-to-br ${option.from} ${option.to} flex items-center justify-center text-white shadow-sm`}
    >
      <Icon className={iconSizeMap[size]} strokeWidth={2.2} />
    </div>
  );
}

export default function AvatarSelector({ selectedId, onSelect, size = "md" }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
      {AVATAR_OPTIONS.map((option) => {
        const isSelected = selectedId === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option.id)}
            className="relative group flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all duration-200 hover:bg-muted/60"
            title={option.label}
          >
            <div
              className={`relative transition-transform duration-200 group-hover:scale-110 ${
                isSelected ? "scale-110" : ""
              }`}
            >
              <AvatarCircle option={option} size={size} />
              {/* Selection ring */}
              <div
                className={`absolute inset-0 rounded-full ring-2 ring-background transition-all duration-200 ${
                  isSelected
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    : ""
                }`}
              />
              {/* Check badge */}
              {isSelected && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md animate-scale-in">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              )}
            </div>
            {size !== "sm" && (
              <span
                className={`text-[10px] font-medium truncate w-full text-center leading-tight ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {option.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
