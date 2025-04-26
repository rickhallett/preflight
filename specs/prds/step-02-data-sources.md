---
id: step-02-data-sources
title: "Available Data & Quality"
tier: 1
prompt: "Which of these data types do you reliably capture? Rate overall data completeness (0-100)." # Needs refinement for multi-part question
input_type: multiselect # Plus slider - needs splitting or complex component
options: [] # Needs specific data types
form_field_name: availableDataTypes # Placeholder for multiselect
# Needs another field for slider, e.g., dataCompletenessSlider
convex_step_type: multiselect # Needs refinement for composite type
convex_answer_validator: v.object({ dataTypes: v.array(v.string()), completeness: v.number() }) # Placeholder
ui_component_suggestion: CheckboxGroup + Slider # Needs specific implementation
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for data types (to be defined).
  - UI displays a slider from 0 to 100 for completeness.
  - Selections and slider value managed by React Hook Form.
  - On 'Next', the selected array and slider value are saved.
---

### Description

Discover the raw material AI can use by identifying reliably captured data types and their perceived completeness. 