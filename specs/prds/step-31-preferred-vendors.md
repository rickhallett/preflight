---
id: step-31-preferred-vendors
title: "Preferred Vendors / Tech Stack"
tier: 3
prompt: "Are there any preferred technology vendors or specific tech stack components your organization favors? (Optional)"
input_type: text
options: null
form_field_name: preferredVendorsTech
convex_step_type: text
convex_answer_validator: v.string()
ui_component_suggestion: Textarea
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays a multi-line text input.
  - Input is managed by React Hook Form.
  - On 'Next', the text content is saved.
---

### Description

Identify any existing vendor relationships or mandated technologies that might influence the choice or integration of the AI solution. 