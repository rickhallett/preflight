---
id: step-32-patient-engagement
title: "Patient-Engagement Feature Wishes"
tier: 3
prompt: "Which patient-engagement features, potentially AI-powered, would be most valuable? (Select any)"
input_type: multiselect
options:
  - AI Chatbot for patient questions
  - Automated appointment reminders/scheduling
  - Personalized patient education materials
  - Remote monitoring data analysis/alerts
  - AI-assisted symptom checkers (for triage)
form_field_name: patientEngagementWishes
convex_step_type: multiselect
convex_answer_validator: v.array(v.string())
ui_component_suggestion: CheckboxGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays checkboxes for patient engagement features.
  - Multiple selections allowed.
  - Selections managed by React Hook Form.
  - On 'Next', the selected array is saved.
---

### Description

Explore user interest in specific patient-facing features that could leverage AI, informing future product direction. 