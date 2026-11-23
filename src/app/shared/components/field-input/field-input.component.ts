import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

function slugifyLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Component({
  selector: 'app-field-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FieldInputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="field">
      <label class="field__label" [attr.for]="resolvedId()">{{ label() }}</label>
      <div class="field__control" [class.field__control--password]="isPassword()">
        <input
          [id]="resolvedId()"
          [type]="effectiveType()"
          [placeholder]="placeholder()"
          [value]="value()"
          [disabled]="isDisabled()"
          [attr.autocomplete]="autocomplete()"
          [attr.aria-invalid]="error() ? 'true' : null"
          [attr.aria-describedby]="describedBy()"
          [attr.data-testid]="testId() ?? null"
          [class.field__input--error]="!!error()"
          class="field__input"
          (input)="onInput($event)"
          (blur)="onBlur()"
        />
        @if (isPassword()) {
          <button
            type="button"
            class="field__toggle"
            [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            [attr.aria-pressed]="showPassword()"
            (click)="togglePassword()"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              @if (showPassword()) {
                <path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
              } @else {
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              }
            </svg>
          </button>
        }
      </div>
      @if (error() || helper()) {
        <span
          [id]="helperId()"
          class="field__helper"
          [class.field__helper--error]="!!error()"
        >
          {{ error() || helper() }}
        </span>
      }
    </div>
  `,
  styleUrl: './field-input.component.scss',
})
export class FieldInputComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly placeholder = input('');
  readonly error = input<string | undefined>(undefined);
  readonly helper = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly inputId = input<string | undefined>(undefined);
  readonly testId = input<string | undefined>(undefined);

  readonly showPassword = signal(false);
  readonly value = signal('');
  readonly isDisabled = signal(false);

  readonly resolvedId = computed(
    () => this.inputId() ?? `field-${slugifyLabel(this.label())}`,
  );

  readonly helperId = computed(() => `${this.resolvedId()}-helper`);

  readonly isPassword = computed(() => this.type() === 'password');

  readonly effectiveType = computed(() => {
    if (!this.isPassword()) {
      return this.type();
    }
    return this.showPassword() ? 'text' : 'password';
  });

  readonly describedBy = computed(() => {
    if (!this.error() && !this.helper()) {
      return null;
    }
    return this.helperId();
  });

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const next = (event.target as HTMLInputElement).value;
    this.value.set(next);
    this.onChange(next);
  }

  onBlur(): void {
    this.onTouched();
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
