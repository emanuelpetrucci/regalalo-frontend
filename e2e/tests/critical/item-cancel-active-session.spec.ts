import { test, expect } from '../../fixtures/test';
import { apiGetItem } from '../../helpers/api';

test.use({ scenarioName: 'delivery-active' });
test.setTimeout(60_000);

test.describe('FR11 — cancelar objeto con sesión activa', () => {
  test('donor cancels item and item becomes cancelled', async ({ donorPage, request, scenario }) => {
    const { page } = donorPage;
    const itemId = scenario.entities.itemId!;
    const donor = scenario.actors['donor']!;

    await page.goto('/mis-objetos');
    await page.waitForLoadState('networkidle');
    const row = page.locator('.mis-objetos__row').first();
    await expect(row).toBeVisible({ timeout: 20_000 });
    await row.click();
    const cancelItemBtn = page.getByRole('button', { name: 'Cancelar objeto' });
    await expect(cancelItemBtn).toBeVisible({ timeout: 20_000 });
    await cancelItemBtn.click();
    await page.getByTestId('item-cancel-confirm-btn').click();

    await expect
      .poll(async () => (await apiGetItem(request, donor.token, itemId)).status)
      .toBe('cancelled');
  });
});
