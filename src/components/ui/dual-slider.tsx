import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { ComplexQuestionComponent } from "./complex-question";

interface DualSliderProps {
  fieldName: string;
  question: {
    prompt: string;
    sliderOptions?: string[];
    components?: Array<{
      id: string;
      label: string;
      sliderOptions?: string[];
    }>;
  };
}

export function DualSlider({ fieldName, question }: DualSliderProps) {
  // Default to using the question's sliderOptions if components aren't provided
  const minSliderOptions = question.components?.[0]?.sliderOptions || question.sliderOptions || ["0", "100", "1"];
  const maxSliderOptions = question.components?.[1]?.sliderOptions || question.sliderOptions || ["0", "100", "1"];

  const minLabel = question.components?.[0]?.label || "Minimum";
  const maxLabel = question.components?.[1]?.label || "Maximum";

  return (
    <ComplexQuestionComponent fieldName={fieldName} question={question}>
      <FormField
        name={`${fieldName}_min`}
        render={({ field }) => {
          const min = parseInt(minSliderOptions[0] || "0");
          const max = parseInt(minSliderOptions[1] || "100");
          const step = parseInt(minSliderOptions[2] || "1");

          return (
            <FormItem>
              <FormLabel>{minLabel}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={[field.value || min]}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{min}</span>
                    <span className="font-medium">Selected: {field.value || min}</span>
                    <span className="text-muted-foreground">{max}</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        name={`${fieldName}_max`}
        render={({ field }) => {
          const min = parseInt(maxSliderOptions[0] || "0");
          const max = parseInt(maxSliderOptions[1] || "100");
          const step = parseInt(maxSliderOptions[2] || "1");

          return (
            <FormItem>
              <FormLabel>{maxLabel}</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Slider
                    min={min}
                    max={max}
                    step={step}
                    defaultValue={[field.value || max]}
                    onValueChange={(values) => field.onChange(values[0])}
                  />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{min}</span>
                    <span className="font-medium">Selected: {field.value || max}</span>
                    <span className="text-muted-foreground">{max}</span>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </ComplexQuestionComponent>
  );
} 