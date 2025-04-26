---
id: step-09-decision-roles
title: "Decision-Making Roles"
tier: 1
prompt: "Who signs off on new clinical software purchases?"
input_type: radio # Assuming single primary decision maker for simplicity
options:
  - CMO (Chief Medical Officer)
  - CIO (Chief Information Officer)
  - Practice Owner / Lead Physician
  - Department Head
  - Procurement Committee
  - IT Department Lead
  - Other
form_field_name: softwareSignOffRole
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: Select # Dropdown might be better for longer lists
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a dropdown/select input with the specified roles.
  - Selection is managed by React Hook Form under 'softwareSignOffRole'.
  - On 'Next', the selected role string is saved.
---

### Description

Identify the key stakeholder(s) responsible for approving the purchase of new clinical software to understand the sales/adoption process. 