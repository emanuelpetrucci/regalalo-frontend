import type { Page, Locator } from '@playwright/test';

export class MisObjetosPage {
  readonly publishLink: Locator;
  readonly loadingIndicator: Locator;
  readonly itemCards: Locator;
  readonly tabs: Locator;
  readonly candidateCards: Locator;
  readonly selectCandidateButtons: Locator;

  constructor(private readonly page: Page) {
    this.publishLink = page.locator('.mis-objetos__publish');
    this.loadingIndicator = page.locator('.mis-objetos__loading');
    this.itemCards = page.locator('.mis-objetos__row');
    this.tabs = page.locator('.mis-objetos__tabs button');
    this.candidateCards = page.getByTestId('candidate-card');
    this.selectCandidateButtons = page.getByTestId('select-candidate-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/mis-objetos');
  }

  async waitForLoad(): Promise<void> {
    // Wait for loading indicator to disappear (covers both success and error states)
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15_000 });
    // Then wait for the tabs nav or the alert box that indicates load is complete
    await this.page
      .locator('.mis-objetos__tabs, app-alert-box')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }
}
