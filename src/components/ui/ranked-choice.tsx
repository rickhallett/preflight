import { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ComplexQuestionComponent } from "./complex-question";
import { useFormContext } from "react-hook-form";
import { ArrowUp, ArrowDown } from "lucide-react";

interface RankedChoiceProps {
  fieldName: string;
  question: {
    prompt: string;
    options?: string[];
  };
}

export function RankedChoice({ fieldName, question }: RankedChoiceProps) {
  const form = useFormContext();
  const options = question.options || [];

  // Initialize a state to track the current order
  const [orderedItems, setOrderedItems] = useState<string[]>(options);

  // Update the form value when order changes
  const updateRanking = (newOrder: string[]) => {
    setOrderedItems(newOrder);
    form.setValue(fieldName, newOrder);
  };

  // Move an item up in the ranking
  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newOrder = [...orderedItems];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    updateRanking(newOrder);
  };

  // Move an item down in the ranking
  const moveDown = (index: number) => {
    if (index >= orderedItems.length - 1) return;
    const newOrder = [...orderedItems];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    updateRanking(newOrder);
  };

  return (
    <ComplexQuestionComponent fieldName={fieldName} question={question}>
      <FormField
        name={fieldName}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rank the following options (drag to reorder)</FormLabel>
            <FormControl>
              <div className="space-y-2">
                {orderedItems.map((item, index) => (
                  <Card
                    key={item}
                    className="p-3 flex items-center justify-between cursor-move"
                  >
                    <div className="flex items-center">
                      <span className="font-medium mr-2">{index + 1}.</span>
                      <span>{item}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => moveDown(index)}
                        disabled={index === orderedItems.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </ComplexQuestionComponent>
  );
} 