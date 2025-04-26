---
id: step-25-technical-constraints
title: "Technical Constraints"
tier: 2
prompt: "Which of these technical constraints apply to your environment? (Select all that apply)"
input_type: multiselect # Checkbox source
options:
  - Limited / No access to GPUs
  - No VPN access for external tools
  - Use of legacy Operating Systems (e.g., Windows 7)
  - Strict firewall rules blocking outbound connections
  - Limited local storage capacity
  - Unreliable internet connectivity
  - Restrictions on installing new software
form_field_name: technicalConstraints
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for potential technical constraints.
  - Multiple selections allowed.
  - Selections managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Identify specific technical limitations within the user's environment that could impact AI deployment or performance. 