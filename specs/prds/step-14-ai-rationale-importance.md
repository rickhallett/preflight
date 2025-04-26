---
id: step-14-ai-rationale-importance
title: "AI Rationale Importance"
tier: 1
prompt: "Rank how important it is that the AI can show a rationale you can present to patients."
input_type: radio # Representing Likert scale
options:
  - "1 (Not important)"
  - "2"
  - "3 (Moderately important)"
  - "4"
  - "5 (Critically important)"
form_field_name: aiRationaleImportance
convex_step_type: radio
convex_answer_validator: v.string() # Storing the selected option text/value
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for options 1 through 5 with labels.
  - Selection is managed by React Hook Form under 'aiRationaleImportance'.
  - On 'Next', the selected option string/value is saved.
---

### Description

Assess the importance of AI explainability, particularly for patient communication, which impacts model choice and UI design. 