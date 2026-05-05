import { getPublicApiBaseUrl } from '@/lib/subscriptions/config';
import { userApiFetch } from '@/lib/subscriptions/user-api-fetch';
import type {
  ApiKeyPayload,
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
  GetApiKeyFromSessionRequest,
  PortalSessionPayload,
  PortalSessionResponse,
  RecoverLogoutResponse,
  RecoverRequestPayload,
  RecoverRequestResponse,
  RecoverVerifyPayload,
  RecoverVerifyResponse,
  RotateApiKeyResponse,
  SubscriptionMeResponse,
} from '@/lib/subscriptions/types';

type JsonRecord = Record<string, unknown>;

export class SubscriptionApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'SubscriptionApiError';
    this.status = status;
  }
}

function extractApiErrorMessage(payload: JsonRecord | null): string | null {
  if (!payload) {
    return null;
  }

  const candidates = [payload.error, payload.message, payload.details];
  for (const value of candidates) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

async function parseResponse(response: Response): Promise<JsonRecord | null> {
  try {
    const data = (await response.json()) as unknown;
    if (data && typeof data === 'object') {
      return data as JsonRecord;
    }
  } catch {
    return null;
  }

  return null;
}

interface RequestJsonOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

async function requestJson<T>(
  path: string,
  options: RequestJsonOptions = {}
): Promise<T> {
  const {
    method = 'POST',
    body,
    headers = {},
    credentials = 'same-origin',
  } = options;
  const baseUrl = getPublicApiBaseUrl();

  if (!baseUrl) {
    throw new SubscriptionApiError('NEXT_PUBLIC_API_BASE_URL is missing', 500);
  }

  let response: Response;
  try {
    const requestHeaders: Record<string, string> = {
      ...headers,
    };
    if (typeof body !== 'undefined') {
      requestHeaders['content-type'] = 'application/json';
    }

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      credentials,
    };

    if (typeof body !== 'undefined') {
      requestInit.body = JSON.stringify(body);
    }

    response = await fetch(`${baseUrl}${path}`, {
      ...requestInit,
    });
  } catch (error) {
    const fallback = `Network error while calling ${baseUrl}${path}. Check API URL and CORS for origin http://localhost:3001.`;
    const message = error instanceof Error ? error.message : fallback;
    throw new SubscriptionApiError(
      message === 'Failed to fetch' ? fallback : message,
      0
    );
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    const apiMessage = extractApiErrorMessage(payload);
    const fallback =
      response.status === 400
        ? 'Invalid request. Please verify the payload.'
        : response.status === 401
          ? 'Unauthorized. Please verify your API key or payment status.'
          : `Request failed with status ${response.status}`;

    throw new SubscriptionApiError(apiMessage || fallback, response.status);
  }

  if (!payload) {
    throw new SubscriptionApiError('Invalid API response payload', 500);
  }

  return payload as T;
}

export async function createCheckoutSession(
  payload: CreateCheckoutSessionRequest
): Promise<CreateCheckoutSessionResponse> {
  return requestJson<CreateCheckoutSessionResponse>(
    '/subscriptions/create-checkout-session',
    { body: payload }
  );
}

export async function getApiKeyFromSession(
  payload: GetApiKeyFromSessionRequest
): Promise<ApiKeyPayload> {
  return requestJson<ApiKeyPayload>('/subscriptions/api-key', { body: payload });
}

export async function rotateApiKey(
  currentApiKey: string
): Promise<RotateApiKeyResponse> {
  return requestJson<RotateApiKeyResponse>(
    '/subscriptions/rotate-key',
    {
      body: {},
      headers: { 'x-api-key': currentApiKey },
    }
  );
}

export async function requestRecoveryCode(
  payload: RecoverRequestPayload
): Promise<RecoverRequestResponse> {
  return requestJson<RecoverRequestResponse>('/subscriptions/recover/request', {
    body: payload,
    credentials: 'include',
  });
}

export async function verifyRecoveryCode(
  payload: RecoverVerifyPayload
): Promise<RecoverVerifyResponse> {
  return requestJson<RecoverVerifyResponse>('/subscriptions/recover/verify', {
    body: payload,
    credentials: 'include',
  });
}

export async function getSubscriptionMe(): Promise<SubscriptionMeResponse> {
  return requestJson<SubscriptionMeResponse>('/subscriptions/me', {
    method: 'GET',
    credentials: 'include',
  });
}

export async function getApiKeyWithRecovery(): Promise<ApiKeyPayload> {
  return requestJson<ApiKeyPayload>('/subscriptions/recover/api-key', {
    method: 'GET',
    credentials: 'include',
  });
}

export async function createPortalSession(
  payload: PortalSessionPayload = {}
): Promise<PortalSessionResponse> {
  return requestJson<PortalSessionResponse>('/subscriptions/portal-session', {
    body: payload,
    credentials: 'include',
  });
}

export async function rotateApiKeyWithRecovery(): Promise<RotateApiKeyResponse> {
  return requestJson<RotateApiKeyResponse>('/subscriptions/recover/rotate-key', {
    body: {},
    credentials: 'include',
  });
}

export async function logoutRecoverySession(): Promise<RecoverLogoutResponse> {
  return requestJson<RecoverLogoutResponse>('/subscriptions/recover/logout', {
    body: {},
    credentials: 'include',
  });
}

export async function checkTokenList(apiKey: string): Promise<number> {
  const response = await userApiFetch('/token/list', {
    method: 'GET',
    apiKey,
  });

  return response.status;
}
