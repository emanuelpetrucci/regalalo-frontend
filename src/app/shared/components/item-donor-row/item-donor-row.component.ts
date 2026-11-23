import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import type { ItemDonor } from '../../../core/api/generated/models/item-donor';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

@Component({
  selector: 'app-item-donor-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, RouterLink, UserAvatarComponent],
  templateUrl: './item-donor-row.component.html',
  styleUrl: './item-donor-row.component.scss',
})
export class ItemDonorRowComponent {
  readonly donor = input.required<ItemDonor>();
  readonly variant = input<'default' | 'anonymous'>('default');

  readonly isAnonymous = computed(() => this.donor().id == null || this.variant() === 'anonymous');

  readonly scoreDisplay = computed(() => {
    const score = this.donor().reputationScore;
    return score > 0 ? `+${score}` : String(score);
  });

  readonly scoreTone = computed(() => {
    const score = this.donor().reputationScore;
    if (score >= 60) return 'good';
    if (score >= 20) return 'fair';
    return 'low';
  });

  readonly repTone = computed(() => {
    const score = this.donor().reputationScore;
    if (score > 0) return 'positive';
    if (score === 0) return 'zero';
    return 'negative';
  });

  readonly reputationLabelKey = computed(() => {
    const tone = this.scoreTone();
    if (tone === 'good') return 'items.detail.reputation_good';
    if (tone === 'fair') return 'items.detail.reputation_fair';
    return 'items.detail.reputation_low';
  });
}
