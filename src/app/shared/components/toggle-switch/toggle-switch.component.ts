import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-toggle-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="toggle-switch"
      [class.toggle-switch--checked]="checked()"
      role="switch"
      [attr.aria-checked]="checked()"
      [attr.aria-labelledby]="labelId() || null"
      [attr.aria-label]="labelId() ? null : ariaLabel() || null"
      [attr.data-testid]="testId() ?? null"
      [disabled]="disabled()"
      (click)="onToggle()"
    >
      <span class="toggle-switch__thumb" aria-hidden="true"></span>
    </button>
  `,
  styleUrl: './toggle-switch.component.scss',
})
export class ToggleSwitchComponent {
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly labelId = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly testId = input<string | undefined>(undefined);

  readonly checkedChange = output<boolean>();

  onToggle(): void {
    if (this.disabled()) {
      return;
    }
    this.checkedChange.emit(!this.checked());
  }
}
