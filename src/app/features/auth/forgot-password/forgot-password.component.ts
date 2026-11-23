import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { mapForgotPasswordError } from './forgot-password-error.util';

type ForgotView = 'form' | 'sent';

@Component({
  selector: 'app-forgot-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoModule,
    FieldInputComponent,
    AlertBoxComponent,
    BtnComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly view = signal<ForgotView>('form');
  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });

    this.form
      .get('email')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.bannerError.set(null));
  }

  fieldError(): string | undefined {
    const control = this.form.get('email');
    if (!control || (!control.touched && !control.dirty) || control.valid) {
      return undefined;
    }
    return this.transloco.translate(
      control.hasError('required') ? 'auth.forgot.validation.email_required' : 'auth.forgot.validation.email_format',
    );
  }

  async onSubmit(): Promise<void> {
    if (this.inFlight || this.view() !== 'form') {
      return;
    }
    this.inFlight = true;

    this.bannerError.set(null);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.inFlight = false;
      return;
    }

    this.submitting.set(true);
    try {
      const { email } = this.form.getRawValue();
      await this.authApi.authForgotPasswordPost({ body: { email } });

      if (this.destroyed) {
        return;
      }

      this.view.set('sent');
    } catch (err) {
      if (this.destroyed) {
        return;
      }
      const mapped = mapForgotPasswordError(err);
      this.bannerError.set(this.transloco.translate(mapped.bannerKey));
    } finally {
      this.inFlight = false;
      this.submitting.set(false);
    }
  }
}
