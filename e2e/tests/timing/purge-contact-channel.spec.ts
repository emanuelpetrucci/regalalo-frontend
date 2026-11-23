import { test, expect } from '../../fixtures/test';
import { e2ePurgeContactChannel } from '../../helpers/e2e-api';
import { apiGetDeliverySession } from '../../helpers/api';

test.use({ scenarioName: 'delivery-completed' });
test.setTimeout(60_000);

test.describe('FR26 — purga canal de contacto', () => {
  test('contact channels are purged after e2e time helper', async ({ request, scenario }) => {
    const sessionId = scenario.entities.sessionId!;
    const receiver = scenario.actors['receiver']!;

    await e2ePurgeContactChannel(request, sessionId);

    const session = await apiGetDeliverySession(request, receiver.token, sessionId);
    expect(session.contactChannel ?? null).toBeFalsy();
  });
});
