import { test, expect } from '../../fixtures/test';

test.use({ scenarioName: 'delivery-active' });
test.setTimeout(60_000);

test.describe('FR30 — entregas del usuario', () => {
  test('donor sees active delivery in entregas list', async ({ donorPage, scenario }) => {
    const { page } = donorPage;
    await page.goto('/entregas');
    await expect(page.getByTestId('deliveries-list')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('delivery-item').first()).toBeVisible();
    expect(scenario.entities.sessionId).toBeTruthy();
  });
});
