export type SparklineErrorCode = 'MISSING_VALUES' | 'INVALID_VALUES' | 'EMPTY_VALUES';

export class SparklineError extends Error {
  readonly code: SparklineErrorCode;

  constructor(code: SparklineErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'SparklineError';
    this.code = code;
  }
}
