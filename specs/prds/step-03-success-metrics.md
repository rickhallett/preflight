---
id: step-03-success-metrics
title: "Outcome-of-Interest / Success Metrics"
tier: 1
prompt: "If an AI tool worked perfectly, which metric would you present to your CFO to prove its value?"
input_type: text # Short-text
options: null
form_field_name: successMetric # Placeholder
convex_step_type: text # Assumed from input_type
convex_answer_validator: v.string() # Assumed from input_type
ui_component_suggestion: Input # Assumed from input_type
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a single-line text input.
  - Input is managed by React Hook Form under 'successMetric'.
  - On 'Next', the text content is saved.
---

### Description

Define what "good" looks like by asking the user to specify the key metric that would demonstrate the AI tool's value. 