---
id: step-16-training-preferences
title: "Training & Support Preferences"
tier: 2
prompt: "What are your preferred methods for training and support? (Select all that apply)"
input_type: multiselect
options:
  - Online documentation & knowledge base
  - Live online training sessions (webinars)
  - On-site training sessions
  - Train-the-trainer program
  - In-app tutorials & guides
  - Dedicated account manager / support contact
  - Community forum
form_field_name: trainingSupportPreferences
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for training/support methods.
  - Multiple options can be selected.
  - Selections are managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Gather preferences for how users want to learn the system and receive help, informing the support and onboarding strategy. 