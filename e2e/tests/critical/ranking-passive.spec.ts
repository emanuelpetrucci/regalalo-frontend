import { test, expect } from '../../fixtures/test';
import { apiGetCandidates } from '../../helpers/api';

test.use({ scenarioName: 'ranking-passive-hidden' });

test.describe('FR17 — usuario pasivo excluido del ranking', () => {
  test('passive requester is not listed for donor', async ({ request, scenario }) => {
    const donor = scenario.actors['donor']!;
    const candidates = await apiGetCandidates(request, donor.token, scenario.entities.itemId!);
    expect(candidates).toHaveLength(0);
  });
});
