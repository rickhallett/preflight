import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { ComplexQuestionComponent } from "./complex-question";
import { useFormContext, useWatch } from "react-hook-form";

interface ConditionalQuestionProps {
  fieldName: string;
  question: {
    prompt: string;
    components?: Array<{
      id: string;
      label: string;
      type: string;
      options?: string[];
      condition?: {
        dependsOn: string;
        showWhen: string | string[];
      };
    }>;
  };
}

export function ConditionalQuestion({ fieldName, question }: ConditionalQuestionProps) {
  const form = useFormContext();
  const components = question.components || [];

  // Find trigger component (first component usually)
  const triggerComponent = components.find(c => !c.condition);

  // Initialize with a default value in case there's no trigger component
  const triggerFieldName = triggerComponent ? `${fieldName}_${triggerComponent.id}` : "";

  // Use the hook unconditionally
  const triggerValue = useWatch({
    control: form.control,
    name: triggerFieldName,
    defaultValue: ""
  });

  if (!triggerComponent) {
    return (
      <div className="text-red-500">
        Error: Conditional question requires at least one component without conditions
      </div>
    );
  }

  // Determine which components to show based on trigger value
  const visibleComponents = components.filter(component => {
    // Show the trigger component always
    if (!component.condition) return true;

    // Check if the condition is met
    const { dependsOn, showWhen } = component.condition;
    if (dependsOn !== triggerComponent.id) return false;

    if (Array.isArray(showWhen)) {
      return showWhen.includes(triggerValue);
    }

    return showWhen === triggerValue;
  });

  return (
    <ComplexQuestionComponent fieldName={fieldName} question={question}>
      <div className="space-y-6">
        {/* Render the trigger component */}
        <RenderComponent
          fieldName={fieldName}
          component={triggerComponent}
        />

        {/* Render conditional components */}
        {visibleComponents
          .filter(c => c.id !== triggerComponent.id)
          .map(component => (
            <RenderComponent
              key={component.id}
              fieldName={fieldName}
              component={component}
            />
          ))
        }
      </div>
    </ComplexQuestionComponent>
  );
}

interface RenderComponentProps {
  fieldName: string;
  component: {
    id: string;
    label: string;
    type: string;
    options?: string[];
  };
}

function RenderComponent({ fieldName, component }: RenderComponentProps) {
  const form = useFormContext();
  const componentFieldName = `${fieldName}_${component.id}`;

  switch (component.type) {
    case "select":
      return (
        <FormField
          control={form.control}
          name={componentFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{component.label}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {component.options?.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "radio":
      return (
        <FormField
          control={form.control}
          name={componentFieldName}
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{component.label}</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  {component.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-3">
                      <RadioGroupItem value={option} id={`${componentFieldName}-${option}`} />
                      <label htmlFor={`${componentFieldName}-${option}`}>{option}</label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    case "text":
      return (
        <FormField
          control={form.control}
          name={componentFieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel>{component.label}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      );

    default:
      return (
        <div className="text-yellow-500">
          Unsupported component type: {component.type}
        </div>
      );
  }
} 