import { test, expect } from '../../fixtures/test';
import { RegisterPage } from '../../pages/register.page';
import { generateTestUser, cleanupUser, createVerifiedUser } from '../../helpers/auth';
import { faker } from '@faker-js/faker';

test.describe('Register', () => {
  test('shows all required form fields', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await expect(registerPage.firstNameInput).toBeVisible();
    await expect(registerPage.lastNameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.postalCodeInput).toBeVisible();
  });

  test('shows validation errors on empty submit', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.submit();

    await expect(page.locator('.field__helper--error').first()).toBeVisible();
  });

  test('shows postal code format error', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.postalCodeInput.fill('123');
    await registerPage.postalCodeInput.blur();

    await expect(page.locator('.field__helper--error')).toBeVisible();
  });

  test('redirects to /verificacion-pendiente on successful registration', async ({ page }) => {
    const user = generateTestUser();
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillForm(user);
    await registerPage.submit();

    await page.waitForURL('**/verificacion-pendiente', { timeout: 15_000 });
    await expect(page).toHaveURL('/verificacion-pendiente');

    // Extract userId from the stored JWT and clean up
    const tokenRaw = await page.evaluate(() => localStorage.getItem('rgl_auth_token'));
    if (tokenRaw) {
      const payload = JSON.parse(
        Buffer.from(tokenRaw.split('.')[1], 'base64').toString('utf-8'),
      ) as { sub: string };
      await cleanupUser(payload.sub);
    }
  });

  test('shows error when registering with an already used email', async ({
    page,
    request,
  }) => {
    const cu = cleanupUser;
    const existing = await createVerifiedUser(request);

    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.fillForm({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: existing.user.email,
      password: 'Test1234!',
      postalCode: '28001',
    });
    await registerPage.submit();

    await expect(registerPage.errorBanner).toBeVisible();
    await cu(existing.user.id);
  });
});
