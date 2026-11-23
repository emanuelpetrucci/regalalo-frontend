import { test, expect } from '../../fixtures/test';
import { PerfilPage } from '../../pages/perfil.page';

test.describe('Perfil (profile)', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/perfil');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows profile card with user name', async ({ authPage }) => {
    const { page, session } = authPage;
    const perfilPage = new PerfilPage(page);
    await perfilPage.goto();
    await perfilPage.waitForLoad();

    await expect(perfilPage.profileCard).toBeVisible();
    // displayName() = firstName + ' ' + lastName — firstName is always present
    await expect(page.getByTestId('profile-name')).toContainText(session.user.firstName);
  });

  test('shows reputation score', async ({ authPage }) => {
    const { page } = authPage;
    const perfilPage = new PerfilPage(page);
    await perfilPage.goto();
    await perfilPage.waitForLoad();

    // The first stat card is reputation — its value cell must contain a number (≥ 0)
    const reputationCard = perfilPage.statCards.first();
    await expect(reputationCard).toBeVisible();
    await expect(perfilPage.statValue(reputationCard)).toHaveText(/\d+/);
  });
});
