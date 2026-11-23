import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-alert-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="alert-box"
      [class.alert-box--error]="variant() === 'error'"
      [class.alert-box--warning]="variant() === 'warning'"
      [class.alert-box--success]="variant() === 'success'"
      [attr.role]="variant() === 'error' ? 'alert' : 'status'"
    >
      <span class="alert-box__icon" aria-hidden="true">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
          />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </span>
      <div class="alert-box__content">
        <ng-content />
      </div>
    </div>
  `,
  styleUrl: './alert-box.component.scss',
})
export class AlertBoxComponent {
  readonly variant = input<'error' | 'warning' | 'success'>('error');
}
