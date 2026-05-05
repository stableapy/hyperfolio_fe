export const SUPPORTED_PLAN_IDS = [
  'solo',
  'starter',
  'growth',
  'scale',
] as const;

export type PlanId = (typeof SUPPORTED_PLAN_IDS)[number];

export interface CreateCheckoutSessionRequest {
  planId: PlanId;
  email: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
}

export interface GetApiKeyFromSessionRequest {
  sessionId: string;
}

export interface ApiKeyPayload {
  apiKey: string;
  plan: PlanId;
  dailyLimit: number | null;
  rateLimitPerSecond: number | null;
}

export interface RotateApiKeyResponse {
  success: boolean;
  apiKey: string;
  rotatedAt: string;
}

export interface RecoverRequestPayload {
  email: string;
}

export interface RecoverRequestResponse {
  ok: boolean;
  debugCode?: string;
}

export interface RecoverVerifyPayload {
  email: string;
  code: string;
}

export interface RecoverVerifyResponse {
  ok: boolean;
  expiresAt: string;
}

export interface SubscriptionMeResponse {
  email: string;
  plan: PlanId;
  subscriptionStatus: string;
  graceUntil: string | null;
  dailyLimit: number | null;
  rateLimitPerSecond: number | null;
  hasApiKey: boolean;
  maskedApiKey: string | null;
  accessActive: boolean;
}

export interface PortalSessionPayload {
  returnUrl?: string;
}

export interface PortalSessionResponse {
  url: string;
}

export interface RecoverLogoutResponse {
  ok: boolean;
}

export interface StoredApiCredentials extends ApiKeyPayload {
  storedAt: string;
}
