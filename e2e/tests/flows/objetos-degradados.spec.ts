import { test, expect } from '../../fixtures/test';
import { ExplorarPage } from '../../pages/explorar.page';

test.use({ scenarioName: 'item-degraded' });
test.setTimeout(60_000);

test.describe('F8 — Objetos degradados', () => {
  test('shows degraded badge on explorar feed card', async ({ dualBrowser }) => {
    const { receiverPage } = dualBrowser;
    const explorar = new ExplorarPage(receiverPage);
    await explorar.goto();
    await explorar.waitForLoad();

    const degradedCard = receiverPage.locator('app-item-feed-card', {
      hasText: 'Objeto degradado E2E',
    });
    await expect(degradedCard.locator('.feed-card--degraded')).toBeVisible({ timeout: 15_000 });
    await expect(degradedCard.locator('.feed-card__degraded-badge')).toBeVisible();
  });
});
