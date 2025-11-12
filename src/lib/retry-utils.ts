export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: unknown) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: unknown) => {
    if (!error) return false;

    const message = (error instanceof Error ? error.message : String(error)).toLowerCase();
    const errorObj = error && typeof error === 'object' && 'code' in error ? error : null;
    const code = errorObj && typeof errorObj.code === 'string' ? errorObj.code : '';

    const retryableErrors = [
      'network',
      'timeout',
      'fetch',
      'connection',
      'econnrefused',
      'enotfound',
      'etimedout',
    ];

    const isNetworkError = retryableErrors.some(err =>
      message.includes(err) || code.includes(err)
    );

    const isRateLimitError = code === '429' || message.includes('rate limit');
    const isServerError = code?.startsWith('5');

    return isNetworkError || isRateLimitError || isServerError;
  },
};

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: unknown;
  let currentDelay = opts.delayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      console.log(`Attempting operation (attempt ${attempt}/${opts.maxAttempts})`);
      return await operation();
    } catch (error: unknown) {
      lastError = error;
      console.error(`Operation failed on attempt ${attempt}:`, error);

      const shouldRetry = opts.shouldRetry(error);
      const isLastAttempt = attempt === opts.maxAttempts;

      if (!shouldRetry || isLastAttempt) {
        if (isLastAttempt && shouldRetry) {
          console.error('Max retry attempts reached. Giving up.');
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(
            `Operation failed after ${opts.maxAttempts} attempts. Last error: ${errorMessage}`
          );
        }
        throw error;
      }

      console.log(`Retrying after ${currentDelay}ms...`);
      await delay(currentDelay);
      currentDelay *= opts.backoffMultiplier;
    }
  }

  throw lastError;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  return retryOperation(operation, {
    maxAttempts,
    delayMs: initialDelayMs,
    backoffMultiplier: 2,
  });
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function validateOfferData(offer: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!offer || typeof offer !== 'object') {
    errors.push({
      field: 'offer',
      message: 'Offer data is required and must be an object',
    });
    return { valid: false, errors };
  }

  const offerObj = offer as Record<string, unknown>;

  if (!offerObj.name || typeof offerObj.name !== 'string' || offerObj.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Offer name is required and cannot be empty',
    });
  } else if (typeof offerObj.name === 'string' && offerObj.name.length < 3) {
    errors.push({
      field: 'name',
      message: 'Offer name must be at least 3 characters long',
    });
  } else if (typeof offerObj.name === 'string' && offerObj.name.length > 200) {
    errors.push({
      field: 'name',
      message: 'Offer name must be less than 200 characters',
    });
  }

  if (!offerObj.slug || typeof offerObj.slug !== 'string' || offerObj.slug.trim().length === 0) {
    errors.push({
      field: 'slug',
      message: 'URL slug is required and cannot be empty',
    });
  } else if (typeof offerObj.slug === 'string' && !/^[a-z0-9-]+$/.test(offerObj.slug)) {
    errors.push({
      field: 'slug',
      message: 'URL slug can only contain lowercase letters, numbers, and hyphens',
    });
  } else if (typeof offerObj.slug === 'string' && offerObj.slug.length < 3) {
    errors.push({
      field: 'slug',
      message: 'URL slug must be at least 3 characters long',
    });
  } else if (typeof offerObj.slug === 'string' && offerObj.slug.length > 100) {
    errors.push({
      field: 'slug',
      message: 'URL slug must be less than 100 characters',
    });
  } else if (typeof offerObj.slug === 'string' && (offerObj.slug.startsWith('-') || offerObj.slug.endsWith('-'))) {
    errors.push({
      field: 'slug',
      message: 'URL slug cannot start or end with a hyphen',
    });
  }

  if (!offerObj.vertical || typeof offerObj.vertical !== 'string' || offerObj.vertical.trim().length === 0) {
    errors.push({
      field: 'vertical',
      message: 'Vertical selection is required',
    });
  }

  if (offerObj.status && typeof offerObj.status === 'string' && !['draft', 'active', 'paused', 'archived'].includes(offerObj.status)) {
    errors.push({
      field: 'status',
      message: 'Invalid status value',
    });
  }

  if (offerObj.default_payout !== undefined && offerObj.default_payout !== null) {
    const payout = typeof offerObj.default_payout === 'string' ? parseFloat(offerObj.default_payout) : typeof offerObj.default_payout === 'number' ? offerObj.default_payout : NaN;
    if (isNaN(payout)) {
      errors.push({
        field: 'default_payout',
        message: 'Default payout must be a valid number',
      });
    } else if (payout < 0) {
      errors.push({
        field: 'default_payout',
        message: 'Default payout cannot be negative',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  if (errors.length === 1) {
    return errors[0].message;
  }

  return 'Please fix the following errors:\n' +
    errors.map(e => `• ${e.message}`).join('\n');
}

export function getFieldError(errors: ValidationError[], field: string): string | null {
  const error = errors.find(e => e.field === field);
  return error ? error.message : null;
}

