import { isColor } from './colors.js';
import { SparklineError } from './error.js';

export type SparklineOptions = {
  width?: number;
  height?: number;
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  title?: string;
  ariaLabel?: string;
  description?: string;
  precision?: number;
};

export type SparklineDefaults = {
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  precision: number;
};

export type ValidatedOptions = {
  values: ReadonlyArray<number>;
  width: number;
  height: number;
  stroke: string;
  strokeWidth: number;
  strokeOpacity: number;
  title: string | undefined;
  ariaLabel: string | undefined;
  description: string | undefined;
  precision: number;
};

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const nonEmptyString = (v: unknown): v is string => typeof v === 'string' && v.trim() !== '';

const isInteger = (v: unknown): v is number => isFiniteNumber(v) && Number.isInteger(v);

export const validate = (
  values: ReadonlyArray<number> | undefined,
  options: SparklineOptions | undefined,
  defaults: SparklineDefaults,
): ValidatedOptions => {
  if (values === undefined || values === null) {
    throw new SparklineError('MISSING_VALUES', 'values argument is required');
  }
  if (!Array.isArray(values)) {
    throw new SparklineError('INVALID_VALUES', 'values must be an array of finite numbers');
  }
  if (values.length === 0) {
    throw new SparklineError('EMPTY_VALUES', 'values must contain at least one number');
  }
  for (let i = 0; i < values.length; i += 1) {
    if (!isFiniteNumber(values[i])) {
      throw new SparklineError('INVALID_VALUES', `values[${i}] is not a finite number`);
    }
  }

  const opts = options ?? {};
  const {
    width,
    height,
    stroke,
    strokeWidth,
    strokeOpacity,
    title,
    ariaLabel,
    description,
    precision,
  } = opts;

  return {
    values,
    width: isFiniteNumber(width) && width > 0 ? width : defaults.width,
    height: isFiniteNumber(height) && height > 0 ? height : defaults.height,
    stroke: isColor(stroke) ? stroke : defaults.stroke,
    strokeWidth:
      isFiniteNumber(strokeWidth) && strokeWidth >= 0 ? strokeWidth : defaults.strokeWidth,
    strokeOpacity:
      isFiniteNumber(strokeOpacity) && strokeOpacity >= 0 && strokeOpacity <= 1
        ? strokeOpacity
        : defaults.strokeOpacity,
    title: nonEmptyString(title) ? title : undefined,
    ariaLabel: nonEmptyString(ariaLabel) ? ariaLabel : undefined,
    description: nonEmptyString(description) ? description : undefined,
    precision:
      isInteger(precision) && precision >= 0 && precision <= 6 ? precision : defaults.precision,
  };
};
