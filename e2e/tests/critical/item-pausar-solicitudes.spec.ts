import { test, expect } from '../../fixtures/test';
import { apiGetItemDetail } from '../../helpers/api';

test.use({ scenarioName: 'item-published' });
test.setTimeout(60_000);

test.describe('FR14 — pausar solicitudes', () => {
  test('donor pauses item and toggle reflects paused state', async ({ donorPage, request, scenario }) => {
    const { page } = donorPage;
    const itemId = scenario.entities.itemId!;
    const donor = scenario.actors['donor']!;

    await page.goto(`/items/${itemId}`);
    await expect(page.getByTestId('item-pause-toggle')).toBeVisible({ timeout: 15_000 });

    const pauseResponse = page.waitForResponse(
      (res) =>
        res.request().method() === 'PATCH' &&
        res.url().includes(`/items/${itemId}/pause`) &&
        res.ok(),
    );
    await page.getByTestId('item-pause-toggle').click();
    await pauseResponse;

    const item = await apiGetItemDetail(request, donor.token, itemId);
    expect(item.requestsPaused).toBe(true);
  });
});
