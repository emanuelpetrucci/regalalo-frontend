import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-item-distance-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <span
      class="item-distance-chip"
      [class.item-distance-chip--large]="size() === 'large'"
      *transloco="let t"
    >
      <svg
        [attr.width]="size() === 'large' ? 11 : 10"
        [attr.height]="size() === 'large' ? 11 : 10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      {{ t('items.explore.distance_km', { km: km() }) }}@if (locationName(); as name) { · {{ name }}}
    </span>
  `,
  styleUrl: './item-distance-chip.component.scss',
})
export class ItemDistanceChipComponent {
  readonly km = input.required<string>();
  readonly size = input<'default' | 'large'>('default');
  readonly locationName = input<string | null>(null);
}
