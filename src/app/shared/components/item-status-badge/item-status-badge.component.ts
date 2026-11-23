import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

export type ItemStatusBadgeStatus =
  | 'active'
  | 'reserved'
  | 'completed'
  | 'cancelled'
  | 'degraded'
  | 'paused';

@Component({
  selector: 'app-item-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <span
      class="item-status-badge"
      [class.item-status-badge--active]="status() === 'active'"
      [class.item-status-badge--reserved]="status() === 'reserved'"
      [class.item-status-badge--completed]="status() === 'completed'"
      [class.item-status-badge--cancelled]="status() === 'cancelled'"
      [class.item-status-badge--degraded]="status() === 'degraded'"
      [class.item-status-badge--paused]="status() === 'paused'"
      *transloco="let t"
    >
      <span class="item-status-badge__dot" aria-hidden="true"></span>
      {{ t(labelKey()) }}
    </span>
  `,
  styleUrl: './item-status-badge.component.scss',
})
export class ItemStatusBadgeComponent {
  readonly status = input.required<ItemStatusBadgeStatus>();
  /** `detail` usa etiquetas en minúsculas del detalle de item. */
  readonly labelScope = input<'my_objects' | 'detail'>('my_objects');

  readonly labelKey = computed(() => {
    const scope = this.labelScope();
    const status = this.status();
    return scope === 'detail'
      ? (`items.detail.status_${status}` as const)
      : (`items.my_objects.status_${status}` as const);
  });
}
