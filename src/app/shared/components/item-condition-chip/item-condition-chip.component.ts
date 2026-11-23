import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

export type ItemConditionChipCondition =
  | 'new'
  | 'like_new'
  | 'good'
  | 'fair';

@Component({
  selector: 'app-item-condition-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <span
      class="item-condition-chip"
      [class.item-condition-chip--large]="size() === 'large'"
      [class.item-condition-chip--muted]="variant() === 'muted'"
      [class.item-condition-chip--new]="variant() === 'colored' && condition() === 'new'"
      [class.item-condition-chip--like-new]="variant() === 'colored' && condition() === 'like_new'"
      [class.item-condition-chip--good]="variant() === 'colored' && condition() === 'good'"
      [class.item-condition-chip--fair]="variant() === 'colored' && condition() === 'fair'"
      *transloco="let t"
    >
      {{ t(labelKey()) }}
    </span>
  `,
  styleUrl: './item-condition-chip.component.scss',
})
export class ItemConditionChipComponent {
  readonly condition = input.required<ItemConditionChipCondition>();
  readonly size = input<'default' | 'large'>('default');
  /** `muted` = pill gris del detalle de item (ConditionPill en Detalle de item.html). */
  readonly variant = input<'colored' | 'muted'>('colored');

  readonly labelKey = computed(
    () => `items.publish.condition_${this.condition()}` as const,
  );
}
