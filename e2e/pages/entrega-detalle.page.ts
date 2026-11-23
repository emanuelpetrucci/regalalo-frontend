import type { Page, Locator } from '@playwright/test';

export class EntregaDetallePage {
  readonly statusBadge: Locator;
  readonly confirmBtn: Locator;
  readonly cancelBtn: Locator;
  readonly noShowCheckbox: Locator;
  readonly cancelConfirmBtn: Locator;
  readonly confirmDeliveryBtn: Locator;

  constructor(private readonly page: Page) {
    this.statusBadge = page.getByTestId('delivery-status');
    this.confirmBtn = page.getByTestId('delivery-confirm-btn');
    this.cancelBtn = page.getByTestId('delivery-cancel-btn');
    this.noShowCheckbox = page.getByTestId('delivery-noshow-toggle');
    this.cancelConfirmBtn = page.getByTestId('delivery-cancel-confirm-btn');
    this.confirmDeliveryBtn = page.getByTestId('confirm-delivery-btn');
  }

  async goto(sessionId: string): Promise<void> {
    await this.page.goto(`/entregas/${sessionId}`);
  }
}
