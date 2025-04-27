import { describe, test, expect } from 'vitest';
import { buildTextSchema } from '../src/lib/validation';

describe('Simple Validation Tests', () => {
  test('buildTextSchema should create an optional string schema when no rules provided', () => {
    const schema = buildTextSchema();
    expect(schema.safeParse('').success).toBe(true);
    expect(schema.safeParse(undefined).success).toBe(true);
  });

  test('buildTextSchema should enforce required rule', () => {
    const schema = buildTextSchema({ required: true });
    expect(schema.safeParse('').success).toBe(false);
    expect(schema.safeParse('value').success).toBe(true);
  });
}); 