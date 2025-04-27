import { z } from "zod";

export type ValidationRules = {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  pattern?: string;
  customValidation?: string;
  errorMessage?: string;
};

/**
 * Custom validation functions that can be referenced by name
 */
const customValidators: Record<string, (value: any) => boolean> = {
  isValidEmail: (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  isValidURL: (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  isNumericOnly: (value: string) => {
    return /^\d+$/.test(value);
  },
  isAlphaOnly: (value: string) => {
    return /^[a-zA-Z]+$/.test(value);
  },
  isAlphanumericOnly: (value: string) => {
    return /^[a-zA-Z0-9]+$/.test(value);
  },
  noSpecialChars: (value: string) => {
    return /^[a-zA-Z0-9\s]+$/.test(value);
  }
};

/**
 * Gets a custom validation function by name
 */
export const getCustomValidator = (name: string) => {
  return customValidators[name] || null;
};

/**
 * Builds a Zod schema based on validation rules for a text input
 */
export const buildTextSchema = (rules?: ValidationRules) => {
  if (!rules) {
    return z.string().optional();
  }

  let schema = z.string();

  if (rules.required) {
    schema = schema.min(1, rules.errorMessage || "This field is required");
  } else {
    schema = schema.optional();
  }

  if (rules.minLength !== undefined) {
    schema = schema.min(
      rules.minLength,
      rules.errorMessage || `Must be at least ${rules.minLength} characters`
    );
  }

  if (rules.maxLength !== undefined) {
    schema = schema.max(
      rules.maxLength,
      rules.errorMessage || `Must be at most ${rules.maxLength} characters`
    );
  }

  if (rules.pattern) {
    try {
      const regex = new RegExp(rules.pattern);
      schema = schema.regex(
        regex,
        rules.errorMessage || "Input does not match the required pattern"
      );
    } catch (error) {
      console.error("Invalid regex pattern:", rules.pattern);
    }
  }

  if (rules.customValidation && customValidators[rules.customValidation]) {
    schema = schema.refine(
      customValidators[rules.customValidation],
      rules.errorMessage || `Validation failed: ${rules.customValidation}`
    );
  }

  return schema;
};

/**
 * Builds a Zod schema based on validation rules for a number input
 */
export const buildNumberSchema = (rules?: ValidationRules) => {
  if (!rules) {
    return z.number().optional();
  }

  let schema = z.number();

  if (rules.required) {
    schema = schema.min(0, rules.errorMessage || "This field is required");
  } else {
    schema = schema.optional();
  }

  if (rules.minValue !== undefined) {
    schema = schema.min(
      rules.minValue,
      rules.errorMessage || `Must be at least ${rules.minValue}`
    );
  }

  if (rules.maxValue !== undefined) {
    schema = schema.max(
      rules.maxValue,
      rules.errorMessage || `Must be at most ${rules.maxValue}`
    );
  }

  return schema;
};

/**
 * Builds a Zod schema based on validation rules for select inputs
 */
export const buildSelectSchema = (rules?: ValidationRules) => {
  if (!rules) {
    return z.string().optional();
  }

  let schema = z.string();

  if (rules.required) {
    schema = schema.min(1, rules.errorMessage || "Please select an option");
  } else {
    schema = schema.optional();
  }

  return schema;
};

/**
 * Builds a Zod schema based on validation rules for multiselect inputs
 */
export const buildMultiselectSchema = (rules?: ValidationRules) => {
  if (!rules) {
    return z.array(z.string()).optional();
  }

  let schema = z.array(z.string());

  if (rules.required) {
    schema = schema.min(1, rules.errorMessage || "Please select at least one option");
  } else {
    schema = schema.optional();
  }

  if (rules.minLength !== undefined) {
    schema = schema.min(
      rules.minLength,
      rules.errorMessage || `Please select at least ${rules.minLength} options`
    );
  }

  if (rules.maxLength !== undefined) {
    schema = schema.max(
      rules.maxLength,
      rules.errorMessage || `Please select at most ${rules.maxLength} options`
    );
  }

  return schema;
};

/**
 * Builds a Zod schema for any type based on the specified question type and validation rules
 */
export const buildSchemaForQuestion = (
  questionType: string,
  validationRules?: ValidationRules
) => {
  switch (questionType) {
    case "text":
      return buildTextSchema(validationRules);
    case "number":
      return buildNumberSchema(validationRules);
    case "select":
    case "radio":
    case "range_slider_with_labels":
    case "visual_selector":
    case "hierarchical_select":
      return buildSelectSchema(validationRules);
    case "multiselect":
    case "multiselect_with_slider":
      return buildMultiselectSchema(validationRules);
    case "slider":
      return buildNumberSchema(validationRules);
    case "dual_slider":
      return z.object({
        min: buildNumberSchema(validationRules),
        max: buildNumberSchema(validationRules)
      });
    case "matrix":
    case "condensed_checkbox_grid":
      return z.record(z.string(), z.any());
    case "ranked_choice":
      return z.array(z.string());
    case "conditional":
      return z.record(z.string(), z.any());
    default:
      return z.any();
  }
}; 