import { test, expect } from '../../fixtures/test';
import { ExplorarPage } from '../../pages/explorar.page';
import { MisObjetosPage } from '../../pages/mis-objetos.page';

test.use({ scenarioName: 'item-published' });
test.setTimeout(60_000);

test.describe('F2 — Solicitud del interesado', () => {
  test('receiver requests item and donor sees candidate', async ({ dualBrowser, scenario }) => {
    const { donorPage, receiverPage } = dualBrowser;
    const itemTitle = 'Objeto E2E de prueba';

    const explorar = new ExplorarPage(receiverPage);
    await explorar.goto();
    await explorar.waitForLoad();

    const card = receiverPage.locator('app-item-feed-card', { hasText: itemTitle }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();

    await receiverPage.getByTestId('item-request-btn').click();
    await receiverPage.locator('#request-contact-channel-value').fill('612345678');
    await receiverPage.locator('.request-contact-step__submit').click();

    await expect(receiverPage.getByTestId('request-success')).toBeVisible({ timeout: 10_000 });

    const misObjetos = new MisObjetosPage(donorPage);
    await misObjetos.goto();
    await misObjetos.waitForLoad();
    await donorPage.locator('.mis-objetos__row', { hasText: itemTitle }).click();
    await expect(donorPage.getByTestId('candidate-card')).toHaveCount(1, { timeout: 10_000 });

    expect(scenario.entities.itemId).toBeTruthy();
  });
});
