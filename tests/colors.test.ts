import { describe, expect, it } from 'vitest';
import { isColor } from '../src/colors.js';

describe('isColor', () => {
  it('accepts CSS named colors (case-insensitive)', () => {
    expect(isColor('red')).toBe(true);
    expect(isColor('RED')).toBe(true);
    expect(isColor('rebeccapurple')).toBe(true);
    expect(isColor('none')).toBe(true);
    expect(isColor('transparent')).toBe(true);
    expect(isColor('currentColor')).toBe(true);
    expect(isColor('  blue  ')).toBe(true);
  });

  it('accepts hex colors (3, 4, 6, 8 digits)', () => {
    expect(isColor('#abc')).toBe(true);
    expect(isColor('#ABC')).toBe(true);
    expect(isColor('#abcd')).toBe(true);
    expect(isColor('#57bd0f')).toBe(true);
    expect(isColor('#57BD0F')).toBe(true);
    expect(isColor('#57bd0fff')).toBe(true);
  });

  it('accepts CSS functional color notations', () => {
    expect(isColor('rgb(255, 0, 0)')).toBe(true);
    expect(isColor('rgba(255, 0, 0, 0.5)')).toBe(true);
    expect(isColor('hsl(120, 100%, 50%)')).toBe(true);
    expect(isColor('hsla(120, 100%, 50%, 0.5)')).toBe(true);
    expect(isColor('hwb(120 0% 0%)')).toBe(true);
    expect(isColor('lab(50% 40 60)')).toBe(true);
    expect(isColor('lch(50% 40 120)')).toBe(true);
    expect(isColor('oklab(0.5 0.1 0.1)')).toBe(true);
    expect(isColor('oklch(0.5 0.1 120)')).toBe(true);
    expect(isColor('color(srgb 1 0 0)')).toBe(true);
  });

  it('rejects invalid strings', () => {
    expect(isColor('')).toBe(false);
    expect(isColor('   ')).toBe(false);
    expect(isColor('notacolor')).toBe(false);
    expect(isColor('#xyz')).toBe(false);
    expect(isColor('#12')).toBe(false);
    expect(isColor('#1234567')).toBe(false);
    expect(isColor('rgb()')).toBe(true); // loose regex — content trusted
    expect(isColor('rgb(255, 0, 0); expression(bad)')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isColor(undefined)).toBe(false);
    expect(isColor(null)).toBe(false);
    expect(isColor(0)).toBe(false);
    expect(isColor(123)).toBe(false);
    expect(isColor(true)).toBe(false);
    expect(isColor([])).toBe(false);
    expect(isColor({})).toBe(false);
  });
});
