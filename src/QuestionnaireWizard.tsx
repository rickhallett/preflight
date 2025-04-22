import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";
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

interface QuestionnaireWizardProps {
  onComplete?: () => void;
}

export default function QuestionnaireWizard({ onComplete }: QuestionnaireWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [questionnaireId, setQuestionnaireId] = useState<Id<"questionnaires"> | null>(null);

  const steps = useQuery(api.steps.list);
  const createQuestionnaire = useMutation(api.questionnaires.createQuestionnaire);
  const saveAnswer = useMutation(api.questionnaires.saveAnswer);
  const completeQuestionnaire = useMutation(api.questionnaires.completeQuestionnaire);

  if (!steps) return null;

  const handleNext = async () => {
    try {
      let currentQuestionnaireId = questionnaireId;
      if (!currentQuestionnaireId) {
        currentQuestionnaireId = await createQuestionnaire();
        setQuestionnaireId(currentQuestionnaireId);
      }

      const step = steps[currentStep];
      const value = answers[step._id];

      if (!value && !confirm("Skip this question?")) {
        return;
      }

      await saveAnswer({
        questionnaireId: currentQuestionnaireId,
        stepId: step._id,
        value: value ?? "",
        skipped: !value,
      });

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        await completeQuestionnaire({ questionnaireId: currentQuestionnaireId });
        toast.success("Questionnaire completed!");
        onComplete?.();
      }
    } catch (error) {
      toast.error("Failed to save answer");
      console.error(error);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = steps[currentStep];

  const handleChange = (value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion._id]: value,
    }));
  };

  const handleSelectChange = (value: string) => {
    handleChange(value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Question {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 shadow-sm border mb-6">
        <h3 className="text-xl font-semibold mb-4">{currentQuestion.prompt}</h3>

        {currentQuestion.type === "text" && (
          <Textarea
            value={answers[currentQuestion._id] as string ?? ""}
            onChange={e => handleChange(e.target.value)}
            rows={4}
          />
        )}

        {currentQuestion.type === "select" && (
          <Select
            value={answers[currentQuestion._id] as string ?? ""}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {currentQuestion.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {currentQuestion.type === "multiselect" && (
          <div className="space-y-2">
            {currentQuestion.options?.map(option => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${currentQuestion._id}-${option}`}
                  checked={(answers[currentQuestion._id] as string[] ?? []).includes(option)}
                  onCheckedChange={checked => {
                    const current = answers[currentQuestion._id] as string[] ?? [];
                    if (checked) {
                      handleChange([...current, option]);
                    } else {
                      handleChange(current.filter(v => v !== option));
                    }
                  }}
                />
                <Label htmlFor={`${currentQuestion._id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Back
        </Button>
        <Button onClick={() => void handleNext()}>
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
}
