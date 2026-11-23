import { test, expect } from '../../fixtures/test';
import { MisObjetosPage } from '../../pages/mis-objetos.page';
import { apiGetCandidates } from '../../helpers/api';

test.use({ scenarioName: 'ranking-three' });
test.setTimeout(90_000);

test.describe('F3 — Selección con ranking', () => {
  test('candidates are ordered by reputation and selection creates session', async ({
    donorPage,
    request,
    scenario,
  }) => {
    const { page } = donorPage;
    const donor = scenario.actors['donor']!;
    const itemId = scenario.entities.itemId!;

    const candidates = await apiGetCandidates(request, donor.token, itemId);
    expect(candidates.length).toBe(3);
    expect(candidates[0]!.reputationScore).toBeGreaterThan(candidates[2]!.reputationScore);

    const misObjetos = new MisObjetosPage(page);
    await misObjetos.goto();
    await misObjetos.waitForLoad();
    await page.locator('.mis-objetos__row', { hasText: 'Objeto ranking E2E' }).click();

    const cards = misObjetos.candidateCards;
    await expect(cards).toHaveCount(3);
    const firstScore = await cards.nth(0).locator('.candidate-row__score').textContent();
    const thirdScore = await cards.nth(2).locator('.candidate-row__score').textContent();
    if (firstScore && thirdScore) {
      const firstNum = parseInt(firstScore.replace(/\D/g, ''), 10);
      const thirdNum = parseInt(thirdScore.replace(/\D/g, ''), 10);
      expect(firstNum).toBeGreaterThan(thirdNum);
    }

    await misObjetos.selectCandidateButtons.first().click();
    const dialog = page.locator('.item-select-receiver-dialog__panel');
    await expect(dialog).toBeVisible({ timeout: 10_000 });
    const channelInput = page.locator('#select-channel-value');
    await channelInput.click();
    await channelInput.fill('612345678');
    await page.getByTestId('select-receiver-confirm').click();
    await expect(dialog).toBeHidden({ timeout: 20_000 });

    // Tras recargar la lista, el banner select-success puede limpiarse por itemId en URL;
    // el panel reservado confirma la sesión creada.
    await expect(page.locator('.mis-objetos__reserved-content')).toBeVisible({
      timeout: 20_000,
    });
  });
});
