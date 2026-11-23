import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { formatDistanceKm } from '../../../core/utils/format-distance.util';
import { BtnComponent } from '../btn/btn.component';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';

function daysSinceRequestDate(iso: string): number | null {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) {
    return null;
  }
  return Math.floor((Date.now() - ms) / 86_400_000);
}

@Component({
  selector: 'app-candidate-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent, RouterLink, UserAvatarComponent],
  templateUrl: './candidate-row.component.html',
  styleUrl: './candidate-row.component.scss',
  host: {
    class: 'candidate-row',
    role: 'listitem',
    '[class.candidate-row--top]': 'rank() === 1',
    '[class.candidate-row--last]': 'last()',
  },
})
export class CandidateRowComponent {
  readonly candidate = input.required<RankedCandidate>();
  readonly rank = input.required<number>();
  readonly last = input(false);
  readonly selectDisabled = input(false);

  readonly select = output<RankedCandidate>();

  readonly scoreDisplay = computed(() => {
    const score = this.candidate().reputationScore;
    return score > 0 ? `+${score}` : `${score}`;
  });

  readonly scoreTone = computed(() => {
    const score = this.candidate().reputationScore;
    if (score >= 60) return 'good';
    if (score >= 20) return 'fair';
    return 'low';
  });

  readonly distanceKm = computed(() =>
    formatDistanceKm(this.candidate().distanceMeters),
  );
  readonly locationName = computed(() => this.candidate().locationName ?? null);

  readonly requestAgoKey = computed(() => {
    const days = daysSinceRequestDate(this.candidate().requestDate);
    if (days === null) {
      return 'items.my_objects.days_today';
    }
    if (days <= 0) {
      return 'items.my_objects.days_today';
    }
    if (days === 1) {
      return 'items.my_objects.days_yesterday';
    }
    return 'items.my_objects.days_ago';
  });

  readonly requestAgoParams = computed(() => {
    const days = daysSinceRequestDate(this.candidate().requestDate);
    return days !== null && days > 1 ? { days } : undefined;
  });

  readonly selectAriaLabelKey = computed(() =>
    this.selectDisabled()
      ? 'items.my_objects.select_disabled_paused'
      : 'items.my_objects.select_candidate',
  );

  readonly selectAriaLabelParams = computed(() => ({ rank: this.rank() }));

  onSelectClick(): void {
    if (this.selectDisabled()) {
      return;
    }
    this.select.emit(this.candidate());
  }
}
