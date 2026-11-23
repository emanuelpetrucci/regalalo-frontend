import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-btn',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [attr.type]="type()"
      [class]="buttonClass()"
      [disabled]="disabled()"
    >
      <ng-content />
    </button>
  `,
  styleUrl: './btn.component.scss',
})
export class BtnComponent {
  readonly variant = input<
    'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost'
  >('primary');
  readonly fullWidth = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');

  buttonClass(): string {
    const classes = ['btn', `btn--${this.variant()}`];
    if (this.fullWidth()) {
      classes.push('btn--full');
    }
    return classes.join(' ');
  }
}
