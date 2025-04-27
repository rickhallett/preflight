import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  LineChart,
  CartesianGrid,
  Line,
  Legend,
  TooltipProps,
} from "recharts";
import { useMemo } from "react";

interface QuestionCategory {
  title: string;
  questions: string[];
  visualizationType: "bar" | "pie" | "radar" | "line";
}

// Category definitions for grouping questions
const CATEGORIES: QuestionCategory[] = [
  {
    title: "Technical Readiness",
    questions: ["step-06-ai-literacy", "step-25-technical-constraints", "step-28-previous-ai-experience"],
    visualizationType: "radar"
  },
  {
    title: "Budget & Timeline",
    questions: ["step-08-budget-procurement", "step-17-time-to-value", "step-26-funding-source"],
    visualizationType: "bar"
  },
  {
    title: "Data & Governance",
    questions: ["step-02-data-sources", "step-19-data-governance", "step-24-data-labeling-capacity", "step-34-data-sharing"],
    visualizationType: "pie"
  },
  {
    title: "Regulation & Compliance",
    questions: ["step-05-regulatory-constraints", "step-07-privacy-risk-tolerance", "step-27-human-signoff", "step-33-consent-practice"],
    visualizationType: "bar"
  },
  {
    title: "Organizational Structure",
    questions: ["step-03-success-metrics", "step-09-decision-roles", "step-11-monitoring-owner", "step-20-change-management"],
    visualizationType: "line"
  }
];

// Color palette for charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28'];

interface QuestionnaireDataPoint {
  name: string;
  stepId: string;
  value: number;
  label: string;
}

interface ChartData {
  category: string;
  data: QuestionnaireDataPoint[];
}

interface QuestionnaireSummaryProps {
  questionnaireDetails: any;
}

export function QuestionnaireSummary({ questionnaireDetails }: QuestionnaireSummaryProps) {
  const { answers, steps, statistics } = questionnaireDetails;

  // Process data for charts
  const chartData = useMemo(() => {
    return CATEGORIES.map(category => {
      const categoryData = category.questions.map(stepId => {
        // Find the step
        const step = steps.find((s: any) => s.prdId === stepId);
        if (!step) return null;

        // Find the answer
        const answer = answers.find((a: any) => a.stepId === step._id);
        if (!answer || answer.skipped) return null;

        // Determine value based on step type
        let value = 0;
        let label = '';

        switch (step.type) {
          case "slider":
          case "number":
            value = typeof answer.value === 'number' ? answer.value : 0;
            label = String(answer.value);
            break;

          case "select":
          case "radio":
            // For select/radio types, we'll assign arbitrary values for visualization
            if (step.options) {
              const optionIndex = step.options.indexOf(answer.value);
              // Scale to 0-100 range
              value = optionIndex >= 0 ? (optionIndex / (step.options.length - 1)) * 100 : 0;
              label = answer.value;
            }
            break;

          case "multiselect":
            // For multiselect, use the percentage of selected options
            if (step.options && Array.isArray(answer.value)) {
              value = (answer.value.length / step.options.length) * 100;
              label = `${answer.value.length}/${step.options.length} selected`;
            }
            break;

          case "multiselect_with_slider":
            // Use completeness value
            if (typeof answer.value === 'object' && answer.value !== null && 'completeness' in answer.value) {
              value = answer.value.completeness;
              label = `${value}% complete`;
            }
            break;

          case "range_slider_with_labels":
            value = typeof answer.value === 'number' ? answer.value : 0;

            // Find label for value if possible
            if (step.labels && step.sliderOptions) {
              const min = parseInt(step.sliderOptions[0] || "0");
              const max = parseInt(step.sliderOptions[1] || "100");
              const stepSize = parseInt(step.sliderOptions[2] || "1");
              const range = max - min;
              const steps = range / stepSize;

              // If we have exactly matching labels for each step
              if (step.labels.length === steps + 1) {
                const index = Math.round((value - min) / stepSize);
                if (index >= 0 && index < step.labels.length) {
                  label = step.labels[index];
                }
              }
            }
            if (!label) label = String(value);
            break;

          default:
            return null;
        }

        return {
          name: step.prompt.length > 30 ? step.prompt.substring(0, 30) + '...' : step.prompt,
          stepId: step.prdId,
          value,
          label
        };
      }).filter(Boolean) as QuestionnaireDataPoint[];

      return {
        category: category.title,
        data: categoryData,
        visualizationType: category.visualizationType
      };
    }).filter(category => category.data.length > 0);
  }, [answers, steps]);

  // Get overall category scores
  const categoryScores = useMemo(() => {
    return chartData.map(category => {
      // Calculate average value for the category
      const totalValue = category.data.reduce((sum, item) => sum + item.value, 0);
      const avgValue = category.data.length > 0 ? totalValue / category.data.length : 0;

      return {
        name: category.category,
        value: Math.round(avgValue)
      };
    });
  }, [chartData]);

  // Custom tooltip component for charts
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 rounded-md shadow-sm">
          <p className="font-medium">{label}</p>
          <p>{`Value: ${payload[0].payload.label || payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Overview Card */}
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Overall Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryScores}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Charts */}
        {chartData.map((category, index) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {category.visualizationType === 'bar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={category.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill={COLORS[index % COLORS.length]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {category.visualizationType === 'pie' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={category.data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {category.data.map((entry, i) => (
                          <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {category.visualizationType === 'radar' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={category.data}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <Radar
                        name="Value"
                        dataKey="value"
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.6}
                      />
                      <Tooltip content={<CustomTooltip />} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}

                {category.visualizationType === 'line' && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={category.data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={COLORS[index % COLORS.length]}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categoryScores.length > 0 && (
              <>
                <p className="text-lg font-medium">Based on your responses, we recommend:</p>
                <ul className="list-disc pl-5 space-y-2">
                  {/* Dynamic recommendations based on scores */}
                  {categoryScores.some(c => c.name === "Technical Readiness" && c.value < 50) && (
                    <li>
                      <span className="font-medium">Increase Technical Readiness:</span>{" "}
                      Consider investing in AI literacy training for key stakeholders.
                    </li>
                  )}

                  {categoryScores.some(c => c.name === "Budget & Timeline" && c.value < 40) && (
                    <li>
                      <span className="font-medium">Reassess Budget Allocation:</span>{" "}
                      Your current budget may not be sufficient for your AI implementation goals.
                    </li>
                  )}

                  {categoryScores.some(c => c.name === "Data & Governance" && c.value < 60) && (
                    <li>
                      <span className="font-medium">Improve Data Quality:</span>{" "}
                      Focus on data quality and governance before proceeding with implementation.
                    </li>
                  )}

                  {categoryScores.some(c => c.name === "Regulation & Compliance" && c.value < 70) && (
                    <li>
                      <span className="font-medium">Address Compliance Concerns:</span>{" "}
                      Consult with legal experts about healthcare AI regulations before proceeding.
                    </li>
                  )}

                  {/* Generic recommendations if none of the above apply */}
                  {!categoryScores.some(c => c.value < 70) && (
                    <li>
                      <span className="font-medium">Ready for Implementation:</span>{" "}
                      Your organization shows good readiness across key areas. Consider moving to the next phase of your AI implementation.
                    </li>
                  )}
                </ul>

                <p className="text-sm text-muted-foreground mt-4">
                  Note: These recommendations are generated automatically based on your questionnaire responses.
                  For personalized guidance, please consult with our team.
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 