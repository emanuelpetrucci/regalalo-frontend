import { test, expect } from '../../fixtures/test';
import { apiGetMeStatus } from '../../helpers/api';

test.use({ scenarioName: 'unverified-user' });

test('GET /users/me returns 403 EMAIL_NOT_VERIFIED', async ({ request, scenario }) => {
  const user = scenario.actors['user']!;
  const { status, body } = await apiGetMeStatus(request, user.token);
  expect(status).toBe(403);
  expect(body).toMatch(/EMAIL_NOT_VERIFIED/i);
});
