/**
 * Utility functions for exporting questionnaire data
 */

/**
 * Prepares tabular data for CSV export
 * 
 * @param questionnaire The questionnaire data with answers and steps
 * @returns An array of rows in [{header: value}] format
 */
export const prepareCSVData = (questionnaire: any) => {
  const { answers, steps } = questionnaire;

  // Create rows with question and answer columns
  const rows = steps.map((step: any) => {
    const answer = answers.find((a: any) => a.stepId === step._id);

    // Format answer value based on type
    let formattedValue = "";
    if (answer) {
      if (answer.skipped) {
        formattedValue = "[Skipped]";
      } else if (typeof answer.value === "string") {
        formattedValue = answer.value;
      } else if (Array.isArray(answer.value)) {
        formattedValue = answer.value.join(", ");
      } else if (typeof answer.value === "object") {
        formattedValue = JSON.stringify(answer.value);
      } else {
        formattedValue = String(answer.value);
      }
    } else {
      formattedValue = "[No answer]";
    }

    return {
      "Question": step.prompt,
      "Answer": formattedValue,
      "Question Type": step.type,
      "Skipped": answer?.skipped ? "Yes" : "No",
    };
  });

  return rows;
};

/**
 * Exports questionnaire data as CSV
 * 
 * @param questionnaire The questionnaire data
 */
export const exportToCSV = (questionnaire: any) => {
  const data = prepareCSVData(questionnaire);

  // Create CSV header
  const headers = Object.keys(data[0]);
  let csv = headers.join(",") + "\n";

  // Add rows
  data.forEach((row: any) => {
    const values = headers.map(header => {
      // Escape quotes and wrap in quotes if contains comma or newline
      const cell = String(row[header] || "");
      const escaped = cell.replace(/"/g, '""');
      return escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')
        ? `"${escaped}"`
        : escaped;
    });
    csv += values.join(",") + "\n";
  });

  // Create download link
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `questionnaire_${questionnaire.id}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Exports questionnaire data as JSON
 * 
 * @param questionnaire The questionnaire data
 */
export const exportToJSON = (questionnaire: any) => {
  const jsonData = JSON.stringify(questionnaire, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `questionnaire_${questionnaire.id}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Send questionnaire data as email
 * 
 * @param questionnaire The questionnaire data
 * @param email The recipient email address
 */
export const shareViaEmail = (questionnaire: any, email: string) => {
  // Note: This is a simplified example - in a real app, you'd call an API endpoint
  // to handle server-side email sending

  const subject = encodeURIComponent("Shared Questionnaire Results");
  const body = encodeURIComponent(`
    Here are the results of my questionnaire:
    
    Completed on: ${new Date(questionnaire.completedAt).toLocaleDateString()}
    
    ${questionnaire.steps.map((step: any, index: number) => {
    const answer = questionnaire.answers.find((a: any) => a.stepId === step._id);
    const answerText = answer?.skipped
      ? "[Skipped]"
      : (typeof answer?.value === "object"
        ? JSON.stringify(answer?.value)
        : answer?.value);
    return `Q${index + 1}: ${step.prompt}\nA: ${answerText || "[No answer]"}\n`;
  }).join("\n")}
    
    Powered by PreFlight
  `);

  window.open(`mailto:${email}?subject=${subject}&body=${body}`);
}; 