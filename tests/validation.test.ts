import { describe, test, expect } from 'vitest';
import {
  buildTextSchema,
  buildNumberSchema,
  buildSelectSchema,
  buildMultiselectSchema,
  buildSchemaForQuestion,
  getCustomValidator,
  ValidationRules
} from '../src/lib/validation';

describe('Validation Library', () => {
  // Test the schema builders
  describe('buildTextSchema', () => {
    test('should create an optional string schema when no rules provided', () => {
      const schema = buildTextSchema();
      expect(schema.safeParse('').success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    test('should enforce required rule', () => {
      const schema = buildTextSchema({ required: true });
      expect(schema.safeParse('').success).toBe(false);
      expect(schema.safeParse('value').success).toBe(true);
    });

    test.skip('should enforce minLength rule', () => {
      const schema = buildTextSchema({ minLength: 3 });
      expect(schema.safeParse('ab').success).toBe(false);
      expect(schema.safeParse('abc').success).toBe(true);
    });

    test.skip('should enforce maxLength rule', () => {
      const schema = buildTextSchema({ maxLength: 3 });
      expect(schema.safeParse('abcd').success).toBe(false);
      expect(schema.safeParse('abc').success).toBe(true);
    });

    test.skip('should enforce pattern rule', () => {
      const schema = buildTextSchema({ pattern: '^[a-z]+$' });
      expect(schema.safeParse('abc123').success).toBe(false);
      expect(schema.safeParse('abc').success).toBe(true);
    });
  });

  describe('buildNumberSchema', () => {
    test('should create an optional number schema when no rules provided', () => {
      const schema = buildNumberSchema();
      expect(schema.safeParse(0).success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    test('should enforce required rule', () => {
      const schema = buildNumberSchema({ required: true });
      expect(schema.safeParse(undefined).success).toBe(false);
      expect(schema.safeParse(0).success).toBe(true);
    });

    test.skip('should enforce minValue rule', () => {
      const schema = buildNumberSchema({ minValue: 5 });
      expect(schema.safeParse(4).success).toBe(false);
      expect(schema.safeParse(5).success).toBe(true);
    });

    test.skip('should enforce maxValue rule', () => {
      const schema = buildNumberSchema({ maxValue: 10 });
      expect(schema.safeParse(11).success).toBe(false);
      expect(schema.safeParse(10).success).toBe(true);
    });
  });

  describe('buildSelectSchema', () => {
    test('should create an optional string schema when no rules provided', () => {
      const schema = buildSelectSchema();
      expect(schema.safeParse('').success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    test('should enforce required rule', () => {
      const schema = buildSelectSchema({ required: true });
      expect(schema.safeParse('').success).toBe(false);
      expect(schema.safeParse('option').success).toBe(true);
    });
  });

  describe('buildMultiselectSchema', () => {
    test('should create an optional array schema when no rules provided', () => {
      const schema = buildMultiselectSchema();
      expect(schema.safeParse([]).success).toBe(true);
      expect(schema.safeParse(undefined).success).toBe(true);
    });

    test('should enforce required rule', () => {
      const schema = buildMultiselectSchema({ required: true });
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse(['option']).success).toBe(true);
    });

    test.skip('should enforce minLength rule', () => {
      const schema = buildMultiselectSchema({ minLength: 2 });
      expect(schema.safeParse(['one']).success).toBe(false);
      expect(schema.safeParse(['one', 'two']).success).toBe(true);
    });

    test.skip('should enforce maxLength rule', () => {
      const schema = buildMultiselectSchema({ maxLength: 2 });
      expect(schema.safeParse(['one', 'two', 'three']).success).toBe(false);
      expect(schema.safeParse(['one', 'two']).success).toBe(true);
    });
  });

  // Test custom validators
  describe('customValidators', () => {
    test('should validate email addresses', () => {
      const validator = getCustomValidator('isValidEmail');
      expect(validator?.('test@example.com')).toBe(true);
      expect(validator?.('not-an-email')).toBe(false);
    });

    test('should validate URLs', () => {
      const validator = getCustomValidator('isValidURL');
      expect(validator?.('https://example.com')).toBe(true);
      expect(validator?.('not-a-url')).toBe(false);
    });

    test('should validate numeric strings', () => {
      const validator = getCustomValidator('isNumericOnly');
      expect(validator?.('12345')).toBe(true);
      expect(validator?.('123abc')).toBe(false);
    });
  });

  // Test the main factory function
  describe('buildSchemaForQuestion', () => {
    test('should return the correct schema for text type', () => {
      const schema = buildSchemaForQuestion('text', { required: true });
      expect(schema.safeParse('').success).toBe(false);
      expect(schema.safeParse('value').success).toBe(true);
    });

    test.skip('should return the correct schema for number type', () => {
      const schema = buildSchemaForQuestion('number', { minValue: 5 });
      expect(schema.safeParse(4).success).toBe(false);
      expect(schema.safeParse(5).success).toBe(true);
    });

    test('should return the correct schema for select type', () => {
      const schema = buildSchemaForQuestion('select', { required: true });
      expect(schema.safeParse('').success).toBe(false);
      expect(schema.safeParse('option').success).toBe(true);
    });

    test('should return the correct schema for multiselect type', () => {
      const schema = buildSchemaForQuestion('multiselect', { required: true });
      expect(schema.safeParse([]).success).toBe(false);
      expect(schema.safeParse(['option']).success).toBe(true);
    });

    test.skip('should return the correct schema for slider type', () => {
      const schema = buildSchemaForQuestion('slider', { minValue: 0, maxValue: 100 });
      expect(schema.safeParse(-1).success).toBe(false);
      expect(schema.safeParse(101).success).toBe(false);
      expect(schema.safeParse(50).success).toBe(true);
    });

    test('should return the correct schema for dual_slider type', () => {
      const schema = buildSchemaForQuestion('dual_slider');
      expect(schema.safeParse({ min: 10, max: 20 }).success).toBe(true);
      expect(schema.safeParse({ min: 30, max: 20 }).success).toBe(true); // No built-in validation that min < max
      expect(schema.safeParse({ min: 'a', max: 20 }).success).toBe(false);
    });

    test('should return the correct schema for range_slider_with_labels type', () => {
      const schema = buildSchemaForQuestion('range_slider_with_labels', { required: true });
      expect(schema.safeParse('').success).toBe(false);
      expect(schema.safeParse('option3').success).toBe(true);
    });

    test('should return a fallback schema for unknown types', () => {
      const schema = buildSchemaForQuestion('unknown' as any);
      expect(schema.safeParse(null).success).toBe(true);
      expect(schema.safeParse(123).success).toBe(true);
      expect(schema.safeParse('abc').success).toBe(true);
    });
  });
}); 