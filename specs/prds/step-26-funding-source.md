---
id: step-26-funding-source
title: "Funding Source"
tier: 2
prompt: "Is there an existing billing code or value-based care contract that could potentially fund this use-case?"
input_type: radio # With conditional text
options:
  - Yes
  - No
  - Possibly / Unsure
form_field_name: hasPotentialFundingSource # Add field for details if 'Yes'
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup # Potentially with conditional Textarea
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for options.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Explore potential reimbursement mechanisms or existing financial frameworks that could support the adoption and funding of the AI solution. 