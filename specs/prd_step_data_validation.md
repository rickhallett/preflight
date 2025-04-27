---
id: prd-step-data-validation
title: "Step Data Validation Enhancement"
priority: High
---

# Step Data Validation Enhancement

## Problem Statement

The current implementation of the `addOrUpdateStep` function in `convex/steps.ts` has TypeScript errors because the `stepDataValidator` uses `v.string()` for the `type` field instead of the union type defined in the schema. This creates a type safety issue where invalid step types could potentially be inserted into the database.

## Requirements

1. Align the `stepDataValidator` with the schema definition
2. Ensure type safety throughout the step creation and update flow
3. Maintain backward compatibility with existing data
4. Provide proper error handling for invalid step types

## Implementation Details

### Step Data Validator Update

The `stepDataValidator` should be updated to use the same union type as defined in the schema:

```typescript
const stepDataValidator = v.object({
  prdId: v.string(),
  index: v.number(),
  title: v.string(),
  prompt: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("select"),
    v.literal("multiselect"),
    v.literal("radio"),
    v.literal("slider"),
    v.literal("number"),
    v.literal("multiselect_with_slider")
  ),
  options: v.optional(v.array(v.string())),
  sliderOptions: v.optional(v.array(v.string())),
});
```

### Migration Path

1. Update the validator as described above
2. Update the `addOrUpdateStep` function to handle the new validator
3. Add validation in the seed script to ensure all PRD files specify valid step types
4. Add a migration utility for any existing data with invalid types

## Success Criteria

1. No TypeScript errors in the `addOrUpdateStep` function
2. All steps in the database have valid types according to the schema
3. Seed script validates step types before insertion
4. Existing functionality continues to work without disruption

## Timeline

- Implementation: 1 day
- Testing: 1 day
- Deployment: 0.5 day

## Dependencies

- None 