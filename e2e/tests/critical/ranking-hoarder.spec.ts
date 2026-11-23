import { test, expect } from '../../fixtures/test';
import { apiGetCandidates } from '../../helpers/api';

test.describe('FR18 Tier 1 — penalización acaparador', () => {
  test.use({ scenarioName: 'ranking-hoarder-tier1' });

  test('hoarder ranks below clean receiver (effective score penalty)', async ({
    request,
    scenario,
  }) => {
    const donor = scenario.actors['donor']!;
    const candidates = await apiGetCandidates(request, donor.token, scenario.entities.itemId!);
    expect(candidates).toHaveLength(2);
    expect(candidates[0]?.firstName).toBe('Limpio');
    expect(candidates[1]?.firstName).toBe('Acaparador');
  });
});

test.describe('FR18 Tier 2 — exclusión acaparador', () => {
  test.use({ scenarioName: 'ranking-hoarder-tier2' });

  test('tier2 hoarder is excluded from candidate list', async ({ request, scenario }) => {
    const donor = scenario.actors['donor']!;
    const candidates = await apiGetCandidates(request, donor.token, scenario.entities.itemId!);
    expect(candidates).toHaveLength(1);
    expect(candidates[0]?.firstName).toBe('Limpio');
  });
});
