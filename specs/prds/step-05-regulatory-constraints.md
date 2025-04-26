---
id: step-05-regulatory-constraints
title: "Regulatory & Compliance Constraints"
tier: 1
prompt: "Does your organisation permit cloud processing of PHI? (If no, please explain briefly)"
input_type: radio # Primary input is Yes/No, with conditional text
options: # Implicit Yes/No
  - Yes
  - No
form_field_name: cloudPhiPermitted # Consider separate field for explanation if 'No'
convex_step_type: radio # Stores the Yes/No
convex_answer_validator: v.string() # Stores "Yes" or "No" # Needs refinement for conditional text
ui_component_suggestion: RadioGroup # Potentially with conditional Textarea for 'No' explanation
acceptance_criteria:
  - UI renders the main prompt correctly.
  - UI displays 'Yes' and 'No' radio buttons.
  - Selection is managed by React Hook Form under 'cloudPhiPermitted'.
  # - If 'No' is selected, a text area appears for explanation (managed by RHF). # Future enhancement
  - On 'Next', the selection ("Yes" or "No") and potentially explanation are saved.
---

### Description

Identify potential showstoppers related to data privacy and regulations, specifically concerning the use of cloud services for Protected Health Information (PHI). 