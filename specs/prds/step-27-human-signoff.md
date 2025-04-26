---
id: step-27-human-signoff
title: "Human Sign-off Level"
tier: 2
prompt: "Select the level of human sign-off you would require for AI-generated content (e.g., draft notes, summaries)."
input_type: radio # Multiple choice treated as radio
options:
  - AI output used directly (no sign-off)
  - Requires review and explicit approval by a clinician before use
  - Requires review, but can be used if not explicitly rejected within X time
  - AI output is informational only, never used directly in patient care/record
form_field_name: humanSignOffLevel
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for sign-off levels.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Determine the required level of human oversight for AI-generated outputs, impacting workflow design and risk management. 