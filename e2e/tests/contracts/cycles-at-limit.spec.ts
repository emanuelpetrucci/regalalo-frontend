import { test, expect } from '../../fixtures/test';
import { e2eIncrementCyclesAtLimit } from '../../helpers/e2e-api';

test.use({ scenarioName: 'request-limit-reached' });

test.describe('FR27 — cycles_at_limit (E2E time)', () => {
  test('increment-cycles endpoint succeeds for user at request limit', async ({
    request,
    scenario,
  }) => {
    const receiver = scenario.actors['receiver']!;
    await expect(e2eIncrementCyclesAtLimit(request, receiver.id)).resolves.toBeUndefined();
  });
});
