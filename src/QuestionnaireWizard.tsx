import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

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

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Question {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(((currentStep + 1) / steps.length) * 100)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
        <h3 className="text-xl font-semibold mb-4">{currentQuestion.prompt}</h3>

        {currentQuestion.type === "text" && (
          <textarea
            value={answers[currentQuestion._id] as string ?? ""}
            onChange={e => handleChange(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
          />
        )}

        {currentQuestion.type === "select" && (
          <select
            value={answers[currentQuestion._id] as string ?? ""}
            onChange={e => handleChange(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="">Select an option...</option>
            {currentQuestion.options?.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}

        {currentQuestion.type === "multiselect" && (
          <div className="space-y-2">
            {currentQuestion.options?.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={(answers[currentQuestion._id] as string[] ?? []).includes(option)}
                  onChange={e => {
                    const current = answers[currentQuestion._id] as string[] ?? [];
                    if (e.target.checked) {
                      handleChange([...current, option]);
                    } else {
                      handleChange(current.filter(v => v !== option));
                    }
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-4 py-2 text-gray-600 disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}
