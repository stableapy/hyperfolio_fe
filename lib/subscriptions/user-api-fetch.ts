import { getPublicApiBaseUrl } from '@/lib/subscriptions/config';
import { loadStoredApiCredentials } from '@/lib/subscriptions/storage';

export type UserApiFetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  apiKey?: string;
};

export async function userApiFetch(
  path: string,
  options: UserApiFetchOptions = {}
): Promise<Response> {
  const baseUrl = getPublicApiBaseUrl();
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const stored = loadStoredApiCredentials();
  const effectiveKey = options.apiKey || stored?.apiKey;

  if (!effectiveKey) {
    throw new Error(
      'API key is missing. Subscribe first or pass apiKey explicitly.'
    );
  }

  return fetch(`${baseUrl}${normalizedPath}`, {
    ...options,
    headers: {
      ...options.headers,
      'x-api-key': effectiveKey,
    },
  });
}
