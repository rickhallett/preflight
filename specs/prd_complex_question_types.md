---
id: prd-complex-question-types
title: "Complex Question Types Framework"
priority: High
---

# Complex Question Types Framework

## Problem Statement

The current questionnaire system supports basic question types, but some PRDs require more complex, multi-part questions that don't fit neatly into the existing types. While we've implemented the `multiselect_with_slider` composite type for step-02, there's no systematic approach for handling other complex question types that may be needed.

## Requirements

1. Define a framework for complex/composite question types
2. Create a system to specify complex question structures in PRD files
3. Implement a component architecture that supports composition of simpler components
4. Ensure proper data handling for complex responses

## Implementation Details

### Complex Question Type Framework

Define a new schema for complex question types:

```typescript
type: v.union(
  // Basic types
  v.literal("text"),
  v.literal("select"),
  v.literal("multiselect"),
  v.literal("radio"),
  v.literal("slider"),
  v.literal("number"),
  
  // Complex types
  v.literal("multiselect_with_slider"),
  v.literal("dual_slider"),
  v.literal("matrix"),
  v.literal("ranked_choice"),
  v.literal("conditional")
),

// For complex types, define the sub-components
components: v.optional(v.array(v.object({
  id: v.string(),
  type: v.string(),
  label: v.string(),
  options: v.optional(v.array(v.string())),
  sliderOptions: v.optional(v.array(v.string())),
  required: v.optional(v.boolean()),
  condition: v.optional(v.any()),
  valueFormat: v.optional(v.any())
}))),
```

### New Complex Question Types

1. **dual_slider**: Two sliders that may affect each other (e.g., min/max range)
2. **matrix**: Grid of radio buttons or checkboxes (e.g., Likert scales)
3. **ranked_choice**: Drag-and-drop ranking of options
4. **conditional**: Questions that appear based on previous answers

### UI Component Implementation

1. Create a base ComplexQuestionComponent that handles common logic
2. Create specialized renderers for each complex type
3. Implement proper form state management for sub-components
4. Handle validation at both the sub-component and composite level

### Data Storage

Store complex question responses as structured objects:

```typescript
value: v.union(
  // Simple values
  v.string(),
  v.array(v.string()),
  v.number(),
  
  // Complex values
  v.object({
    dataTypes: v.array(v.string()),
    completeness: v.number(),
  }),
  v.object({
    min: v.number(),
    max: v.number(),
  }),
  v.record(v.string(), v.any())
)
```

## Success Criteria

1. Support for at least 3 new complex question types
2. Consistent API for defining complex questions in PRDs
3. Clean UI rendering of all complex question types
4. Proper data structure for storage and retrieval of complex answers

## Timeline

- Framework design: 2 days
- Component development: 3-5 days
- Schema updates: 1 day
- Testing: 2 days

## Dependencies

- Form state management (react-hook-form)
- UI component library (shadcn/ui)
- Schema updates 