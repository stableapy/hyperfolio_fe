const PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function getPublicApiBaseUrl(): string {
  return PUBLIC_API_BASE_URL.replace(/\/+$/, '');
}

export function hasPublicApiBaseUrl(): boolean {
  return getPublicApiBaseUrl().length > 0;
}
