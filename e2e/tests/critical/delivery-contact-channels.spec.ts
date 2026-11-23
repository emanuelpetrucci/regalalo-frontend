import { test, expect } from '../../fixtures/test';
import { EntregaDetallePage } from '../../pages/entrega-detalle.page';
import { apiGetDeliverySession } from '../../helpers/api';

test.use({ scenarioName: 'delivery-with-receiver-channel' });
test.setTimeout(60_000);

test.describe('FR50 — canales de contacto en sesión activa', () => {
  test('donor sees receiver contact channel in UI', async ({ donorPage, scenario }) => {
    const entrega = new EntregaDetallePage(donorPage.page);
    await entrega.goto(scenario.entities.sessionId!);
    await expect(donorPage.page.getByTestId('receiver-contact-channel')).toBeVisible({
      timeout: 15_000,
    });
  });

  test('API exposes channels per role', async ({ request, scenario }) => {
    const sessionId = scenario.entities.sessionId!;
    const donor = scenario.actors['donor']!;
    const receiver = scenario.actors['receiver']!;

    const asDonor = await apiGetDeliverySession(request, donor.token, sessionId);
    const asReceiver = await apiGetDeliverySession(request, receiver.token, sessionId);

    expect(asDonor.receiverContactChannel).toBeTruthy();
    expect(asReceiver.contactChannel).toBeTruthy();
  });
});
