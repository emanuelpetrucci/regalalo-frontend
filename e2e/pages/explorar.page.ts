import type { Page, Locator } from '@playwright/test';

export class ExplorarPage {
  readonly searchInput: Locator;
  readonly loadingIndicator: Locator;
  readonly itemCards: Locator;
  readonly emptyState: Locator;
  readonly loadMoreButton: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.locator('.explorar__search-input');
    this.loadingIndicator = page.locator('.explorar__loading');
    this.itemCards = page.locator('app-item-feed-card');
    this.emptyState = page.locator('.explorar__empty');
    this.loadMoreButton = page.locator('.explorar__load-more app-btn');
  }

  async goto(): Promise<void> {
    await this.page.goto('/explorar');
  }

  async waitForLoad(): Promise<void> {
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 10_000 });
  }

  async filterByCondition(conditionLabel: string): Promise<void> {
    await this.page
      .locator('.explorar__cond-chip', { hasText: conditionLabel })
      .click();
  }
}
