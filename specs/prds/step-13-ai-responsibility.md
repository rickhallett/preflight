---
id: step-13-ai-responsibility
title: "AI Responsibility"
tier: 1
prompt: "If an AI suggestion is wrong, who should be held responsible?"
input_type: radio # Multiple choice treated as radio
options:
  - The clinician who acted on the suggestion
  - The AI vendor
  - The hospital/organization
  - Shared responsibility
  - Depends on the situation
  - Other (Specify if possible)
form_field_name: aiErrorResponsibility
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup # Possibly with conditional text input for 'Other'
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for the specified responsibility options.
  - Selection is managed by React Hook Form under 'aiErrorResponsibility'.
  - On 'Next', the selected option string is saved.
---

### Description

Gauge the user's perspective on accountability in the event of AI errors, influencing liability considerations and user interface warnings. 