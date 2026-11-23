import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import type { RegisterRequest } from '../../../core/api/generated/models/register-request';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import {
  RecaptchaConfigError,
  RecaptchaService,
} from '../../../core/services/recaptcha.service';
import { LocaleService } from '../../../core/i18n/locale.service';
import { AnalyticsEventsService } from '../../../core/services/analytics-events.service';
import { SessionService } from '../../../core/services/session.service';
import { sessionUserFromPrivateProfile } from '../../../core/utils/session-user.util';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { mapRegisterError } from './register-error.util';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSTAL_PATTERN = /^\d{5}$/;

type RegisterFieldName =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'password'
  | 'postalCode'
  | 'phone';

@Component({
  selector: 'app-register',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoModule,
    FieldInputComponent,
    AlertBoxComponent,
    BtnComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthService);
  private readonly usersApi = inject(UsersService);
  private readonly session = inject(SessionService);
  private readonly analytics = inject(AnalyticsEventsService);
  private readonly recaptcha = inject(RecaptchaService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);
  private readonly locale = inject(LocaleService);

  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly showLoginLink = signal(false);
  private readonly serverFieldErrorKeys = signal<Record<string, string>>({});

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    postalCode: ['', [Validators.required, Validators.pattern(POSTAL_PATTERN)]],
    phone: [''],
  });

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });

    (
      ['firstName', 'lastName', 'email', 'password', 'postalCode', 'phone'] as const
    ).forEach((key) => {
      this.form.get(key)?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.serverFieldErrorKeys()[key]) {
            const next = { ...this.serverFieldErrorKeys() };
            delete next[key];
            this.serverFieldErrorKeys.set(next);
          }
        });
    });
  }

  fieldError(controlName: RegisterFieldName): string | undefined {
    const serverKey = this.serverFieldErrorKeys()[controlName];
    if (serverKey) {
      return this.transloco.translate(serverKey);
    }
    const control = this.form.get(controlName);
    if (!control || (!control.touched && !control.dirty) || control.valid) {
      return undefined;
    }
    if (controlName === 'firstName') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.register.validation.first_name_required'
          : 'auth.register.validation.first_name_min',
      );
    }
    if (controlName === 'lastName') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.register.validation.last_name_required'
          : 'auth.register.validation.last_name_min',
      );
    }
    if (controlName === 'email') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.register.validation.email_required'
          : 'auth.register.validation.email_format',
      );
    }
    if (controlName === 'password') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.register.validation.password_required'
          : 'auth.register.validation.password_min',
      );
    }
    if (controlName === 'postalCode') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.register.validation.postal_required'
          : 'auth.register.validation.postal_format',
      );
    }
    return undefined;
  }

  postalHelper(): string | undefined {
    if (this.fieldError('postalCode')) {
      return undefined;
    }
    return this.transloco.translate('auth.register.validation.postal_helper');
  }

  async onSubmit(): Promise<void> {
    if (this.inFlight) {
      return;
    }
    this.inFlight = true;

    this.bannerError.set(null);
    this.showLoginLink.set(false);
    this.serverFieldErrorKeys.set({});

    const { firstName, lastName, phone } = this.form.getRawValue();
    this.form.patchValue({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.trim(),
    });

    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.inFlight = false;
      return;
    }

    this.submitting.set(true);
    try {
      const { firstName, lastName, email, password, postalCode, phone } =
        this.form.getRawValue();
      const recaptchaToken = await this.recaptcha.execute('register');
      const body: RegisterRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email,
        password,
        postalCode,
        recaptchaToken,
        language: this.locale.getActive(),
      };
      const trimmedPhone = phone.trim();
      if (trimmedPhone) {
        body.phone = trimmedPhone;
      }
      const res = await this.authApi.authRegisterPost({ body });

      if (this.destroyed) return;

      this.session.setToken(res.token);
      this.analytics.trackSignUp();

      let profile: PrivateProfile;
      try {
        profile = await this.usersApi.usersMeGet();
      } catch (err) {
        if (this.destroyed) return;
        if (err instanceof HttpErrorResponse && err.status === 401) {
          // authErrorInterceptor handles this: clears token → /login
          return;
        }
        await this.router.navigate(['/verificacion-pendiente']);
        return;
      }

      if (this.destroyed) return;

      this.session.setUser(sessionUserFromPrivateProfile(profile));
      this.recaptcha.removeFromDom();
      await this.router.navigate(['/verificacion-pendiente']);
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof RecaptchaConfigError) {
        this.bannerError.set(
          this.transloco.translate('auth.register.error.recaptcha_unavailable'),
        );
        return;
      }
      const mapped = mapRegisterError(err);
      if (mapped.bannerKey) {
        this.bannerError.set(this.transloco.translate(mapped.bannerKey));
        this.showLoginLink.set(mapped.showLoginLink ?? false);
      }
      if (mapped.fields) {
        this.serverFieldErrorKeys.set(mapped.fields);
      }
    } finally {
      this.inFlight = false;
      this.submitting.set(false);
    }
  }
}
