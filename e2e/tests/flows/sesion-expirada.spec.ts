import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { e2eExpireSession } from '../../helpers/e2e-api';
import { apiGetItem } from '../../helpers/api';

test.use({ scenarioName: 'delivery-active' });
test.setTimeout(60_000);

test.describe('F7 — Expiración por inactividad', () => {
  test('expired session shows expired status and item is requestable again', async ({
    dualBrowser,
    request,
    scenario,
  }) => {
    const { donorPage, receiverPage } = dualBrowser;
    const sessionId = scenario.entities.sessionId!;

    await e2eExpireSession(request, sessionId);

    const entrega = new EntregaDetallePage(donorPage);
    await entrega.goto(sessionId);
    await donorPage.reload();
    await expect(entrega.statusBadge).toBeVisible();

    const item = await apiGetItem(request, scenario.actors['receiver']!.token, scenario.entities.itemId!);
    expect(item.status).toBe('active');
  });
});
