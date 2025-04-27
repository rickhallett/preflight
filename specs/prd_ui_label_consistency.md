---
id: prd-ui-label-consistency
title: "UI Label Consistency Framework"
priority: Medium
---

# UI Label Consistency Framework

## Problem Statement

The current UI implementation shows inconsistent label formatting across different question types. For example, the budget slider shows values with a "£k" suffix, while the data completeness slider correctly uses percentage values. This inconsistency could confuse users and impact data quality.

## Requirements

1. Create a standardized approach for displaying labels and values across all question types
2. Define a system for specifying value formatting in PRD files
3. Update the UI components to respect these formatting specifications
4. Maintain backward compatibility with existing data

## Implementation Details

### Label Configuration System

Add a new field to the step schema to specify formatting:

```typescript
valueFormat: v.optional(v.object({
  prefix: v.optional(v.string()),
  suffix: v.optional(v.string()),
  decimals: v.optional(v.number()),
  multiplier: v.optional(v.number()),
})),
```

Example formats:
- Currency: `{ prefix: "£", suffix: "k", decimals: 0 }`
- Percentage: `{ suffix: "%", decimals: 0 }`
- Score: `{ decimals: 1 }`

### UI Component Updates

1. Modify the Slider component to read format specifications from the question
2. Create a helper function to format values based on the specification
3. Apply consistent formatting to both the slider values and the display text
4. Extend formatting to other numeric inputs (Number type)

### PRD Documentation Updates

Update PRD template to include the `value_format` field:

```yaml
value_format:
  prefix: "£"  # Optional prefix before the value
  suffix: "k"  # Optional suffix after the value
  decimals: 0  # Number of decimal places to display
  multiplier: 1  # Value to multiply by before display
```

## Success Criteria

1. All numeric inputs have consistent and appropriate formatting
2. PRDs clearly specify the expected formatting for values
3. Users see properly formatted values in the UI
4. Stored data remains consistent regardless of display format

## Timeline

- Specification: 1 day
- Implementation: 2 days
- Testing: 1 day
- Documentation: 0.5 day

## Dependencies

- Question type rendering components
- PRD schema definition 