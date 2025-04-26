---
id: step-18-interoperability-standards
title: "Interoperability Standards in Use"
tier: 2
prompt: "Which interoperability standards are currently used in your organization? (Select all that apply)"
input_type: multiselect
options:
  - HL7 v2.x
  - HL7 FHIR (Fast Healthcare Interoperability Resources)
  - DICOM (Digital Imaging and Communications in Medicine)
  - CDA (Clinical Document Architecture)
  - IHE Profiles (Integrating the Healthcare Enterprise)
  - None / Unsure
  - Other (Specify if possible)
form_field_name: interoperabilityStandards
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for common healthcare standards.
  - Multiple options can be selected.
  - Selections are managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Identify the existing data exchange standards used by the organization, which is crucial for planning integrations. 