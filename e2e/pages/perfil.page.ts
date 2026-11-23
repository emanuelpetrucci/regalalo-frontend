import type { Page, Locator } from '@playwright/test';

export class PerfilPage {
  readonly profileCard: Locator;
  readonly loadingStatus: Locator;
  readonly statCards: Locator;

  constructor(private readonly page: Page) {
    this.profileCard = page.getByTestId('profile-private');
    this.loadingStatus = page.locator('[role="status"]');
    this.statCards = this.profileCard.locator('[role="list"]').locator('[role="listitem"]');
  }

  statValue(card: Locator): Locator {
    return card.locator('.perfil__stat-value');
  }

  async goto(): Promise<void> {
    await this.page.goto('/perfil');
  }

  async waitForLoad(): Promise<void> {
    await this.profileCard.waitFor({ state: 'visible', timeout: 10_000 });
  }
}
