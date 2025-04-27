import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface RangeSliderWithLabelsProps {
  min: number;
  max: number;
  step: number;
  labels: string[];
  defaultValue?: number[];
  onValueChange?: (values: number[]) => void;
  className?: string;
}

export function RangeSliderWithLabels({
  min,
  max,
  step,
  labels,
  defaultValue = [min],
  onValueChange,
  className,
}: RangeSliderWithLabelsProps) {
  // Ensure we have at least 2 labels (one for min, one for max)
  if (labels.length < 2) {
    console.warn("RangeSliderWithLabels should have at least 2 labels");
    labels = labels.length === 1 ? [labels[0], labels[0]] : ["Min", "Max"];
  }

  // Calculate label positions based on step values
  const stepsCount = (max - min) / step;
  const labelPositions: { position: string; label: string }[] = [];

  // Create label position markers
  // If number of labels matches the step count + 1 (including min and max),
  // place them at each step; otherwise, distribute evenly
  if (labels.length === stepsCount + 1) {
    labels.forEach((label, index) => {
      const position = `${(index / stepsCount) * 100}%`;
      labelPositions.push({ position, label });
    });
  } else {
    // Distribute labels evenly
    labels.forEach((label, index) => {
      const position = `${(index / (labels.length - 1)) * 100}%`;
      labelPositions.push({ position, label });
    });
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Slider
        min={min}
        max={max}
        step={step}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        className="mt-6" // Add extra margin to make room for labels
      />
      <div className="relative w-full h-6">
        {labelPositions.map((item, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 text-xs text-muted-foreground"
            style={{ left: item.position }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
} 