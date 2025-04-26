---
id: step-20-change-management
title: "Change-Management Readiness"
tier: 2
prompt: "Rate agreement: 'Our staff embraces new technology quickly.'"
input_type: radio # Representing Likert scale
options:
  - Strongly Disagree
  - Disagree
  - Neutral
  - Agree
  - Strongly Agree
form_field_name: changeManagementReadiness
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for the agreement scale.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Gauge the organizational culture regarding technology adoption to anticipate potential challenges in rolling out the AI solution. 