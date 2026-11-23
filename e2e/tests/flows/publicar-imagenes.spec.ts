import path from 'path';
import { test, expect } from '../../fixtures/test';
import { PublicarPage } from '../../pages/publicar.page';

test.use({ scenarioName: 'donor-only' });
test.setTimeout(90_000);

test.describe('F9 — Eliminar imágenes en publicación', () => {
  test('uploads two images, removes one, publishes with one photo', async ({ donorPage }) => {
    const { page } = donorPage;
    const publicar = new PublicarPage(page);
    const imagePath = path.join(__dirname, '../../assets/test-image.jpg');

    await publicar.goto();
    await publicar.fillStep1();
    await publicar.goToNextStep();
    await publicar.waitForStep(2);
    await publicar.uploadImages([imagePath, imagePath]);
    await page.locator('.picker__slot-remove').first().click();
    await publicar.goToReview();
    await publicar.waitForStep(3);
    await publicar.submit();
    await expect(publicar.successBanner).toBeVisible({ timeout: 15_000 });
  });
});
