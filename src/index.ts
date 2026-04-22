/**
 * @coroboros/sparkline
 */
import { debuglog } from 'node:util';
import { render } from './render.js';
import { type SparklineOptions, validate } from './validate.js';

const debug = debuglog('sparkline');

const DEFAULTS = {
  width: 135,
  height: 50,
  stroke: '#C9A96E',
  strokeWidth: 1.25,
  strokeOpacity: 1,
  precision: 2,
} as const;

/**
 * Generate an SVG sparkline from an array of numeric values.
 *
 * @param values - Finite numbers used to draw the sparkline.
 * @param options - Optional style and accessibility options.
 * @returns The SVG markup as a string.
 */
export const sparkline = (values: ReadonlyArray<number>, options?: SparklineOptions): string => {
  const validated = validate(values, options, DEFAULTS);
  debug('options: %o', validated);
  const svg = render(validated);
  debug('svg: %d bytes', svg.length);
  return svg;
};

export type { SparklineErrorCode } from './error.js';
export { SparklineError } from './error.js';
export type { SparklineOptions } from './validate.js';
