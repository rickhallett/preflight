import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

interface QuestionnaireListProps {
  onStartNew: () => void;
}

export default function QuestionnaireList({ onStartNew }: QuestionnaireListProps) {
  const questionnaires = useQuery(api.questionnaires.listUserQuestionnaires);
  const deleteQuestionnaire = useMutation(api.questionnaires.deleteQuestionnaire);

  if (!questionnaires) return null;

  const completedQuestionnaires = questionnaires.filter(q => q.status === "completed");
  const hasInProgress = questionnaires.some(q => q.status === "in_progress");

  const handleDelete = async (questionnaireId: Id<"questionnaires">) => {
    try {
      await deleteQuestionnaire({ questionnaireId: questionnaireId });
      toast.success("Questionnaire deleted");
    } catch (error) {
      toast.error("Failed to delete questionnaire");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Questionnaires</h2>
        {!hasInProgress && (
          <Button onClick={onStartNew}>
            Start New Questionnaire
          </Button>
        )}
      </div>

      {completedQuestionnaires.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't completed any questionnaires yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedQuestionnaires.map((questionnaire) => (
            <div
              key={questionnaire._id}
              className="bg-card rounded-lg p-6 shadow-sm border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date(questionnaire.completedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                    Completed
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-5 w-5" />
                        <span className="sr-only">Delete Questionnaire</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this questionnaire? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => void handleDelete(questionnaire._id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
