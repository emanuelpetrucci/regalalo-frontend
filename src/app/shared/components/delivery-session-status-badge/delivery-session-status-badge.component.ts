import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

export type DeliverySessionStatusBadgeStatus =
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'expired';

@Component({
  selector: 'app-delivery-session-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <span
      class="delivery-session-status-badge"
      [class.delivery-session-status-badge--active]="status() === 'active'"
      [class.delivery-session-status-badge--completed]="status() === 'completed'"
      [class.delivery-session-status-badge--cancelled]="status() === 'cancelled'"
      [class.delivery-session-status-badge--expired]="status() === 'expired'"
      *transloco="let t"
    >
      {{ t(labelKey()) }}
    </span>
  `,
  styleUrl: './delivery-session-status-badge.component.scss',
})
export class DeliverySessionStatusBadgeComponent {
  readonly status = input.required<DeliverySessionStatusBadgeStatus>();

  readonly labelKey = computed(
    () => `delivery.detail.status_${this.status()}` as const,
  );
}
