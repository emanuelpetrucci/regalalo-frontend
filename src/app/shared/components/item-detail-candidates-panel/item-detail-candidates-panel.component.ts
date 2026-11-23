import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import type { RankedCandidate } from '../../../core/api/generated/models/ranked-candidate';
import { BtnComponent } from '../btn/btn.component';
import { CandidateRowComponent } from '../candidate-row/candidate-row.component';

@Component({
  selector: 'app-item-detail-candidates-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, BtnComponent, CandidateRowComponent],
  templateUrl: './item-detail-candidates-panel.component.html',
  styleUrl: './item-detail-candidates-panel.component.scss',
})
export class ItemDetailCandidatesPanelComponent {
  readonly candidates = input.required<RankedCandidate[]>();
  readonly loading = input(false);
  readonly errorKey = input<string | null>(null);
  readonly requestsPaused = input(false);

  readonly retry = output<void>();
  readonly select = output<RankedCandidate>();
}
