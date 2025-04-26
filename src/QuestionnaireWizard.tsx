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

interface QuestionnaireWizardProps {
  onComplete?: () => void;
}

// Define a base schema - make it permissive for dynamic field names
const formSchema = z.record(z.string(), z.any());

export default function QuestionnaireWizard({ onComplete }: QuestionnaireWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [questionnaireId, setQuestionnaireId] = useState<Id<"questionnaires"> | null>(null);

  const steps = useQuery(api.steps.list);
  const createQuestionnaire = useMutation(api.questionnaires.createQuestionnaire);
  const saveAnswer = useMutation(api.questionnaires.saveAnswer);
  const completeQuestionnaire = useMutation(api.questionnaires.completeQuestionnaire);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  if (!steps) return <div>Loading steps...</div>;
  if (steps.length === 0) return <div>No questionnaire steps found.</div>;

  const currentQuestion = steps[currentStepIndex];
  const fieldName = currentQuestion.prdId ?? currentQuestion._id;

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    const value = formData[fieldName];
    const skipped = !value || (Array.isArray(value) && value.length === 0);

    if (skipped && !confirm("Skip this question?")) {
      return;
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
        value: value ?? "",
        skipped: skipped,
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
                defaultValue={parseInt(currentQuestion.options?.[0] || "0")}
                render={({ field }) => {
                  // Extract min, max, and step from options
                  const min = parseInt(currentQuestion.options?.[0] || "0");
                  const max = parseInt(currentQuestion.options?.[1] || "100");
                  const step = parseInt(currentQuestion.options?.[2] || "1");
                  
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
                            <span className="text-muted-foreground">£{min}k</span>
                            <span className="font-medium">Selected: £{field.value || min}k</span>
                            <span className="text-muted-foreground">£{max}k</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
