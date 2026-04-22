import { describe, expect, it } from 'vitest';
import { SparklineError } from '../src/error.js';
import { type SparklineDefaults, validate } from '../src/validate.js';

const DEFAULTS: SparklineDefaults = {
  width: 135,
  height: 50,
  stroke: '#C9A96E',
  strokeWidth: 1.25,
  strokeOpacity: 1,
  precision: 2,
};

describe('validate', () => {
  it('throws MISSING_VALUES when values is undefined', () => {
    expect(() => validate(undefined, undefined, DEFAULTS)).toThrow(SparklineError);
    try {
      validate(undefined, undefined, DEFAULTS);
    } catch (e) {
      expect((e as SparklineError).code).toBe('MISSING_VALUES');
      expect((e as SparklineError).name).toBe('SparklineError');
    }
  });

  it('throws INVALID_VALUES when values is not an array', () => {
    for (const bad of [true, 15, '1,2,3', {}, new Set([1, 2])]) {
      try {
        validate(bad as never, undefined, DEFAULTS);
        throw new Error('expected throw');
      } catch (e) {
        expect((e as SparklineError).code).toBe('INVALID_VALUES');
      }
    }
  });

  it('throws EMPTY_VALUES on empty array', () => {
    try {
      validate([], undefined, DEFAULTS);
      throw new Error('expected throw');
    } catch (e) {
      expect((e as SparklineError).code).toBe('EMPTY_VALUES');
    }
  });

  it('throws INVALID_VALUES on non-finite elements', () => {
    for (const bad of [NaN, Infinity, -Infinity, '1' as unknown, null, undefined]) {
      try {
        validate([1, 2, bad as number], undefined, DEFAULTS);
        throw new Error('expected throw');
      } catch (e) {
        expect((e as SparklineError).code).toBe('INVALID_VALUES');
      }
    }
  });

  it('accepts a valid ReadonlyArray of numbers', () => {
    const values: ReadonlyArray<number> = [1, 2, 3];
    const result = validate(values, undefined, DEFAULTS);
    expect(result.values).toBe(values);
  });

  it('falls back to defaults for non-finite or non-positive width/height', () => {
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, '100' as unknown]) {
      const r = validate([1, 2], { width: bad as number, height: bad as number }, DEFAULTS);
      expect(r.width).toBe(DEFAULTS.width);
      expect(r.height).toBe(DEFAULTS.height);
    }
  });

  it('respects 0 for strokeWidth and strokeOpacity', () => {
    const r = validate([1, 2], { strokeWidth: 0, strokeOpacity: 0 }, DEFAULTS);
    expect(r.strokeWidth).toBe(0);
    expect(r.strokeOpacity).toBe(0);
  });

  it('falls back when strokeWidth is negative or strokeOpacity is out of [0, 1]', () => {
    const r = validate([1, 2], { strokeWidth: -1, strokeOpacity: 1.5 }, DEFAULTS);
    expect(r.strokeWidth).toBe(DEFAULTS.strokeWidth);
    expect(r.strokeOpacity).toBe(DEFAULTS.strokeOpacity);
  });

  it('falls back to default stroke when color is invalid', () => {
    const r = validate([1, 2], { stroke: 'notacolor' }, DEFAULTS);
    expect(r.stroke).toBe(DEFAULTS.stroke);
  });

  it('rejects number for stroke (no coercion)', () => {
    const r = validate([1, 2], { stroke: 123 as unknown as string }, DEFAULTS);
    expect(r.stroke).toBe(DEFAULTS.stroke);
  });

  it('carries title, ariaLabel, and description when they are non-empty strings', () => {
    const r = validate(
      [1, 2],
      { title: 'Price', ariaLabel: 'Price chart', description: 'Last 24 hours' },
      DEFAULTS,
    );
    expect(r.title).toBe('Price');
    expect(r.ariaLabel).toBe('Price chart');
    expect(r.description).toBe('Last 24 hours');
  });

  it('drops empty-or-whitespace title, ariaLabel, and description', () => {
    const r = validate([1, 2], { title: '   ', ariaLabel: '', description: '  ' }, DEFAULTS);
    expect(r.title).toBeUndefined();
    expect(r.ariaLabel).toBeUndefined();
    expect(r.description).toBeUndefined();
  });

  it('accepts precision integers in [0, 6]', () => {
    for (const p of [0, 1, 2, 3, 4, 5, 6]) {
      const r = validate([1, 2], { precision: p }, DEFAULTS);
      expect(r.precision).toBe(p);
    }
  });

  it('falls back to default precision for non-integer or out-of-range values', () => {
    for (const bad of [-1, 7, 2.5, Number.NaN, Number.POSITIVE_INFINITY, '2' as unknown]) {
      const r = validate([1, 2], { precision: bad as number }, DEFAULTS);
      expect(r.precision).toBe(DEFAULTS.precision);
    }
  });
});
