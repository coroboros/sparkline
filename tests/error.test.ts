import { describe, expect, it } from 'vitest';
import { SparklineError } from '../src/error.js';

describe('SparklineError', () => {
  it('exposes name, code, and message', () => {
    const err = new SparklineError('INVALID_VALUES', 'boom');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('SparklineError');
    expect(err.code).toBe('INVALID_VALUES');
    expect(err.message).toBe('boom');
  });

  it('accepts an optional cause that surfaces as Error#cause', () => {
    const cause = new TypeError('root problem');
    const err = new SparklineError('INVALID_VALUES', 'wrapper', { cause });
    expect(err.cause).toBe(cause);
  });

  it('omits cause when none is provided', () => {
    const err = new SparklineError('EMPTY_VALUES', 'no input');
    expect(err.cause).toBeUndefined();
  });
});
