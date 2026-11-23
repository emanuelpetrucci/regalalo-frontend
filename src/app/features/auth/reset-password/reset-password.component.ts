import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { mapResetPasswordError } from './reset-password-error.util';

type ResetView = 'invalid' | 'form' | 'done';

@Component({
  selector: 'app-reset-password',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoModule,
    FieldInputComponent,
    AlertBoxComponent,
    BtnComponent,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
  readonly view = signal<ResetView>(this.token ? 'form' : 'invalid');
  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly mismatchTouched = signal(false);

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/\S/)]],
    confirmPassword: ['', [Validators.required]],
  });

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });

    (['newPassword', 'confirmPassword'] as const).forEach((key) => {
      this.form
        .get(key)
        ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.bannerError.set(null);
          this.mismatchTouched.set(false);
        });
    });
  }

  private passwordsMismatch(): boolean {
    const { newPassword, confirmPassword } = this.form.getRawValue();
    return (
      newPassword.trim().length > 0 &&
      confirmPassword.trim().length > 0 &&
      newPassword !== confirmPassword
    );
  }

  fieldError(controlName: 'newPassword' | 'confirmPassword'): string | undefined {
    if (controlName === 'confirmPassword' && this.mismatchTouched() && this.passwordsMismatch()) {
      return this.transloco.translate('auth.reset.validation.password_mismatch');
    }

    const control = this.form.get(controlName);
    if (!control || (!control.touched && !control.dirty) || control.valid) {
      return undefined;
    }

    if (controlName === 'newPassword') {
      if (control.hasError('required')) {
        return this.transloco.translate('auth.reset.validation.new_password_required');
      }
      if (control.hasError('minlength')) {
        return this.transloco.translate('auth.reset.validation.new_password_min');
      }
      if (control.hasError('pattern')) {
        return this.transloco.translate('auth.reset.validation.new_password_whitespace');
      }
    }

    return this.transloco.translate('auth.reset.validation.confirm_required');
  }

  async onSubmit(): Promise<void> {
    if (this.inFlight || this.view() !== 'form' || !this.token) {
      return;
    }
    this.inFlight = true;

    this.bannerError.set(null);
    this.form.markAllAsTouched();

    if (this.passwordsMismatch()) {
      this.mismatchTouched.set(true);
      this.inFlight = false;
      return;
    }

    if (this.form.invalid) {
      this.inFlight = false;
      return;
    }

    this.submitting.set(true);
    try {
      const { newPassword } = this.form.getRawValue();
      await this.authApi.authResetPasswordPost({
        body: { token: this.token, newPassword },
      });

      if (this.destroyed) {
        return;
      }

      this.view.set('done');
    } catch (err) {
      if (this.destroyed) {
        return;
      }
      const mapped = mapResetPasswordError(err);
      if (mapped.invalidToken) {
        this.view.set('invalid');
        return;
      }
      this.bannerError.set(
        this.transloco.translate(mapped.bannerKey ?? 'auth.reset.error.generic'),
      );
    } finally {
      this.inFlight = false;
      this.submitting.set(false);
    }
  }
}
