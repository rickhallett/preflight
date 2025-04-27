---
id: prd-custom-ui-components
title: "Custom UI Component Library"
priority: Medium
prdId: "prd-custom-ui-components"
index: 100
prompt: "Please select from the custom UI components below:"
input_type: visual_selector
convex_step_type: range_slider_with_labels
sliderOptions: ["0", "100", "25"]
labels: ["None", "Low", "Medium", "High", "Critical"]
---

# Custom UI Component Library

## Problem Statement

Several PRDs mention specific UI requirements that may not be fully implemented with the standard shadcn/ui components. Currently, the implementation might not fully satisfy all the UI/UX requirements specified in the PRDs, leading to a gap between design intent and implementation.

## Requirements

1. Audit PRD UI requirements and identify gaps in current implementation
2. Create a library of custom UI components specific to healthcare questionnaires
3. Ensure all components meet WCAG 2.2 AA accessibility standards
4. Provide a consistent look and feel across custom and standard components

## Implementation Details

### Component Audit

Review all PRDs to identify UI requirements that need custom components:

1. Specialized healthcare-specific inputs (e.g., anatomical selectors)
2. Complex multi-part questions
3. Specialized visualizations for certain answer types
4. Interactive elements beyond standard form inputs

### Custom Component Library

Develop the following custom components:

1. **RangeSliderWithLabels**: A slider with descriptive text labels for discrete points
   
   ```jsx
   <RangeSliderWithLabels 
     min={0} 
     max={100} 
     step={25} 
     labels={["None", "Low", "Medium", "High", "Critical"]} 
   />
   ```

2. **VisualSelector**: A grid of images/icons for visual selection
   
   ```jsx
   <VisualSelector 
     options={[
       { value: "heart", image: "/icons/heart.svg", label: "Heart" },
       { value: "brain", image: "/icons/brain.svg", label: "Brain" },
       // ...
     ]} 
   />
   ```

3. **CondensedCheckboxGrid**: A compact grid of checkboxes for selecting multiple related items
   
   ```jsx
   <CondensedCheckboxGrid 
     rows={["Morning", "Afternoon", "Evening"]}
     columns={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
   />
   ```

4. **HierarchicalSelect**: A nested select component for hierarchical data
   
   ```jsx
   <HierarchicalSelect 
     options={[
       { label: "Cardiology", children: [
         { value: "general_cardiology", label: "General Cardiology" },
         { value: "interventional", label: "Interventional Cardiology" }
       ]},
       // ...
     ]} 
   />
   ```

### Integration with Question Types

1. Extend the schema to support specifying custom components in PRDs
2. Create a mapping system to route question types to appropriate components
3. Implement a plug-in architecture for easy addition of new components

## Success Criteria

1. All PRD UI requirements are satisfied by either standard or custom components
2. Custom components are fully accessible (WCAG 2.2 AA compliant)
3. Components maintain visual consistency with shadcn/ui standards
4. Components are well-documented with usage examples
5. Components are reusable across multiple question types

## Timeline

- Audit and specification: 2 days
- Core component development: 5 days
- Integration with question system: 2 days
- Accessibility testing: 1 day
- Documentation: 1 day

## Dependencies

- Existing shadcn/ui component library
- Questionnaire rendering system
- Form state management (React Hook Form) 