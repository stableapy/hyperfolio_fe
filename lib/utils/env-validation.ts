/**
 * Environment variable validation utility
 *
 * Validates required environment variables at application startup
 * to provide clear error messages when configuration is missing.
 */

type EnvValidationError = {
  variable: string;
  message: string;
  fix: string;
};

interface ValidationResult {
  isValid: boolean;
  errors: EnvValidationError[];
}

/**
 * Validates HYPERFOLIO_API_KEY environment variable
 */
function validateApiKey(): EnvValidationError | null {
  const apiKey = process.env.HYPERFOLIO_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      variable: 'HYPERFOLIO_API_KEY',
      message: 'API key is missing or empty',
      fix: 'Add HYPERFOLIO_API_KEY to your .env file. Contact your backend administrator for the API key.',
    };
  }

  return null;
}

/**
 * Validates HYPERFOLIO_API_URL environment variable format
 */
function validateApiUrl(): EnvValidationError | null {
  const apiUrl = process.env.HYPERFOLIO_API_URL;

  if (!apiUrl || apiUrl.trim() === '') {
    // API_URL is optional, defaults to localhost:3000
    return null;
  }

  try {
    new URL(apiUrl);
    return null;
  } catch {
    return {
      variable: 'HYPERFOLIO_API_URL',
      message: 'Invalid URL format',
      fix: 'Ensure HYPERFOLIO_API_URL is a valid URL (e.g., http://localhost:3000 or https://api.hyperfolio.io)',
    };
  }
}

/**
 * Validates all required environment variables
 *
 * @returns ValidationResult with isValid flag and list of errors
 *
 * @example
 * ```ts
 * const result = validateEnvironment();
 * if (!result.isValid) {
 *   result.errors.forEach(error => {
 *     console.error(`[ERROR] ${error.variable}: ${error.message}`);
 *     console.error(`[FIX] ${error.fix}`);
 *   });
 * }
 * ```
 */
export function validateEnvironment(): ValidationResult {
  const errors: EnvValidationError[] = [];

  // Validate API key
  const apiKeyError = validateApiKey();
  if (apiKeyError) {
    errors.push(apiKeyError);
  }

  // Validate API URL format
  const apiUrlError = validateApiUrl();
  if (apiUrlError) {
    errors.push(apiUrlError);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates environment variables and logs errors
 *
 * In development mode, this will throw an error with detailed information.
 * In production, it only logs warnings to allow graceful degradation.
 *
 * @throws Error if validation fails in development mode
 */
export function validateAndLogEnvironment(): void {
  const isDev = process.env.NODE_ENV === 'development';
  const result = validateEnvironment();

  if (result.isValid) {
    return;
  }

  console.warn('⚠️  Environment validation issues detected:');
  console.warn('');

  result.errors.forEach((error, index) => {
    console.warn(`${index + 1}. ${error.variable}`);
    console.warn(`   ${error.message}`);
    console.warn(`   Fix: ${error.fix}`);
    console.warn('');
  });

  if (isDev) {
    const errorMsg = `Environment validation failed. ${result.errors.length} error(s) found. See above for details.`;
    throw new Error(errorMsg);
  }
}
