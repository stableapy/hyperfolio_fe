import { NextResponse } from 'next/server';
import { validateAndLogEnvironment } from '@/lib/utils/env-validation';
import {
  generateMockYieldData,
  isMockModeEnabled,
} from '@/lib/mock/yield-mock-data';

/**
 * Error types for structured error responses
 */
type ErrorType =
  | 'AUTHENTICATION'
  | 'BACKEND_UNAVAILABLE'
  | 'NETWORK_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

/**
 * Structured error response
 */
interface ErrorResponse {
  error: string;
  errorType: ErrorType;
  message: string;
  troubleshooting: string[];
  debug?: {
    status?: number;
    statusText?: string;
    url?: string;
    details?: string;
  };
}

/**
 * Generates a structured error response
 */
function createErrorResponse(
  errorType: ErrorType,
  message: string,
  troubleshooting: string[],
  debug?: Record<string, unknown>
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    error: message,
    errorType,
    message,
    troubleshooting,
  };

  // Add debug information in non-production mode
  if (process.env.NODE_ENV !== 'production' && debug) {
    errorResponse.debug = debug as { [key: string]: string | number };
  }

  const statusCode =
    errorType === 'AUTHENTICATION'
      ? 502
      : errorType === 'BACKEND_UNAVAILABLE'
        ? 503
        : 500;

  return NextResponse.json(errorResponse, { status: statusCode });
}

/**
 * Yield data endpoint
 * Proxies requests to the backend API, keeping the API key secure on the server
 *
 * If USE_MOCK_YIELD_DATA is enabled, returns mock data.
 * If the backend is unavailable and auto-fallback is enabled, returns mock data.
 *
 * @returns JSON response with yield opportunities or error details
 */
export async function GET() {
  const useMock = isMockModeEnabled();

  // If mock mode is explicitly enabled, return mock data
  if (useMock) {
    console.log('[yield/all] Using mock data (USE_MOCK_YIELD_DATA=true)');
    const mockData = generateMockYieldData();
    return NextResponse.json({
      ...mockData,
      _meta: {
        isMock: true,
        message: 'Using mock data for development/testing',
      },
    });
  }

  // Validate environment variables
  try {
    validateAndLogEnvironment();
  } catch (error) {
    // In development, validation throws; in production, it just logs
    if (process.env.NODE_ENV === 'development') {
      return createErrorResponse(
        'AUTHENTICATION',
        'Environment configuration invalid',
        [
          'Check your .env file for required variables',
          'Ensure HYPERFOLIO_API_KEY is set',
          'Contact your backend administrator for credentials',
        ]
      );
    }
  }

  const API_KEY = process.env.HYPERFOLIO_API_KEY || process.env.HYPEREVM_API_KEY;
  const API_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || process.env.API_BASE_URL || 'https://api.hyperfolio.xyz';
  const backendUrl = `${API_URL}/yield/all`;

  // Check for missing API key
  if (!API_KEY) {
    console.error('[yield/all] Missing HYPERFOLIO_API_KEY');
    return createErrorResponse(
      'AUTHENTICATION',
      'API authentication failed',
      [
        'The API key is not configured',
        'Set HYPERFOLIO_API_KEY in your environment variables',
        'Contact your backend administrator for the API key',
      ],
      {
        url: backendUrl,
        details: 'Environment variable HYPERFOLIO_API_KEY is not set',
      }
    );
  }

  try {
    console.log(`[yield/all] Fetching from: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      headers: {
        'x-api-key': API_KEY,
        accept: 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    // Log response details for debugging
    console.log(
      `[yield/all] Response status: ${response.status} ${response.statusText}`
    );

    // Handle specific HTTP status codes
    if (response.status === 401 || response.status === 403) {
      const errorBody = await response.text();

      console.error(
        `[yield/all] Authentication failed (401/403):`,
        errorBody.substring(0, 200)
      );

      // Check if auto-fallback to mock data is enabled
      const autoFallback = process.env.USE_MOCK_YIELD_DATA === 'auto';
      if (autoFallback) {
        console.warn(
          '[yield/all] Authentication failed, falling back to mock data'
        );
        const mockData = generateMockYieldData();
        return NextResponse.json({
          ...mockData,
          _meta: {
            isMock: true,
            message: 'Using mock data (backend unavailable)',
            fallbackReason: 'AUTHENTICATION_ERROR',
          },
        });
      }

      return createErrorResponse(
        'AUTHENTICATION',
        'Backend API rejected the request',
        [
          'The API key may be invalid or expired',
          'Check HYPERFOLIO_API_KEY in your environment variables',
          'Ensure the backend service is running',
          'Verify the API key has proper permissions',
          'Set USE_MOCK_YIELD_DATA=auto to use mock data as fallback',
        ],
        {
          status: response.status,
          statusText: response.statusText,
          url: backendUrl,
          details: errorBody.substring(0, 200),
        }
      );
    }

    if (response.status === 404) {
      return createErrorResponse(
        'BACKEND_UNAVAILABLE',
        'Backend endpoint not found',
        [
          'The backend API endpoint does not exist',
          'Check HYPERFOLIO_API_URL in your environment variables',
          'Ensure the backend service is running and accessible',
          'Verify the backend API version matches expected routes',
        ],
        {
          status: response.status,
          statusText: response.statusText,
          url: backendUrl,
        }
      );
    }

    if (response.status >= 500) {
      const errorBody = await response.text();

      console.error(
        `[yield/all] Backend error (500+):`,
        errorBody.substring(0, 200)
      );

      // Check if auto-fallback to mock data is enabled
      const autoFallback = process.env.USE_MOCK_YIELD_DATA === 'auto';
      if (autoFallback) {
        console.warn('[yield/all] Backend error, falling back to mock data');
        const mockData = generateMockYieldData();
        return NextResponse.json({
          ...mockData,
          _meta: {
            isMock: true,
            message: 'Using mock data (backend unavailable)',
            fallbackReason: 'BACKEND_ERROR',
          },
        });
      }

      return createErrorResponse(
        'BACKEND_UNAVAILABLE',
        'Backend service error',
        [
          'The backend API encountered an error',
          'Check backend logs for details',
          'Ensure the backend service is healthy',
          'Contact your backend administrator if issue persists',
          'Set USE_MOCK_YIELD_DATA=auto to use mock data as fallback',
        ],
        {
          status: response.status,
          statusText: response.statusText,
          url: backendUrl,
          details: errorBody.substring(0, 200),
        }
      );
    }

    if (!response.ok) {
      const errorBody = await response.text();

      console.error(
        `[yield/all] Unexpected error status ${response.status}:`,
        errorBody.substring(0, 200)
      );

      return createErrorResponse(
        'NETWORK_ERROR',
        `Unexpected HTTP status: ${response.status}`,
        [
          `The backend returned status ${response.status}`,
          'Check backend logs for details',
          'Verify your network connectivity',
          'Contact your backend administrator',
        ],
        {
          status: response.status,
          statusText: response.statusText,
          url: backendUrl,
          details: errorBody.substring(0, 200),
        }
      );
    }

    // Parse successful response
    const data = await response.json();

    // Validate response structure
    if (!data || typeof data !== 'object') {
      console.error('[yield/all] Invalid JSON response structure');
      return createErrorResponse(
        'INVALID_RESPONSE',
        'Invalid response from backend',
        [
          'The backend returned an unexpected data format',
          'Check backend API documentation',
          'Contact your backend administrator',
        ],
        {
          url: backendUrl,
          details: 'Response is not a valid object',
        }
      );
    }

    console.log('[yield/all] Successfully fetched yield data');
    return NextResponse.json(data);
  } catch (error) {
    // Handle fetch errors (network issues, timeout, etc.)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('[yield/all] Request timeout:', error.message);

        // Check if auto-fallback to mock data is enabled
        const autoFallback = process.env.USE_MOCK_YIELD_DATA === 'auto';
        if (autoFallback) {
          console.warn(
            '[yield/all] Request timeout, falling back to mock data'
          );
          const mockData = generateMockYieldData();
          return NextResponse.json({
            ...mockData,
            _meta: {
              isMock: true,
              message: 'Using mock data (backend unavailable)',
              fallbackReason: 'TIMEOUT',
            },
          });
        }

        return createErrorResponse(
          'NETWORK_ERROR',
          'Request to backend timed out',
          [
            'The backend API did not respond in time',
            'Check if the backend service is running',
            'Verify your network connectivity',
            'Ensure the backend is not under heavy load',
            'Set USE_MOCK_YIELD_DATA=auto to use mock data as fallback',
          ],
          {
            url: backendUrl,
            details: error.message,
          }
        );
      }

      if (error.message.includes('ECONNREFUSED')) {
        console.error('[yield/all] Connection refused:', error.message);

        // Check if auto-fallback to mock data is enabled
        const autoFallback = process.env.USE_MOCK_YIELD_DATA === 'auto';
        if (autoFallback) {
          console.warn(
            '[yield/all] Connection refused, falling back to mock data'
          );
          const mockData = generateMockYieldData();
          return NextResponse.json({
            ...mockData,
            _meta: {
              isMock: true,
              message: 'Using mock data (backend unavailable)',
              fallbackReason: 'CONNECTION_REFUSED',
            },
          });
        }

        return createErrorResponse(
          'BACKEND_UNAVAILABLE',
          'Cannot connect to backend service',
          [
            'The backend service is not running',
            'Check HYPERFOLIO_API_URL in your environment variables',
            'Ensure the backend service is started',
            'Verify the backend is accessible from this host',
            'Set USE_MOCK_YIELD_DATA=auto to use mock data as fallback',
          ],
          {
            url: backendUrl,
            details: error.message,
          }
        );
      }

      console.error('[yield/all] Fetch error:', error.message);
      return createErrorResponse(
        'NETWORK_ERROR',
        'Failed to connect to backend',
        [
          'Network error occurred while fetching data',
          'Check your internet connection',
          'Ensure the backend service is running',
          'Verify HYPERFOLIO_API_URL is correct',
        ],
        {
          url: backendUrl,
          details: error.message,
        }
      );
    }

    console.error('[yield/all] Unknown error:', error);
    return createErrorResponse(
      'UNKNOWN',
      'An unexpected error occurred',
      [
        'An unknown error occurred while fetching yield data',
        'Check the server logs for details',
        'Contact your development team',
      ],
      {
        url: backendUrl,
        details: String(error),
      }
    );
  }
}
