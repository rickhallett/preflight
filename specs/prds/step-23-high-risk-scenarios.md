---
id: step-23-high-risk-scenarios
title: "High-Risk Scenarios That Keep You Up at Night"
tier: 2
prompt: "Which potential high-risk scenarios related to AI in your practice concern you most? (Select top 1-3)"
input_type: multiselect # Multiple choice, interpreted as multi-select
options:
  - Critical misdiagnosis leading to harm
  - Major data breach of PHI
  - Systemic bias impacting a patient group unfairly
  - AI failure during a critical procedure/decision
  - Regulatory non-compliance fines
  - Significant disruption to clinical workflow
  - Loss of patient trust
form_field_name: highRiskConcerns
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for high-risk scenarios.
  - Multiple selections allowed (though prompt suggests 1-3).
  - Selections managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Identify the user's primary anxieties regarding AI implementation to focus safety and mitigation efforts. 