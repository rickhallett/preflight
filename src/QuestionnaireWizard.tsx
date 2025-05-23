import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
// Import complex question components
import { DualSlider } from "@/components/ui/dual-slider";
import { MatrixQuestion } from "@/components/ui/matrix-question";
import { RankedChoice } from "@/components/ui/ranked-choice";
import { ConditionalQuestion } from "@/components/ui/conditional-question";
// Import custom UI components
import { RangeSliderWithLabels } from "@/components/ui/range-slider-with-labels";
import { VisualSelector } from "@/components/ui/visual-selector";
import { CondensedCheckboxGrid } from "@/components/ui/condensed-checkbox-grid";
import { HierarchicalSelect } from "@/components/ui/hierarchical-select";
// Import validation utilities
import { buildSchemaForQuestion, ValidationRules } from "@/lib/validation";

interface QuestionnaireWizardProps {
  onComplete?: () => void;
}

// Define a base schema - make it permissive for dynamic field names
const formSchema = z.record(z.string(), z.any());

export default function QuestionnaireWizard({ onComplete }: QuestionnaireWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [questionnaireId, setQuestionnaireId] = useState<Id<"questionnaires"> | null>(null);
  const [dynamicSchema, setDynamicSchema] = useState<z.ZodType<any>>(formSchema);

  const steps = useQuery(api.steps.list);
  const createQuestionnaire = useMutation(api.questionnaires.createQuestionnaire);
  const saveAnswer = useMutation(api.questionnaires.saveAnswer);
  const completeQuestionnaire = useMutation(api.questionnaires.completeQuestionnaire);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(dynamicSchema),
  });

  if (!steps) return <div>Loading steps...</div>;
  if (steps.length === 0) return <div>No questionnaire steps found.</div>;

  const currentQuestion = steps[currentStepIndex];
  const fieldName = currentQuestion.prdId ?? currentQuestion._id;

  // Update the form schema when the current question changes
  useEffect(() => {
    // Build a schema for the current field
    const validation = currentQuestion.validation as ValidationRules | undefined;
    const fieldSchema = buildSchemaForQuestion(currentQuestion.type, validation);

    // Create a dynamic schema with just this field being validated
    const newSchema = z.object({
      [fieldName]: fieldSchema,
    }).passthrough();

    // Special handling for complex question types
    if (currentQuestion.type === "multiselect_with_slider") {
      const dataTypesSchema = buildSchemaForQuestion("multiselect", validation);
      const completenessSchema = buildSchemaForQuestion("slider", validation);

      const enhancedSchema = newSchema.extend({
        [`${fieldName}_dataTypes`]: dataTypesSchema,
        [`${fieldName}_completeness`]: completenessSchema,
      });

      setDynamicSchema(enhancedSchema);
    } else if (currentQuestion.type === "dual_slider") {
      const enhancedSchema = newSchema.extend({
        [`${fieldName}_min`]: z.number().optional(),
        [`${fieldName}_max`]: z.number().optional(),
      });

      setDynamicSchema(enhancedSchema);
    } else {
      setDynamicSchema(newSchema);
    }
  }, [currentStepIndex, steps]);

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    const value = formData[fieldName];

    // Handle compound question type (multiselect_with_slider)
    let dataToSave: any = value;
    let isSkipped = !value || (Array.isArray(value) && value.length === 0);

    // Declare variables outside switch statement
    let dataTypes: string[] = [];
    let completeness = 0;
    let min = 0;
    let max = 0;

    // Handle complex question types
    switch (currentQuestion.type) {
      case "multiselect_with_slider":
        dataTypes = formData[`${fieldName}_dataTypes`] || [];
        completeness = formData[`${fieldName}_completeness`] || 0;
        dataToSave = { dataTypes, completeness };
        isSkipped = (!dataTypes || dataTypes.length === 0) && !completeness;
        break;

      case "dual_slider":
        min = formData[`${fieldName}_min`] || 0;
        max = formData[`${fieldName}_max`] || 0;
        dataToSave = { min, max };
        isSkipped = !min && !max;
        break;

      case "matrix":
        // For matrix questions, gather all the cell values
        dataToSave = {};
        isSkipped = true; // Start assuming it's skipped

        // Check all form fields that start with the fieldName
        Object.keys(formData).forEach(key => {
          if (key.startsWith(`${fieldName}_`) && formData[key]) {
            dataToSave[key.replace(`${fieldName}_`, '')] = formData[key];
            isSkipped = false; // At least one cell is filled
          }
        });
        break;

      case "ranked_choice":
        // Already an array, just check if empty
        isSkipped = !value || (Array.isArray(value) && value.length === 0);
        break;

      case "conditional":
        // For conditional questions, gather component values
        dataToSave = {};
        isSkipped = true;

        // Check all form fields that start with the fieldName
        Object.keys(formData).forEach(key => {
          if (key.startsWith(`${fieldName}_`) && formData[key]) {
            dataToSave[key.replace(`${fieldName}_`, '')] = formData[key];
            isSkipped = false; // At least one field is filled
          }
        });
        break;

      // Handle custom UI component types
      case "condensed_checkbox_grid":
        // Grid values will be a record of row -> columns[]
        isSkipped = !value || (typeof value === 'object' && Object.keys(value).length === 0);
        break;

      case "visual_selector":
        // Value can be a string or string[] depending on multiple selection
        isSkipped = !value || (Array.isArray(value) && value.length === 0);
        break;

      case "range_slider_with_labels":
        // Value will be a number
        isSkipped = value === undefined || value === null;
        break;

      case "hierarchical_select":
        // Value will be a string
        isSkipped = !value;
        break;

      default:
        // Use the default handling for basic question types
        isSkipped = !value || (Array.isArray(value) && value.length === 0);
    }

    // Check if the question is required and the user is trying to skip it
    if (isSkipped && currentQuestion.validation?.required) {
      toast.error(currentQuestion.validation.errorMessage || "This question is required");
      return;
    }

    // If skipped but optional, confirm the skip
    if (isSkipped && !currentQuestion.validation?.required) {
      if (!confirm("Skip this question?")) {
        return;
      }
    }

    try {
      let qId = questionnaireId;
      if (!qId) {
        qId = await createQuestionnaire();
        setQuestionnaireId(qId);
      }

      await saveAnswer({
        questionnaireId: qId,
        stepId: currentQuestion._id,
        value: dataToSave,
        skipped: isSkipped,
      });

      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
      } else {
        await completeQuestionnaire({ questionnaireId: qId });
        toast.success("Questionnaire completed!");
        onComplete?.();
      }
    } catch (error) {
      toast.error("Failed to save answer");
      console.error(error);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  // Helper function to get slider value display format based on step
  const getSliderDisplayFormat = (prdId: string, value: number) => {
    switch (prdId) {
      case "step-08-budget-procurement":
        return `£${value}k`;
      case "step-24-data-labeling-capacity":
        return `${value}%`;
      default:
        return value;
    }
  };

  return (
    <FormProvider {...form}> {/* Provide form context */}
      <Form {...form}>
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% complete</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border mb-6">
            <h3 className="text-xl font-semibold mb-4">{currentQuestion.prompt}</h3>

            {/* Display required indicator if validation requires it */}
            {currentQuestion.validation?.required && (
              <div className="text-sm text-red-500 mb-2">* Required</div>
            )}

            {/* Simple question types */}
            {currentQuestion.type === "text" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentQuestion.type === "select" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentQuestion.options?.map((option: string) => (
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
            )}

            {currentQuestion.type === "radio" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {currentQuestion.options?.map((option: string) => (
                          <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={option} />
                            </FormControl>
                            <FormLabel className="font-normal">
                              {option}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentQuestion.type === "slider" && (
              <FormField
                control={form.control}
                name={fieldName}
                defaultValue={parseInt(currentQuestion.sliderOptions?.[0] || "0")}
                render={({ field }) => {
                  // Extract min, max, and step from options
                  const min = parseInt(currentQuestion.sliderOptions?.[0] || "0");
                  const max = parseInt(currentQuestion.sliderOptions?.[1] || "100");
                  const step = parseInt(currentQuestion.sliderOptions?.[2] || "1");

                  // Get format based on step ID
                  const minDisplay = getSliderDisplayFormat(currentQuestion.prdId, min);
                  const maxDisplay = getSliderDisplayFormat(currentQuestion.prdId, max);
                  const valueDisplay = getSliderDisplayFormat(currentQuestion.prdId, field.value || min);

                  return (
                    <FormItem>
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
                            <span className="text-muted-foreground">{minDisplay}</span>
                            <span className="font-medium">Selected: {valueDisplay}</span>
                            <span className="text-muted-foreground">{maxDisplay}</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {currentQuestion.type === "number" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="number"
                        min={currentQuestion.validation?.minValue}
                        max={currentQuestion.validation?.maxValue}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {currentQuestion.type === "multiselect" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                    </div>
                    {currentQuestion.options?.map((option: string) => (
                      <FormField
                        key={option}
                        control={form.control}
                        name={fieldName}
                        render={({ field }) => {
                          const currentValues = Array.isArray(field.value) ? field.value : [];
                          return (
                            <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={currentValues.includes(option)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...currentValues, option])
                                      : field.onChange(currentValues.filter((v) => v !== option));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {option}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Complex question types */}
            {currentQuestion.type === "multiselect_with_slider" && (
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name={`${fieldName}_dataTypes`}
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Select all data types you reliably capture:</FormLabel>
                      </div>
                      {currentQuestion.options?.map((option: string) => (
                        <FormField
                          key={option}
                          control={form.control}
                          name={`${fieldName}_dataTypes`}
                          render={({ field }) => {
                            const currentValues = Array.isArray(field.value) ? field.value : [];
                            return (
                              <FormItem key={option} className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={currentValues.includes(option)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...currentValues, option])
                                        : field.onChange(currentValues.filter((v) => v !== option));
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`${fieldName}_completeness`}
                  defaultValue={parseInt(currentQuestion.sliderOptions?.[0] || "0")}
                  render={({ field }) => {
                    // Extract min, max, and step from sliderOptions
                    const min = parseInt(currentQuestion.sliderOptions?.[0] || "0");
                    const max = parseInt(currentQuestion.sliderOptions?.[1] || "100");
                    const step = parseInt(currentQuestion.sliderOptions?.[2] || "1");

                    return (
                      <FormItem>
                        <FormLabel>Rate overall data completeness (0-100):</FormLabel>
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
                              <span className="text-muted-foreground">{min}%</span>
                              <span className="font-medium">Selected: {field.value || min}%</span>
                              <span className="text-muted-foreground">{max}%</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            )}

            {/* New complex question types */}
            {currentQuestion.type === "dual_slider" && (
              <DualSlider fieldName={fieldName} question={currentQuestion} />
            )}

            {currentQuestion.type === "matrix" && (
              <MatrixQuestion fieldName={fieldName} question={currentQuestion} />
            )}

            {currentQuestion.type === "ranked_choice" && (
              <RankedChoice fieldName={fieldName} question={currentQuestion} />
            )}

            {currentQuestion.type === "conditional" && (
              <ConditionalQuestion fieldName={fieldName} question={currentQuestion} />
            )}

            {/* Custom UI Component Types */}
            {currentQuestion.type === "range_slider_with_labels" && (
              <FormField
                control={form.control}
                name={fieldName}
                defaultValue={parseInt(currentQuestion.sliderOptions?.[0] || "0")}
                render={({ field }) => {
                  // Extract min, max, and step from sliderOptions
                  const min = parseInt(currentQuestion.sliderOptions?.[0] || "0");
                  const max = parseInt(currentQuestion.sliderOptions?.[1] || "100");
                  const step = parseInt(currentQuestion.sliderOptions?.[2] || "25");
                  const labels = currentQuestion.labels || ["Min", "Low", "Medium", "High", "Max"];

                  return (
                    <FormItem>
                      <FormControl>
                        <RangeSliderWithLabels
                          min={min}
                          max={max}
                          step={step}
                          labels={labels}
                          defaultValue={[field.value || min]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {currentQuestion.type === "visual_selector" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  // Use images from the question
                  const options = currentQuestion.images || [];
                  // Determine if multiple selection is allowed
                  const multiple = currentQuestion.options?.includes("multiple") || false;

                  return (
                    <FormItem>
                      <FormControl>
                        <VisualSelector
                          options={options}
                          value={field.value}
                          onChange={field.onChange}
                          multiple={multiple}
                          columns={3} // Default to 3 columns
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {currentQuestion.type === "condensed_checkbox_grid" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  const rows = currentQuestion.rows || [];
                  const columns = currentQuestion.columns || [];

                  return (
                    <FormItem>
                      <FormControl>
                        <CondensedCheckboxGrid
                          rows={rows}
                          columns={columns}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}

            {currentQuestion.type === "hierarchical_select" && (
              <FormField
                control={form.control}
                name={fieldName}
                render={({ field }) => {
                  const options = currentQuestion.hierarchicalOptions || [];

                  return (
                    <FormItem>
                      <FormControl>
                        <HierarchicalSelect
                          options={options}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select an option..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStepIndex === 0}
            >
              Back
            </Button>
            <Button type="submit">
              {currentStepIndex === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
}
