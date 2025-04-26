---
id: step-22-telehealth-plans
title: "Tele-health / Remote-Monitoring Plans"
tier: 2
prompt: "Does your organization have active plans for expanding telehealth or remote patient monitoring?"
input_type: radio # With conditional text
options:
  - Yes
  - No
  - Currently implementing
form_field_name: telehealthExpansionPlans # Potentially add another field for details if 'Yes'
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup # Potentially with conditional Textarea
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for the options.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Explore the organization's strategy regarding remote care, which could influence AI use cases and deployment. 