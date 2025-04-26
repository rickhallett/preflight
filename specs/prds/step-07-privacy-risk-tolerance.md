---
id: step-07-privacy-risk-tolerance
title: "Privacy & Ethical Risk Tolerance"
tier: 1
prompt: "Which of the following risks would prevent adoption?"
input_type: multiselect
options:
  - Misdiagnosis potential
  - Patient data leakage
  - Algorithmic bias propagation
  - Lack of result explainability
  - Vendor lock-in
  - High implementation cost
  - Staff resistance
  - Other (Specify if possible)
form_field_name: adoptionPreventingRisks
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for the specified risk types.
  - Multiple options can be selected.
  - Selections are managed by React Hook Form under 'adoptionPreventingRisks'.
  - On 'Next', the selected array is saved.
---

### Description

Understand the user's threshold for various risks associated with AI adoption in healthcare. This helps shape necessary guardrails and features. 