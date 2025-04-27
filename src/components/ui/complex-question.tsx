import { ReactNode } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useFormContext } from "react-hook-form";

export interface ComplexQuestionComponentProps {
  fieldName: string;
  question: any;
  children?: ReactNode;
}

export function ComplexQuestionComponent({
  fieldName,
  question,
  children
}: ComplexQuestionComponentProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  );
}

export interface ComponentDefinition {
  id: string;
  type: string;
  label: string;
  options?: string[];
  sliderOptions?: string[];
  required?: boolean;
  condition?: any;
  valueFormat?: any;
}

interface ComponentRendererProps {
  fieldName: string;
  component: ComponentDefinition;
  onChange?: (value: any) => void;
}

export function ComponentRenderer({ fieldName, component }: ComponentRendererProps) {
  const form = useFormContext();

  // Create a component-specific field name
  const componentFieldName = `${fieldName}_${component.id}`;

  return (
    <FormField
      control={form.control}
      name={componentFieldName}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{component.label}</FormLabel>
          <FormControl>
            {/* The specific input component would be rendered here based on component.type */}
            <div className="p-4 border border-dashed border-muted-foreground rounded">
              Component placeholder: {component.type}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 