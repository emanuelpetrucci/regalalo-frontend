import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { apiGetMe } from '../../helpers/api';

test.use({ scenarioName: 'delivery-active' });
test.setTimeout(60_000);

test.describe('F6 — Cancelar con penalización (no-show)', () => {
  test('declares no-show and lowers receiver reputation by 10', async ({
    donorPage,
    request,
    scenario,
  }) => {
    const { page } = donorPage;
    const sessionId = scenario.entities.sessionId!;
    const receiver = scenario.actors['receiver']!;

    const before = await apiGetMe(request, receiver.token);

    const entrega = new EntregaDetallePage(page);
    await entrega.goto(sessionId);
    await entrega.cancelBtn.click();
    await entrega.noShowCheckbox.click();

    const cancelResponse = page.waitForResponse(
      (res) =>
        res.request().method() === 'POST' &&
        res.url().includes(`/delivery-sessions/${sessionId}/cancel`) &&
        res.ok(),
    );
    await entrega.cancelConfirmBtn.click();
    const cancelRes = await cancelResponse;
    expect(cancelRes.request().postDataJSON()).toMatchObject({ noShow: true });

    const after = await apiGetMe(request, receiver.token);
    expect(after.reputationScore).toBe(before.reputationScore - 10);
  });
});
