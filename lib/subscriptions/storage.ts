import type { StoredApiCredentials } from '@/lib/subscriptions/types';

const STORAGE_KEY = 'hyperfolio_user_api_credentials_v1';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function loadStoredApiCredentials(): StoredApiCredentials | null {
  if (!isBrowser()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredApiCredentials>;

    if (
      typeof parsed.apiKey !== 'string' ||
      typeof parsed.plan !== 'string' ||
      typeof parsed.dailyLimit !== 'number' ||
      typeof parsed.rateLimitPerSecond !== 'number' ||
      typeof parsed.storedAt !== 'string'
    ) {
      return null;
    }

    return parsed as StoredApiCredentials;
  } catch {
    return null;
  }
}

export function saveStoredApiCredentials(
  value: Omit<StoredApiCredentials, 'storedAt'>
): StoredApiCredentials {
  const payload: StoredApiCredentials = {
    ...value,
    storedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  return payload;
}

export function clearStoredApiCredentials(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
