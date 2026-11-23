import { test, expect } from '../../fixtures/test';

test.use({ scenarioName: 'item-published' });

test.describe('FR33 — perfil público', () => {
  test('public profile shows name without private email', async ({ dualBrowser, scenario }) => {
    const donor = scenario.actors['donor']!;
    const { receiverPage } = dualBrowser;

    await receiverPage.goto(`/users/${donor.id}`);
    await expect(receiverPage.getByTestId('public-profile-name')).toContainText(donor.firstName, {
      timeout: 15_000,
    });
    await expect(receiverPage.locator('body')).not.toContainText(donor.email);
  });
});
