import { test, expect } from '../../fixtures/test';
import { LoginPage } from '../../pages/login.page';
import { createVerifiedUser, cleanupUser } from '../../helpers/auth';

test.describe('Login', () => {
  test('shows email, password, and submit inputs', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('shows field validation errors on empty submit', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.submitButton.click();

    await expect(page.locator('.field__helper--error').first()).toBeVisible();
  });

  test('shows error banner on wrong credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('nobody@nowhere.invalid', 'wrongpass1234');

    await expect(loginPage.errorBanner).toBeVisible();
  });

  test('redirects away from login on successful login', async ({ page, request }) => {
    const session = await createVerifiedUser(request);

    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(session.user.email, session.password);

    // After login, app redirects to /onboarding (new user) or /explorar (returning user)
    await page.waitForURL(/\/(explorar|onboarding)/, { timeout: 15_000 });
    const url = page.url();
    expect(url).toMatch(/\/(explorar|onboarding)/);

    await cleanupUser(session.user.id);
  });

  test('shows session expired banner when returnUrl query param is present', async ({ page }) => {
    await page.goto('/login?returnUrl=%2Fexplorar');

    await expect(page.locator('app-alert-box').first()).toBeVisible();
  });
});
