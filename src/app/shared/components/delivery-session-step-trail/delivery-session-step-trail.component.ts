import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

export interface DeliverySessionStepView {
  labelKey: string;
  sub?: string;
  done: boolean;
  current: boolean;
}

@Component({
  selector: 'app-delivery-session-step-trail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule],
  template: `
    <div class="delivery-session-step-trail" *transloco="let t">
      <p class="delivery-session-step-trail__heading">
        {{ t('delivery.detail.steps_title') }}
      </p>
      <ol class="delivery-session-step-trail__list">
        @for (step of steps(); track step.labelKey; let idx = $index; let last = $last) {
          <li
            class="delivery-session-step-trail__item"
            [class.delivery-session-step-trail__item--done]="step.done"
            [class.delivery-session-step-trail__item--current]="step.current"
          >
            <div class="delivery-session-step-trail__rail" aria-hidden="true">
              <span class="delivery-session-step-trail__dot">
                @if (step.done) {
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="3"
                    aria-hidden="true"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                } @else if (step.current) {
                  <span class="delivery-session-step-trail__dot-inner"></span>
                }
              </span>
              @if (!last) {
                <span class="delivery-session-step-trail__connector"></span>
              }
            </div>
            <div class="delivery-session-step-trail__text">
              <span class="delivery-session-step-trail__label">{{
                t(step.labelKey)
              }}</span>
              @if (step.sub) {
                <span class="delivery-session-step-trail__sub">{{ step.sub }}</span>
              }
            </div>
          </li>
        }
      </ol>
    </div>
  `,
  styleUrl: './delivery-session-step-trail.component.scss',
})
export class DeliverySessionStepTrailComponent {
  readonly steps = input.required<DeliverySessionStepView[]>();
}
