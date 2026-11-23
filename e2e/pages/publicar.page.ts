import type { Page, Locator } from '@playwright/test';

export class PublicarPage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly successBanner: Locator;
  readonly stepIndicator: Locator;
  readonly nextButton: Locator;
  readonly conditionButtons: Locator;
  readonly categorySelect: Locator;
  readonly weightRangeSelect: Locator;
  readonly postalCodeInput: Locator;
  readonly imageInput: Locator;
  readonly submitButton: Locator;
  readonly reviewPhotoCount: Locator;

  constructor(private readonly page: Page) {
    this.titleInput = page.getByTestId('publish-title');
    this.descriptionInput = page.getByTestId('publish-description');
    this.successBanner = page.getByTestId('publish-success');
    this.stepIndicator = page.locator('.publicar__step-label');
    // En pasos 2–3 el primer type=button es «Atrás»; «Continuar» es el último.
    this.nextButton = page.locator('.publicar__footer button[type="button"]').last();
    this.conditionButtons = page.locator('.publicar__condition-btn');
    this.categorySelect = page.getByTestId('publish-category');
    this.weightRangeSelect = page.getByTestId('publish-weight-range');
    this.postalCodeInput = page.locator('input[autocomplete="postal-code"]');
    this.imageInput = page.getByTestId('publish-images');
    this.submitButton = page.getByTestId('publish-submit');
    this.reviewPhotoCount = page.locator('.publicar__review-photo-count');
  }

  async goto(): Promise<void> {
    await this.page.goto('/mis-objetos/publicar');
  }

  async fillStep1(options?: {
    title?: string;
    description?: string;
    postalCode?: string;
  }): Promise<void> {
    await this.titleInput.fill(options?.title ?? 'Silla E2E de prueba');
    await this.descriptionInput.fill(
      options?.description ?? 'Objeto publicado en test E2E con descripción suficiente.',
    );
    await this.conditionButtons.first().click();
    await this.categorySelect.selectOption('furniture');
    await this.weightRangeSelect.selectOption('1to5');
    await this.postalCodeInput.fill(options?.postalCode ?? '28001');
  }

  async goToNextStep(): Promise<void> {
    await this.nextButton.click();
  }

  async waitForStep(step: 1 | 2 | 3): Promise<void> {
    if (step === 2) {
      await this.imageInput.waitFor({ state: 'attached', timeout: 45_000 });
      return;
    }
    if (step === 3) {
      await this.submitButton.waitFor({ state: 'visible', timeout: 15_000 });
      return;
    }
    await this.titleInput.waitFor({ state: 'visible', timeout: 15_000 });
  }

  async uploadImages(paths: string[]): Promise<void> {
    await this.imageInput.setInputFiles(paths);
  }

  async removeImageAt(index: number): Promise<void> {
    await this.page.locator('.picker__slot-remove').nth(index).click();
  }

  /** Avanza del paso 2 (fotos) al paso 3 (revisión). Un solo clic: en paso 3 el primer botón type=button es «Atrás». */
  async goToReview(): Promise<void> {
    await this.nextButton.click();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
