import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BarChart, Download, Mail, ClipboardList } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { exportToCSV, exportToJSON, shareViaEmail } from "@/lib/export";
import { QuestionnaireSummary } from "./QuestionnaireSummary";

interface QuestionnaireDetailProps {
  questionnaireId: Id<"questionnaires">;
  onBack: () => void;
}

export function QuestionnaireDetail({ questionnaireId, onBack }: QuestionnaireDetailProps) {
  const [activeTab, setActiveTab] = useState<string>("detail");
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [showEmailDialog, setShowEmailDialog] = useState<boolean>(false);

  const questionnaireDetails = useQuery(api.questionnaires.getQuestionnaireWithDetails, {
    questionnaireId,
  });

  if (!questionnaireDetails) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const { answers, steps, statistics } = questionnaireDetails;

  // Function to render answer value based on its type and the step type
  const renderAnswerValue = (answer: any, step: any) => {
    if (answer.skipped) {
      return <Badge variant="outline">Skipped</Badge>;
    }

    const { value } = answer;

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">No answer provided</span>;
    }

    switch (step.type) {
      case "text":
        return <p className="whitespace-pre-wrap">{value}</p>;

      case "select":
      case "radio":
        return <Badge>{value}</Badge>;

      case "multiselect":
        return Array.isArray(value) ? (
          <div className="flex flex-wrap gap-2">
            {value.map((item, i) => (
              <Badge key={i}>{item}</Badge>
            ))}
          </div>
        ) : (
          <p>{JSON.stringify(value)}</p>
        );

      case "slider":
      case "number":
        return <Badge variant="secondary">{value}</Badge>;

      case "range_slider_with_labels":
        // Find the corresponding label for the value if possible
        if (step.labels && step.sliderOptions) {
          const min = parseInt(step.sliderOptions[0] || "0");
          const max = parseInt(step.sliderOptions[1] || "100");
          const stepSize = parseInt(step.sliderOptions[2] || "1");
          const range = max - min;
          const steps = range / stepSize;

          // If we have exactly matching labels for each step
          if (step.labels.length === steps + 1) {
            const index = (value - min) / stepSize;
            if (index >= 0 && index < step.labels.length) {
              return (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{value}</Badge>
                  <span>({step.labels[index]})</span>
                </div>
              );
            }
          }
        }
        return <Badge variant="secondary">{value}</Badge>;

      case "multiselect_with_slider":
        if (typeof value === "object" && value !== null) {
          return (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {Array.isArray(value.dataTypes) && value.dataTypes.map((item: string, i: number) => (
                  <Badge key={i}>{item}</Badge>
                ))}
              </div>
              <div className="flex items-center">
                <span className="mr-2">Completeness:</span>
                <Badge variant="secondary">{value.completeness}%</Badge>
              </div>
            </div>
          );
        }
        return <p>{JSON.stringify(value)}</p>;

      case "dual_slider":
        if (typeof value === "object" && value !== null && 'min' in value && 'max' in value) {
          return (
            <div className="flex items-center gap-2">
              <span>Min:</span>
              <Badge variant="secondary">{value.min}</Badge>
              <span>Max:</span>
              <Badge variant="secondary">{value.max}</Badge>
            </div>
          );
        }
        return <p>{JSON.stringify(value)}</p>;

      default:
        return typeof value === "object" ? (
          <pre className="text-xs bg-secondary p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(value, null, 2)}
          </pre>
        ) : (
          <p>{String(value)}</p>
        );
    }
  };

  const handleExportCSV = () => {
    exportToCSV(questionnaireDetails);
  };

  const handleExportJSON = () => {
    exportToJSON(questionnaireDetails);
  };

  const handleShareEmail = () => {
    if (emailAddress) {
      shareViaEmail(questionnaireDetails, emailAddress);
      setShowEmailDialog(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Questionnaires
        </Button>
        <div className="flex gap-2">
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Mail className="h-4 w-4" />
                Share
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share via Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Recipient Email
                  </label>
                  <Input
                    id="email"
                    placeholder="email@example.com"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                  />
                </div>
                <Button onClick={handleShareEmail} className="w-full">
                  Send Email
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON} className="gap-2">
              <Download className="h-4 w-4" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Questionnaire Results</CardTitle>
          <CardDescription>
            Completed on{" "}
            {new Date(questionnaireDetails.completedAt || 0).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full mb-6">
              <TabsTrigger value="detail" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Detailed View
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                Summary Dashboard
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detail" className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader className="py-4 px-6">
                    <CardTitle className="text-lg">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="py-4 px-6">
                    <div className="text-3xl font-bold">{Math.round(statistics.completionRate)}%</div>
                    <p className="text-sm text-muted-foreground">
                      {statistics.answeredQuestions} of {statistics.totalQuestions} questions answered
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="py-4 px-6">
                    <CardTitle className="text-lg">Time Taken</CardTitle>
                  </CardHeader>
                  <CardContent className="py-4 px-6">
                    <div className="text-3xl font-bold">{statistics.timeTakenMinutes} min</div>
                    <p className="text-sm text-muted-foreground">
                      Average {Math.round(statistics.timeTakenMinutes / (statistics.totalQuestions || 1))} min per question
                    </p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-lg font-semibold">Question Responses</h3>

              <div className="space-y-6">
                {steps.map((step, index) => {
                  const answer = answers.find(a => a.stepId === step._id);

                  return (
                    <Card key={step._id} className="overflow-hidden">
                      <CardHeader className="py-4 px-6 bg-muted/50">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {index + 1}. {step.prompt}
                            </CardTitle>
                            <CardDescription>{step.type}</CardDescription>
                          </div>
                          {answer?.skipped && (
                            <Badge variant="outline">Skipped</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="py-4 px-6">
                        {answer ? (
                          renderAnswerValue(answer, step)
                        ) : (
                          <span className="text-muted-foreground">No answer provided</span>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="summary">
              <QuestionnaireSummary questionnaireDetails={questionnaireDetails} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 