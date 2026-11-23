import type { APIRequestContext } from '@playwright/test';

const API_URL = 'http://localhost:3000/api';
const MOCK_RECAPTCHA_TOKEN = 'dev-mock-recaptcha-token';

export async function apiRegister(
  request: APIRequestContext,
  user: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    postalCode: string;
  },
): Promise<{ token: string }> {
  const res = await request.post(`${API_URL}/auth/register`, {
    data: { ...user, recaptchaToken: MOCK_RECAPTCHA_TOKEN },
  });
  if (!res.ok()) {
    throw new Error(`Register failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{ token: string }>;
}

export async function apiLogin(
  request: APIRequestContext,
  email: string,
  password: string,
): Promise<{ token: string }> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email, password, recaptchaToken: MOCK_RECAPTCHA_TOKEN },
  });
  if (!res.ok()) {
    throw new Error(`Login failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{ token: string }>;
}

export interface ApiProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  reputationScore: number;
  postalCode: string;
  totalDonated: number;
  totalReceived: number;
}

export async function apiGetMe(
  request: APIRequestContext,
  token: string,
): Promise<ApiProfile> {
  const res = await request.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET /users/me failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<ApiProfile>;
}

export interface RankedCandidate {
  requestId: string;
  reputationScore: number;
  firstName: string;
}

export async function apiGetCandidates(
  request: APIRequestContext,
  token: string,
  itemId: string,
): Promise<RankedCandidate[]> {
  const res = await request.get(`${API_URL}/items/${itemId}/requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET candidates failed ${res.status()}: ${await res.text()}`);
  }
  const body = (await res.json()) as { candidates?: RankedCandidate[] };
  return body.candidates ?? [];
}

export async function apiGetItem(
  request: APIRequestContext,
  token: string,
  itemId: string,
): Promise<{ id: string; status: string; images?: unknown[] }> {
  const res = await request.get(`${API_URL}/items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET item failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{ id: string; status: string; images?: unknown[] }>;
}

export async function apiPublishItem(
  request: APIRequestContext,
  token: string,
  item: {
    title: string;
    description: string;
    category: string;
    condition: string;
    postalCode: string;
    weightRange?: string;
  },
): Promise<{ id: string }> {
  const res = await request.post(`${API_URL}/items`, {
    headers: { Authorization: `Bearer ${token}` },
    multipart: { weightRange: 'lt1', ...item },
  });
  if (!res.ok()) {
    throw new Error(`Publish item failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{ id: string }>;
}

export async function apiRequestItem(
  request: APIRequestContext,
  token: string,
  itemId: string,
  contactChannel: string,
): Promise<{ status: number; body: string }> {
  const res = await request.post(`${API_URL}/items/${itemId}/requests`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { contactChannel },
  });
  return { status: res.status(), body: await res.text() };
}

export async function apiPauseItem(
  request: APIRequestContext,
  token: string,
  itemId: string,
  paused: boolean,
): Promise<{ requestsPaused: boolean }> {
  const res = await request.patch(`${API_URL}/items/${itemId}/pause`, {
    headers: { Authorization: `Bearer ${token}` },
    data: { paused },
  });
  if (!res.ok()) {
    throw new Error(`PATCH pause failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{ requestsPaused: boolean }>;
}

export async function apiGetItemDetail(
  request: APIRequestContext,
  token: string,
  itemId: string,
): Promise<{ id: string; status: string; requestsPaused?: boolean; images?: unknown[] }> {
  const res = await request.get(`${API_URL}/items/${itemId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET item failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<{
    id: string;
    status: string;
    requestsPaused?: boolean;
    images?: unknown[];
  }>;
}

export interface DeliverySessionApi {
  id: string;
  status: string;
  contactChannel: string | null;
  receiverContactChannel: string | null;
}

export async function apiGetDeliverySession(
  request: APIRequestContext,
  token: string,
  sessionId: string,
): Promise<DeliverySessionApi> {
  const res = await request.get(`${API_URL}/delivery-sessions/${sessionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET delivery session failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<DeliverySessionApi>;
}

export async function apiGetMeStatus(
  request: APIRequestContext,
  token: string,
): Promise<{ status: number; body: string }> {
  const res = await request.get(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return { status: res.status(), body: await res.text() };
}

export interface ReputationEventApi {
  delta: number;
  type?: string;
}

export async function apiGetReputationHistory(
  request: APIRequestContext,
  token: string,
): Promise<ReputationEventApi[]> {
  const res = await request.get(`${API_URL}/users/me/reputation-history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok()) {
    throw new Error(`GET reputation history failed ${res.status()}: ${await res.text()}`);
  }
  const body = (await res.json()) as { events?: ReputationEventApi[] };
  return body.events ?? (body as unknown as ReputationEventApi[]);
}

export async function apiPatchMe(
  request: APIRequestContext,
  token: string,
  data: { postalCode?: string },
): Promise<{ status: number; body: string }> {
  const res = await request.patch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    data,
  });
  return { status: res.status(), body: await res.text() };
}
