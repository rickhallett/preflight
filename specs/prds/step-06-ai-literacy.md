---
id: step-06-ai-literacy
title: "AI Literacy & Comfort Level"
tier: 1
prompt: "On a scale of 1-5, how confident are you explaining what a large language model is?"
input_type: radio # Representing Likert scale
options:
  - "1 (Not confident at all)"
  - "2"
  - "3 (Somewhat confident)"
  - "4"
  - "5 (Very confident)"
form_field_name: aiLiteracyConfidence
convex_step_type: radio
convex_answer_validator: v.string() # Storing the selected option text
ui_component_suggestion: RadioGroup
acceptance_criteria:
  - UI renders the prompt correctly.
  - UI displays radio buttons for options 1 through 5 with descriptive labels for 1, 3, 5.
  - Selection is managed by React Hook Form under 'aiLiteracyConfidence'.
  - On 'Next', the selected option string is saved.
---

### Description

Gauge the user's understanding and comfort level with core AI concepts (like LLMs) to tailor user experience and potential training needs. Uses a 5-point Likert scale represented as radio buttons. 