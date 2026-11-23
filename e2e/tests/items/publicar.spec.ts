import { test, expect } from '../../fixtures/test';
import { PublicarPage } from '../../pages/publicar.page';

test.describe('Publicar (publish item)', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/mis-objetos/publicar');
    await expect(page).toHaveURL(/\/login/);
  });

  test('step 1 shows title and description inputs', async ({ authPage }) => {
    const { page } = authPage;
    const publicarPage = new PublicarPage(page);
    await publicarPage.goto();

    await expect(publicarPage.titleInput).toBeVisible();
    await expect(publicarPage.descriptionInput).toBeVisible();
  });

  test('step 1 shows validation errors on empty next click', async ({ authPage }) => {
    const { page } = authPage;
    const publicarPage = new PublicarPage(page);
    await publicarPage.goto();
    await publicarPage.nextButton.click();

    const error = page.locator('.publicar__field-error, .field__helper--error').first();
    await expect(error).toBeVisible();
  });

  test('advances to step 2 after filling all step 1 fields', async ({ authPage }) => {
    const { page } = authPage;
    const publicarPage = new PublicarPage(page);
    await publicarPage.goto();

    // Fill all required step 1 fields
    await publicarPage.titleInput.fill('Enciclopedia Larousse completa');
    await publicarPage.descriptionInput.fill(
      'Colección completa en excelente estado, sin páginas dañadas.',
    );
    // Select condition: 'good' is the 3rd button (0-indexed: new, like_new, good, fair)
    await publicarPage.conditionButtons.nth(2).click();
    // Select category
    await publicarPage.categorySelect.selectOption('books');
    // Select weight range
    await publicarPage.weightRangeSelect.selectOption('lt1');
    // Fill postal code
    await publicarPage.postalCodeInput.fill('28001');

    await publicarPage.nextButton.click();

    await expect(publicarPage.stepIndicator).toContainText('2');
  });
});
