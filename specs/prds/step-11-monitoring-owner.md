---
id: step-11-monitoring-owner
title: "Ongoing Monitoring Owner"
tier: 1
prompt: "Who (role) will own ongoing accuracy / bias monitoring after go-live?"
input_type: radio # Assuming single owner role
options:
  - Clinical Lead / Champion
  - Dedicated Data Scientist / Analyst
  - IT Department
  - Quality Improvement Team
  - External Vendor Support
  - Not yet determined
  - Other
form_field_name: monitoringOwnerRole
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: Select # Dropdown
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a dropdown/select with the specified roles.
  - Selection is managed by React Hook Form under 'monitoringOwnerRole'.
  - On 'Next', the selected role string is saved.
---

### Description

Identify the role responsible for the crucial task of monitoring the AI model's performance (accuracy, bias) after deployment. 