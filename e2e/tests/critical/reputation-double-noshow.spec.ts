import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { apiGetMe, apiGetReputationHistory } from '../../helpers/api';

test.use({ scenarioName: 'receiver-second-noshow' });
test.setTimeout(60_000);

test.describe('FR22 — segunda penalización no-show', () => {
  test('second consecutive no-show applies -20 delta', async ({ donorPage, request, scenario }) => {
    const { page } = donorPage;
    const sessionId = scenario.entities.sessionId!;
    const receiver = scenario.actors['receiver']!;

    const before = await apiGetMe(request, receiver.token);

    const entrega = new EntregaDetallePage(page);
    await entrega.goto(sessionId);
    await entrega.cancelBtn.click();
    await entrega.noShowCheckbox.click();
    await entrega.cancelConfirmBtn.click();

    await expect
      .poll(async () => (await apiGetMe(request, receiver.token)).reputationScore)
      .toBe(before.reputationScore - 20);

    const history = await apiGetReputationHistory(request, receiver.token);
    expect(history.some((e) => e.delta === -20)).toBe(true);
  });
});
