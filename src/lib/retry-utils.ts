export interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: any) => boolean;
}

const defaultRetryOptions: Required<RetryOptions> = {
  maxAttempts: 3,
  delayMs: 1000,
  backoffMultiplier: 2,
  shouldRetry: (error: any) => {
    if (!error) return false;

    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';

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
  let lastError: any;
  let currentDelay = opts.delayMs;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      console.log(`Attempting operation (attempt ${attempt}/${opts.maxAttempts})`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      console.error(`Operation failed on attempt ${attempt}:`, error);

      const shouldRetry = opts.shouldRetry(error);
      const isLastAttempt = attempt === opts.maxAttempts;

      if (!shouldRetry || isLastAttempt) {
        if (isLastAttempt && shouldRetry) {
          console.error('Max retry attempts reached. Giving up.');
          throw new Error(
            `Operation failed after ${opts.maxAttempts} attempts. Last error: ${error.message || 'Unknown error'}`
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

export function validateOfferData(offer: any): ValidationResult {
  const errors: ValidationError[] = [];

  if (!offer.name || offer.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Offer name is required and cannot be empty',
    });
  } else if (offer.name.length < 3) {
    errors.push({
      field: 'name',
      message: 'Offer name must be at least 3 characters long',
    });
  } else if (offer.name.length > 200) {
    errors.push({
      field: 'name',
      message: 'Offer name must be less than 200 characters',
    });
  }

  if (!offer.slug || offer.slug.trim().length === 0) {
    errors.push({
      field: 'slug',
      message: 'URL slug is required and cannot be empty',
    });
  } else if (!/^[a-z0-9-]+$/.test(offer.slug)) {
    errors.push({
      field: 'slug',
      message: 'URL slug can only contain lowercase letters, numbers, and hyphens',
    });
  } else if (offer.slug.length < 3) {
    errors.push({
      field: 'slug',
      message: 'URL slug must be at least 3 characters long',
    });
  } else if (offer.slug.length > 100) {
    errors.push({
      field: 'slug',
      message: 'URL slug must be less than 100 characters',
    });
  } else if (offer.slug.startsWith('-') || offer.slug.endsWith('-')) {
    errors.push({
      field: 'slug',
      message: 'URL slug cannot start or end with a hyphen',
    });
  }

  if (!offer.vertical || offer.vertical.trim().length === 0) {
    errors.push({
      field: 'vertical',
      message: 'Vertical selection is required',
    });
  }

  if (offer.status && !['draft', 'active', 'paused', 'archived'].includes(offer.status)) {
    errors.push({
      field: 'status',
      message: 'Invalid status value',
    });
  }

  if (offer.default_payout !== undefined && offer.default_payout !== null) {
    const payout = parseFloat(offer.default_payout);
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

