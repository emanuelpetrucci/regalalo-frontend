import type { APIRequestContext } from '@playwright/test';

const API_URL = process.env['API_URL'] ?? 'http://localhost:3000/api';
const E2E_SECRET =
  process.env['E2E_SECRET'] ?? 'local-e2e-secret-min-32-characters-long';

export interface E2eActorToken {
  id: string;
  email: string;
  password: string;
  token: string;
  firstName: string;
  lastName: string;
}

export interface E2eScenarioResponse {
  scenario: string;
  actors: Record<string, E2eActorToken>;
  entities: {
    itemId?: string;
    sessionId?: string;
    requestIds?: string[];
  };
}

function e2eHeaders(): Record<string, string> {
  return { 'x-e2e-secret': E2E_SECRET };
}

async function e2ePost(
  request: APIRequestContext,
  path: string,
  body?: unknown,
): Promise<void> {
  const res = await request.post(`${API_URL}/e2e${path}`, {
    headers: e2eHeaders(),
    data: body,
  });
  if (!res.ok()) {
    throw new Error(`E2E ${path} failed ${res.status()}: ${await res.text()}`);
  }
}

export async function resetScenario(
  request: APIRequestContext,
  name: string,
): Promise<E2eScenarioResponse> {
  const res = await request.post(`${API_URL}/e2e/scenarios/${name}`, {
    headers: e2eHeaders(),
  });
  if (!res.ok()) {
    throw new Error(`resetScenario(${name}) failed ${res.status()}: ${await res.text()}`);
  }
  return res.json() as Promise<E2eScenarioResponse>;
}

export async function e2ePurgeDatabase(request: APIRequestContext): Promise<void> {
  await e2ePost(request, '/database/purge');
}

export async function e2eExpireSession(
  request: APIRequestContext,
  sessionId: string,
): Promise<void> {
  await e2ePost(request, `/time/expire-session/${sessionId}`);
}

export async function e2eDegradeItem(
  request: APIRequestContext,
  itemId: string,
): Promise<void> {
  await e2ePost(request, `/time/degrade-item/${itemId}`);
}

export async function e2eBackdateItemCompleted(
  request: APIRequestContext,
  itemId: string,
  days = 31,
): Promise<void> {
  await e2ePost(request, `/time/backdate-item-completed/${itemId}`, { days });
}

export async function e2ePurgeContactChannel(
  request: APIRequestContext,
  sessionId: string,
): Promise<void> {
  await e2ePost(request, `/time/purge-contact/${sessionId}`);
}

export async function e2ePurgeImagesView(
  request: APIRequestContext,
  itemId: string,
): Promise<void> {
  await e2ePost(request, `/time/purge-images-view/${itemId}`);
}

export async function e2eIncrementCyclesAtLimit(
  request: APIRequestContext,
  userId: string,
): Promise<void> {
  await e2ePost(request, `/time/increment-cycles/${userId}`);
}

export async function e2eIssueResetToken(
  request: APIRequestContext,
  userId: string,
): Promise<string> {
  const res = await request.post(`${API_URL}/e2e/auth/issue-reset-token/${userId}`, {
    headers: e2eHeaders(),
  });
  if (!res.ok()) {
    throw new Error(`issue-reset-token failed ${res.status()}: ${await res.text()}`);
  }
  const body = (await res.json()) as { token: string };
  return body.token;
}

export async function e2eVerifyUserEmail(
  request: APIRequestContext,
  userId: string,
): Promise<void> {
  await e2ePost(request, `/e2e/auth/verify-email/${userId}`);
}
