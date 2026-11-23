import { faker } from '@faker-js/faker';
import type { APIRequestContext, BrowserContext } from '@playwright/test';
import { apiRegister, apiLogin, apiGetMe, type ApiProfile } from './api';
import { verifyUserEmail, deleteUser } from './db';

export interface TestSession {
  token: string;
  user: ApiProfile;
  password: string;
}

const TOKEN_KEY = 'rgl_auth_token';
const USER_KEY = 'rgl_auth_user';

export function generateTestUser() {
  return {
    email: `e2e-${faker.string.alphanumeric(10)}@example.com`,
    password: 'Test1234!',
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    postalCode: '28001',
  };
}

/** Registers a user via API, marks email as verified in DB, and logs in. */
export async function createVerifiedUser(request: APIRequestContext): Promise<TestSession> {
  const userData = generateTestUser();
  const { token: registerToken } = await apiRegister(request, userData);

  // Decode JWT payload (base64url) to get the user ID
  const payloadB64 = registerToken.split('.')[1];
  const payload = JSON.parse(
    Buffer.from(payloadB64, 'base64url').toString('utf-8'),
  ) as { sub: string };

  await verifyUserEmail(payload.sub);

  // Log in again so the JWT reflects the current state
  const { token } = await apiLogin(request, userData.email, userData.password);
  const profile = await apiGetMe(request, token);

  return { token, user: profile, password: userData.password };
}

/** Injects JWT and user data into the browser context via localStorage init script. */
export async function injectSession(
  context: BrowserContext,
  session: TestSession,
): Promise<void> {
  await context.addInitScript(
    ({ tokenKey, userKey, token, user }) => {
      localStorage.setItem(tokenKey, token);
      localStorage.setItem(userKey, JSON.stringify(user));
    },
    { tokenKey: TOKEN_KEY, userKey: USER_KEY, token: session.token, user: session.user },
  );
}

/** Deletes a test user and all their cascade-deleted data. */
export async function cleanupUser(userId: string): Promise<void> {
  await deleteUser(userId);
}
