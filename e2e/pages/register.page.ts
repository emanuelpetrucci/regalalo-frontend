import type { Page, Locator } from '@playwright/test';

export class RegisterPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly postalCodeInput: Locator;
  readonly phoneInput: Locator;
  readonly submitButton: Locator;
  readonly errorBanner: Locator;

  constructor(private readonly page: Page) {
    this.firstNameInput = page.getByTestId('register-first-name');
    this.lastNameInput = page.getByTestId('register-last-name');
    this.emailInput = page.getByTestId('register-email');
    this.passwordInput = page.getByTestId('register-password');
    this.postalCodeInput = page.getByTestId('register-postal-code');
    this.phoneInput = page.getByTestId('register-phone');
    this.submitButton = page.getByTestId('register-submit');
    this.errorBanner = page.locator('[aria-live="assertive"] app-alert-box');
  }

  async goto(): Promise<void> {
    await this.page.goto('/register');
  }

  async fillForm(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    postalCode: string;
    phone?: string;
  }): Promise<void> {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.passwordInput.fill(data.password);
    await this.postalCodeInput.fill(data.postalCode);
    if (data.phone) {
      await this.phoneInput.fill(data.phone);
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
