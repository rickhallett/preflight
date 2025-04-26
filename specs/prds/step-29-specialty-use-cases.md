---
id: step-29-specialty-use-cases
title: "Specialty-Specific Use-Cases"
tier: 3
prompt: "Are there specific use-cases relevant to your medical specialty you envision for AI? (Optional)"
input_type: text # Combined Dropdown + Text -> simplified to Text
options: null # Specialty dropdown omitted for simplicity
form_field_name: specialtyUseCases
convex_step_type: text
convex_answer_validator: v.string()
ui_component_suggestion: Textarea
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a multi-line text input.
  - Input is managed by React Hook Form.
  - On 'Next', the text content is saved.
# Note: Original prompt included a specialty dropdown. This is simplified to a text input for the PRD.
---

### Description

Allow users to suggest AI applications specific to their field, potentially uncovering valuable niche opportunities. 