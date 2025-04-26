---
id: step-19-data-governance
title: "Data Governance Maturity"
tier: 2
prompt: "Rate your organization's data governance maturity: 'We have a formal data steward program.'"
input_type: radio # Representing Likert scale
options:
  - Yes (Fully implemented)
  - Partially (In progress or limited scope)
  - No (No formal program)
  - Unsure
form_field_name: dataGovernanceMaturity
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for the maturity levels.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Assess the level of formal data governance within the organization, indicating readiness for managing AI-related data. 