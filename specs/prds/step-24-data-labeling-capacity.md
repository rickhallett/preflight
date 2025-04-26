---
id: step-24-data-labeling-capacity
title: "Data-Labeling Capacity"
tier: 2
prompt: "Estimate the percentage of relevant staff time available for data labeling/annotation for AI fine-tuning (0-100%)."
input_type: slider # Representing percentage
options: null # Range 0-100 implied
form_field_name: dataLabelingCapacityPercent
convex_step_type: slider
convex_answer_validator: v.number()
ui_component_suggestion: Slider (min=0, max=100, step=5)
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a slider from 0 to 100.
  - Current slider value is displayed.
  - Input is managed by React Hook Form.
  - On 'Next', the selected number (percentage) is saved.
---

### Description

Assess the organization's internal capacity to contribute to AI model improvement through data labeling or annotation, which impacts feasibility of fine-tuning. 