---
id: step-21-feedback-loop
title: "Feedback-Loop Preference"
tier: 2
prompt: "How should the AI ideally learn from user feedback/corrections? (Select preferred methods)"
input_type: multiselect # Checkbox in source, assuming multiple selections ok
options:
  - Explicit correction button/interface
  - Implicit learning from user overrides
  - Periodic review sessions with clinicians
  - Automated analysis of usage patterns
  - Direct feedback forms
form_field_name: feedbackLoopPreference
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for feedback methods.
  - Multiple selections allowed.
  - Selections managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Understand user preferences for how the AI system should incorporate feedback and improve over time. 