---
id: step-01-workflow-bottlenecks
title: "Workflow Bottlenecks & Pain-Points"
tier: 1
prompt: "Walk me through the most time-consuming part of a typical patient visit."
input_type: text # Long-text
options: null
form_field_name: workflowBottlenecks # Placeholder
convex_step_type: text # Assumed from input_type
convex_answer_validator: v.string() # Assumed from input_type
ui_component_suggestion: Textarea # Assumed from input_type
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a multi-line text input.
  - Input is managed by React Hook Form under 'workflowBottlenecks'.
  - On 'Next', the text content is saved.
---

### Description

Surface latent problems AI could solve by identifying the most time-consuming or problematic parts of the user's current workflow. 