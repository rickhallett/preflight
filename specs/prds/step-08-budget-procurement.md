---
id: step-08-budget-procurement
title: "Budget & Procurement Window"
tier: 1
prompt: "Estimate the annual budget you could justify for this solution (£0k - £200k)."
input_type: slider # Representing a budget range
options: null # Range defined in prompt
form_field_name: estimatedAnnualBudget
convex_step_type: slider
convex_answer_validator: v.number() # Storing the selected value
ui_component_suggestion: Slider (min=0, max=200, step=10 or similar)
acceptance_criteria:
  - UI renders the prompt correctly, including the range.
  - UI displays a slider component configured with the specified range (e.g., 0 to 200).
  - The current value of the slider is displayed.
  - Input value is managed by React Hook Form under 'estimatedAnnualBudget'.
  - On 'Next', the selected number is saved.
---

### Description

Assess the financial feasibility and procurement timeline by asking for a justifiable annual budget estimate within a defined range. 