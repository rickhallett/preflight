---
id: step-17-time-to-value
title: "Expected Time-to-Value"
tier: 2
prompt: "In months, when should the AI show measurable ROI (Return on Investment)?"
input_type: number
options: null
form_field_name: expectedTimeToRoiMonths
convex_step_type: number
convex_answer_validator: v.number()
ui_component_suggestion: Input (type="number", min="1")
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a number input field.
  - Input is managed by React Hook Form.
  - Input should ideally be restricted to positive integers.
  - On 'Next', the entered number is saved.
---

### Description

Set expectations by asking the user how quickly they anticipate seeing a measurable return on investment from the AI solution. 