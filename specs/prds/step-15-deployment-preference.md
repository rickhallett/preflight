---
id: step-15-deployment-preference
title: "Deployment Preference"
tier: 2
prompt: "What is your preferred deployment model?"
input_type: radio
options:
  - Cloud-based (SaaS)
  - On-premise installation
  - Mobile application (if applicable)
  - Hybrid model
form_field_name: deploymentPreference
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for deployment options.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Understand the user's technical preference or constraints regarding where the AI solution should run (cloud vs. local infrastructure). 