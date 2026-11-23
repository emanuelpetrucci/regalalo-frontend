import { test, expect } from '../../fixtures/test';
import { apiRequestItem } from '../../helpers/api';

test.use({ scenarioName: 'item-paused' });

test.describe('FR13 — solicitud en objeto pausado', () => {
  test('POST request returns 409', async ({ request, scenario }) => {
    const receiver = scenario.actors['receiver']!;
    const { status, body } = await apiRequestItem(
      request,
      receiver.token,
      scenario.entities.itemId!,
      'whatsapp:+5491100000099',
    );
    expect(status).toBe(409);
    expect(body.toLowerCase()).toMatch(/pause|pausad/);
  });
});
