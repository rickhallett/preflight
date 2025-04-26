---
id: step-04-integration-points
title: "Integration Points"
tier: 1
prompt: "Which systems would this AI need to plug into? (e.g., EHR, PACS, scheduling, billing…)"
input_type: multiselect # Checkbox list in source
options: # Needs specific systems common in healthcare
  - EHR / EMR
  - PACS
  - Scheduling System
  - Billing System
  - Lab Information System (LIS)
  - Pharmacy System
  - Other (Specify)
form_field_name: integrationSystems # Placeholder
convex_step_type: multiselect # Assumed from input_type
convex_answer_validator: v.array(v.string()) # Assumed from input_type
ui_component_suggestion: CheckboxGroup # Assumed from input_type
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for potential integration systems.
  - Multiple options can be selected.
  - Selections are managed by React Hook Form under 'integrationSystems'.
  - On 'Next', the selected array is saved.
---

### Description

Map the technical landscape by identifying the existing systems the AI solution would need to interact with. 