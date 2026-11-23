import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { apiGetMe } from '../../helpers/api';

test.use({ scenarioName: 'donor-first-donation' });
test.setTimeout(60_000);

test.describe('FR21 — primera donación +15', () => {
  test('first completed donation gives donor +15 reputation', async ({
    donorPage,
    request,
    scenario,
  }) => {
    const { page } = donorPage;
    const sessionId = scenario.entities.sessionId!;
    const donor = scenario.actors['donor']!;

    const before = await apiGetMe(request, donor.token);
    expect(before.totalDonated).toBe(0);

    const entrega = new EntregaDetallePage(page);
    await entrega.goto(sessionId);
    await entrega.confirmBtn.click();
    await entrega.confirmDeliveryBtn.click();
    await expect(entrega.statusBadge).toBeVisible({ timeout: 15_000 });

    const after = await apiGetMe(request, donor.token);
    expect(after.reputationScore).toBe(before.reputationScore + 15);
    expect(after.totalDonated).toBe(1);
  });
});
