---
id: step-34-data-sharing
title: "Data Sharing Policy"
tier: 3
prompt: "Can de-identified patient data be shared with external partners (like the AI vendor) for model improvement purposes?"
input_type: radio # Likert scale treated as radio
options:
  - Yes, definitely
  - Yes, with specific agreements/approvals
  - Possibly, needs review
  - Unlikely
  - No, strictly prohibited
form_field_name: deidentifiedDataSharingPolicy
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for data sharing policies.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Assess the organization's policy on sharing de-identified data externally, crucial for understanding potential for collaborative model improvement. 