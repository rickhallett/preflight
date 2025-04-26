---
id: step-12-alerting-speed
title: "Alerting Speed"
tier: 1
prompt: "How quickly must the team be alerted if AI performance (e.g., AUROC) drops by >5%?"
input_type: radio # Representing speed categories
options:
  - Immediately (Real-time alert)
  - Within 1 hour
  - Within 24 hours
  - Within 1 week
  - Monitored quarterly/annually
form_field_name: alertingSpeedRequirement
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for the specified timeframes.
  - Selection is managed by React Hook Form under 'alertingSpeedRequirement'.
  - On 'Next', the selected timeframe string is saved.
---

### Description

Determine the required responsiveness for monitoring AI performance degradation, impacting alerting system design. 