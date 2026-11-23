import { test, expect } from '../../fixtures/test';
import { injectSession, type TestSession } from '../../helpers/auth';
import { apiGetMeStatus } from '../../helpers/api';

test.use({ scenarioName: 'unverified-user' });

test.describe('FR46 — email no verificado', () => {
  test('protected API returns 403 for unverified user', async ({ request, scenario }) => {
    const user = scenario.actors['user']!;
    const { status, body } = await apiGetMeStatus(request, user.token);
    expect(status).toBe(403);
    expect(body).toMatch(/EMAIL_NOT_VERIFIED|verif/i);
  });

  test('unverified user is redirected away from explorar', async ({ browser, scenario }) => {
    const actor = scenario.actors['user']!;
    const session: TestSession = {
      token: actor.token,
      password: actor.password,
      user: {
        id: actor.id,
        email: actor.email,
        firstName: actor.firstName,
        lastName: actor.lastName,
        emailVerified: false,
        reputationScore: 10,
        postalCode: '1001',
        totalDonated: 0,
        totalReceived: 0,
      },
    };
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();
    await page.goto('/explorar');
    await expect(page).toHaveURL(/login|verificacion-pendiente/, { timeout: 15_000 });
    await page.close();
    await context.close();
  });
});
