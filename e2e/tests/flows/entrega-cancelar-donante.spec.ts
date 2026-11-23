import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { apiGetMe, apiGetItem } from '../../helpers/api';

test.use({ scenarioName: 'delivery-active' });
test.setTimeout(60_000);

test.describe('F5 — Cancelar sin penalización', () => {
  test('cancels session without no-show and restores item', async ({ donorPage, request, scenario }) => {
    const { page } = donorPage;
    const sessionId = scenario.entities.sessionId!;
    const itemId = scenario.entities.itemId!;
    const receiver = scenario.actors['receiver']!;
    const donor = scenario.actors['donor']!;

    const receiverBefore = await apiGetMe(request, receiver.token);

    const entrega = new EntregaDetallePage(page);
    await entrega.goto(sessionId);
    await entrega.cancelBtn.click();
    await entrega.cancelConfirmBtn.click();

    const receiverAfter = await apiGetMe(request, receiver.token);
    expect(receiverAfter.reputationScore).toBe(receiverBefore.reputationScore);

    const item = await apiGetItem(request, donor.token, itemId);
    expect(item.status).toBe('active');
  });
});
