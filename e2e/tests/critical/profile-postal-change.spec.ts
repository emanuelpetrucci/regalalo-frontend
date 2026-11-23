import { test, expect } from '../../fixtures/test';
import { PerfilPage } from '../../pages/perfil.page';
import { apiGetMeStatus } from '../../helpers/api';

test.use({ scenarioName: 'donor-only' });
test.setTimeout(60_000);

test.describe('FR39 — cambio de código postal', () => {
  test('changing postal code invalidates previous JWT', async ({ donorPage, request, scenario }) => {
    const { page } = donorPage;
    const donor = scenario.actors['donor']!;
    const oldToken = donor.token;

    const perfil = new PerfilPage(page);
    await perfil.goto();
    await perfil.waitForLoad();

    await page.getByRole('tab', { name: /configuración/i }).click();
    await expect(page.getByTestId('profile-settings-form')).toBeVisible();
    await page.getByTestId('profile-postal-input').fill('28002');

    const saveResponse = page.waitForResponse(
      (res) => res.request().method() === 'PATCH' && res.url().includes('/users/me') && res.ok(),
    );
    await page.getByTestId('profile-save-btn').click();
    await saveResponse;

    const oldSession = await apiGetMeStatus(request, oldToken);
    expect(oldSession.status).toBe(401);
  });
});
