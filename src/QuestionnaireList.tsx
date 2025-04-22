import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { useState } from "react";
import { Id } from "../convex/_generated/dataModel";

interface QuestionnaireListProps {
  onStartNew: () => void;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteDialog({ isOpen, onClose, onConfirm }: DeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Delete Questionnaire</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this questionnaire? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QuestionnaireList({ onStartNew }: QuestionnaireListProps) {
  const questionnaires = useQuery(api.questionnaires.listUserQuestionnaires);
  const deleteQuestionnaire = useMutation(api.questionnaires.deleteQuestionnaire);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] = useState<Id<"questionnaires"> | null>(null);

  if (!questionnaires) return null;

  const completedQuestionnaires = questionnaires.filter(q => q.status === "completed");
  const hasInProgress = questionnaires.some(q => q.status === "in_progress");

  const handleDelete = async () => {
    if (!selectedQuestionnaireId) return;

    try {
      await deleteQuestionnaire({ questionnaireId: selectedQuestionnaireId });
      toast.success("Questionnaire deleted");
    } catch (error) {
      toast.error("Failed to delete questionnaire");
      console.error(error);
    }
    setDeleteDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Questionnaires</h2>
        {!hasInProgress && (
          <button
            onClick={onStartNew}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Start New Questionnaire
          </button>
        )}
      </div>

      {completedQuestionnaires.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't completed any questionnaires yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completedQuestionnaires.map((questionnaire) => (
            <div
              key={questionnaire._id}
              className="bg-white rounded-lg p-6 shadow-sm border"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">
                    Completed on {new Date(questionnaire.completedAt!).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded">
                    Completed
                  </span>
                  <button
                    onClick={() => {
                      setSelectedQuestionnaireId(questionnaire._id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedQuestionnaireId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
