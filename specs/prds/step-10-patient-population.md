---
id: step-10-patient-population
title: "Patient-Population Characteristics & Equity Concerns"
tier: 1
prompt: "Select all relevant characteristics of your patient population:"
input_type: multiselect
options:
  - High non-English-speaking share
  - Predominantly rural coverage
  - Paediatric focus
  - Geriatric focus
  - High prevalence of specific chronic conditions (e.g., Diabetes, COPD)
  - Underserved / vulnerable populations
  - Technologically underserved (low digital literacy/access)
  - Other significant demographic factors
form_field_name: patientPopulationChars
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for the specified characteristics.
  - Multiple options can be selected.
  - Selections are managed by React Hook Form under 'patientPopulationChars'.
  - On 'Next', the selected array is saved.
---

### Description

Uncover potential edge cases, biases, and equity considerations by understanding the key characteristics of the user's patient base. 