---
id: step-28-previous-ai-experience
title: "Previous AI Experience"
tier: 3
prompt: "Have you piloted or used any AI tools in your practice previously? If so, briefly describe the tool and results."
input_type: text # Long-text
options: null
form_field_name: previousAiExperience
convex_step_type: text
convex_answer_validator: v.string()
ui_component_suggestion: Textarea
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a multi-line text input.
  - Input is managed by React Hook Form.
  - On 'Next', the text content is saved.
---

### Description

Gather context on the user's past experiences (positive or negative) with AI tools in a clinical setting. 