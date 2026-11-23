import { test, expect } from '@playwright/test';
import { resetScenario, e2eIssueResetToken } from '../../helpers/e2e-api';
import { apiLogin, apiGetMeStatus } from '../../helpers/api';

const API_URL = 'http://localhost:3000/api';

test.describe('FR5–FR6 — recuperación de contraseña', () => {
  test('reset password invalidates previous JWT', async ({ request }) => {
    const scenario = await resetScenario(request, 'donor-only');
    const donor = scenario.actors['donor']!;
    const oldToken = donor.token;
    const resetToken = await e2eIssueResetToken(request, donor.id);
    const newPassword = 'NewTest1234!';

    const res = await request.post(`${API_URL}/auth/reset-password`, {
      data: { token: resetToken, newPassword },
    });
    expect(res.ok(), await res.text()).toBeTruthy();

    expect((await apiGetMeStatus(request, oldToken)).status).toBe(401);

    const { token: newToken } = await apiLogin(request, donor.email, newPassword);
    expect((await apiGetMeStatus(request, newToken)).status).toBe(200);
  });
});
