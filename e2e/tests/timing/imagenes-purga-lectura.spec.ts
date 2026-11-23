import { test, expect } from '../../fixtures/test';
import { e2ePurgeImagesView } from '../../helpers/e2e-api';
import { apiGetItem } from '../../helpers/api';

test.use({ scenarioName: 'delivery-completed' });
test.setTimeout(60_000);

test.describe('Timing — purga de imágenes en lectura (FR34)', () => {
  test('GET item returns empty images after 31-day backdate', async ({ request, scenario }) => {
    const itemId = scenario.entities.itemId!;
    const donor = scenario.actors['donor']!;

    await e2ePurgeImagesView(request, itemId);

    const item = await apiGetItem(request, donor.token, itemId);
    expect(item.images ?? []).toHaveLength(0);
  });
});
