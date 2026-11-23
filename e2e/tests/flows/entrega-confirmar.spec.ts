import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { apiGetItem } from '../../helpers/api';

test.use({ scenarioName: 'delivery-active' });
test.setTimeout(60_000);

test.describe('F4 — Confirmar recepción', () => {
  test('donor confirms delivery and item becomes completed', async ({ donorPage, request, scenario }) => {
    const { page } = donorPage;
    const sessionId = scenario.entities.sessionId!;
    const itemId = scenario.entities.itemId!;
    const donor = scenario.actors['donor']!;

    const entrega = new EntregaDetallePage(page);
    await entrega.goto(sessionId);
    await entrega.confirmBtn.click();
    await entrega.confirmDeliveryBtn.click();

    await expect(entrega.statusBadge).toBeVisible({ timeout: 15_000 });

    const item = await apiGetItem(request, donor.token, itemId);
    expect(item.status).toBe('completed');
  });
});
