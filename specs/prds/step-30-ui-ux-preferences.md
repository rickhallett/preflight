---
id: step-30-ui-ux-preferences
title: "UI/UX Preferences"
tier: 3
prompt: "Select any specific UI/UX preferences you have: (Optional)"
input_type: multiselect
options:
  - Dark mode option
  - Voice input/control capabilities
  - Mobile-first design
  - Minimalist interface
  - Customizable dashboards
  - Integration with existing UI themes
form_field_name: uiUxPreferences
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for UI/UX preferences.
  - Multiple selections allowed.
  - Selections managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Collect optional user preferences regarding the look, feel, and interaction style of the software interface. 