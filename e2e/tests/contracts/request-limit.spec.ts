import { test, expect } from '../../fixtures/test';
import { apiRequestItem } from '../../helpers/api';

test.use({ scenarioName: 'request-limit-reached' });

test.describe('FR12 — límite 3 solicitudes / 30 días', () => {
  test('fourth request in sliding window returns 409', async ({ request, scenario }) => {
    const receiver = scenario.actors['receiver']!;
    const { status, body } = await apiRequestItem(
      request,
      receiver.token,
      scenario.entities.itemId!,
      'whatsapp:+5491100000002',
    );
    expect(status).toBe(409);
    expect(body.toLowerCase()).toMatch(/limit|límite|solicitud/);
  });
});
