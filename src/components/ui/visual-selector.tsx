import * as React from "react";
import { cn } from "@/lib/utils";

interface VisualSelectorOption {
  value: string;
  image: string;
  label: string;
}

interface VisualSelectorProps {
  options: VisualSelectorOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  columns?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VisualSelector({
  options,
  value,
  onChange,
  multiple = false,
  columns = 3,
  size = "md",
  className,
}: VisualSelectorProps) {
  const [selectedValues, setSelectedValues] = React.useState<string[]>(
    multiple
      ? (Array.isArray(value) ? value : value ? [value] : [])
      : (value && !Array.isArray(value) ? [value] : [])
  );

  const handleSelect = (optionValue: string) => {
    let newValues: string[];

    if (multiple) {
      // Toggle selection for multiple mode
      if (selectedValues.includes(optionValue)) {
        newValues = selectedValues.filter(v => v !== optionValue);
      } else {
        newValues = [...selectedValues, optionValue];
      }
    } else {
      // Single selection mode
      newValues = [optionValue];
    }

    setSelectedValues(newValues);

    if (onChange) {
      onChange(multiple ? newValues : newValues[0] || "");
    }
  };

  // Calculate size class based on the size prop
  const sizeClass = React.useMemo(() => {
    switch (size) {
      case "sm": return "h-16 w-16";
      case "lg": return "h-32 w-32";
      case "md":
      default: return "h-24 w-24";
    }
  }, [size]);

  // Calculate grid columns class
  const gridClass = React.useMemo(() => {
    return `grid-cols-${Math.min(columns, 6)}`;
  }, [columns]);

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("grid gap-4", gridClass)}>
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              "flex flex-col items-center justify-center cursor-pointer p-2 rounded-md transition-all",
              "border-2 hover:border-primary",
              selectedValues.includes(option.value)
                ? "border-primary bg-primary/10"
                : "border-muted"
            )}
            onClick={() => handleSelect(option.value)}
          >
            <div className={cn("relative overflow-hidden rounded-md mb-2", sizeClass)}>
              <img
                src={option.image}
                alt={option.label}
                className="object-cover w-full h-full"
              />
            </div>
            <span className="text-sm font-medium text-center">{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 