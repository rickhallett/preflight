---
id: step-33-consent-practice
title: "Consent Practice"
tier: 3
prompt: "Today, do you obtain explicit patient consent before using clinical decision-support tools during their care?"
input_type: radio # Yes/No
options:
  - Yes, always
  - Sometimes / Depends on the tool
  - No, it's considered part of standard care
  - Not applicable / Don't use such tools
form_field_name: decisionSupportConsentPractice
convex_step_type: radio
convex_answer_validator: v.string()
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for consent practices.
  - Selection is managed by React Hook Form.
  - On 'Next', the selected option string is saved.
---

### Description

Understand the current organizational practice regarding patient consent for using decision-support tools, relevant for AI integration. 