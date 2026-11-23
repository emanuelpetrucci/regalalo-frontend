import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import {
  itemCategoryLabelKey,
  type ItemCategory,
} from '../../../core/utils/item-category-label.util';

@Component({
  selector: 'app-item-category-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <span
      class="item-category-chip"
      [class.item-category-chip--large]="size() === 'large'"
      [class.item-category-chip--elevated]="surface() === 'elevated'"
      [class.item-category-chip--info]="variant() === 'info'"
      *transloco="let t"
    >
      {{ t(labelKey()) }}
    </span>
  `,
  styleUrl: './item-category-chip.component.scss',
})
export class ItemCategoryChipComponent {
  readonly category = input.required<ItemCategory>();
  readonly size = input<'default' | 'large'>('default');
  /** Mejor contraste sobre `--bg-surface` (p. ej. filas de mis-objetos). */
  readonly surface = input<'default' | 'elevated'>('default');
  /** `info` = CategoryChip azul del detalle de item (ItemDetail.jsx). */
  readonly variant = input<'default' | 'info'>('default');

  readonly labelKey = computed(() => itemCategoryLabelKey(this.category()));
}
