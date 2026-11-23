import { test, expect } from '../../fixtures/test';
import { MisObjetosPage } from '../../pages/mis-objetos.page';
import { apiPublishItem } from '../../helpers/api';

test.describe('Mis Objetos (my items)', () => {
  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/mis-objetos');
    await expect(page).toHaveURL(/\/login/);
  });

  test('shows title and publish button', async ({ authPage }) => {
    const { page } = authPage;
    const misObjetosPage = new MisObjetosPage(page);
    await misObjetosPage.goto();

    await expect(page.locator('.mis-objetos__title')).toBeVisible();
    await expect(misObjetosPage.publishLink).toBeVisible();
  });

  test('new user has no items', async ({ authPage }) => {
    const { page } = authPage;
    const misObjetosPage = new MisObjetosPage(page);
    await misObjetosPage.goto();
    await misObjetosPage.waitForLoad();

    await expect(misObjetosPage.itemCards).toHaveCount(0);
  });

  test('published item appears in the list', async ({ authPage, request }) => {
    const { page, session } = authPage;

    await apiPublishItem(request, session.token, {
      title: 'Silla de madera',
      description: 'En buen estado, sin rasguños',
      category: 'furniture',
      condition: 'good',
      postalCode: '28001',
    });

    const misObjetosPage = new MisObjetosPage(page);
    await misObjetosPage.goto();
    await misObjetosPage.waitForLoad();

    await expect(misObjetosPage.itemCards).toHaveCount(1);
  });
});
