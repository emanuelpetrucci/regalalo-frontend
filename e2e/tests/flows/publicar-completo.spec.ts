import path from 'path';
import { test, expect } from '../../fixtures/test';
import { PublicarPage } from '../../pages/publicar.page';
import { MisObjetosPage } from '../../pages/mis-objetos.page';

test.use({ scenarioName: 'donor-only' });
test.setTimeout(90_000);

test.describe('F1 — Publicación completa', () => {
  test('donor publishes item through 3-step wizard with photo', async ({ donorPage }) => {
    const { page } = donorPage;
    const publicar = new PublicarPage(page);
    const misObjetos = new MisObjetosPage(page);
    const imagePath = path.join(__dirname, '../../assets/test-image.jpg');

    await publicar.goto();
    await publicar.fillStep1({ title: 'Mesa E2E flujo completo' });
    await publicar.goToNextStep();
    await publicar.waitForStep(2);
    await publicar.uploadImages([imagePath]);
    await publicar.goToReview();
    await publicar.waitForStep(3);
    await publicar.submit();

    await expect(publicar.successBanner).toBeVisible({ timeout: 15_000 });

    await misObjetos.goto();
    await misObjetos.waitForLoad();
    await expect(page.getByText('Mesa E2E flujo completo')).toBeVisible();
  });
});
