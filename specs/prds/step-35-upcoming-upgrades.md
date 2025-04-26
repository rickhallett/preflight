---
id: step-35-upcoming-upgrades
title: "Upcoming Upgrades"
tier: 3
prompt: "Are there any major funded system upgrades (e.g., EHR version update, cloud migration) planned within the next 12 months?"
input_type: radio # Simplified from date picker
options:
  - Yes
  - No
  - Unsure
form_field_name: upcomingUpgrades # Potentially add details field if 'Yes'
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup # Original suggests DatePicker, simplified here. Could add conditional Textarea for details.
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for Yes/No/Unsure.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
# Note: Simplified from a date picker to Yes/No/Unsure for easier initial implementation.
---

### Description

Identify any planned major system changes in the near future that could impact the timing or technical approach for the AI solution deployment. 