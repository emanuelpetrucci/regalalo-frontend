import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import type { PrivateProfile } from '../../../core/api/generated/models/private-profile';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { UsersService } from '../../../core/api/generated/services/users.service';
import {
  RecaptchaConfigError,
  RecaptchaService,
} from '../../../core/services/recaptcha.service';
import { SessionService } from '../../../core/services/session.service';
import { sessionUserFromPrivateProfile } from '../../../core/utils/session-user.util';
import { sanitizeReturnUrl } from '../../../core/utils/return-url.util';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';
import { FieldInputComponent } from '../../../shared/components/field-input/field-input.component';
import { isOnboardingDone } from '../../../core/constants/onboarding';
import { mapLoginError } from './login-error.util';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoModule,
    FieldInputComponent,
    AlertBoxComponent,
    BtnComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthService);
  private readonly usersApi = inject(UsersService);
  private readonly session = inject(SessionService);
  private readonly recaptcha = inject(RecaptchaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);

  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly sessionExpired = computed(
    () => !!this.route.snapshot.queryParamMap.get('returnUrl'),
  );
  readonly emailVerifiedSuccess = computed(
    () => this.route.snapshot.queryParamMap.get('emailVerified') === '1',
  );

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
    password: ['', [Validators.required]],
  });

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });

    (['email', 'password'] as const).forEach((key) => {
      this.form
        .get(key)
        ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.bannerError.set(null));
    });
  }

  fieldError(controlName: 'email' | 'password'): string | undefined {
    const control = this.form.get(controlName);
    if (!control || (!control.touched && !control.dirty) || control.valid) {
      return undefined;
    }
    if (controlName === 'email') {
      return this.transloco.translate(
        control.hasError('required')
          ? 'auth.login.validation.email_required'
          : 'auth.login.validation.email_format',
      );
    }
    return this.transloco.translate('auth.login.validation.password_required');
  }

  async onSubmit(): Promise<void> {
    if (this.inFlight) {
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
      const { email, password } = this.form.getRawValue();
      const recaptchaToken = await this.recaptcha.execute('login');
      const res = await this.authApi.authLoginPost({
        body: { email, password, recaptchaToken },
      });

      if (this.destroyed) return;

      this.session.setToken(res.token);

      let profile: PrivateProfile;
      try {
        profile = await this.usersApi.usersMeGet();
      } catch {
        if (this.destroyed) return;
        await this.router.navigate(['/verificacion-pendiente']);
        return;
      }

      if (this.destroyed) return;

      this.session.setUser(sessionUserFromPrivateProfile(profile));

      if (!profile.emailVerified) {
        await this.router.navigate(['/verificacion-pendiente']);
        return;
      }

      const returnUrl = sanitizeReturnUrl(
        this.route.snapshot.queryParamMap.get('returnUrl'),
      );
      this.recaptcha.removeFromDom();
      if (!isOnboardingDone()) {
        await this.router.navigate(['/onboarding'], returnUrl ? { queryParams: { returnUrl } } : {});
      } else {
        await this.router.navigateByUrl(returnUrl ?? '/explorar');
      }
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof RecaptchaConfigError) {
        this.bannerError.set(
          this.transloco.translate('auth.login.error.recaptcha_unavailable'),
        );
        return;
      }
      const mapped = mapLoginError(err);
      this.bannerError.set(this.transloco.translate(mapped.bannerKey));
    } finally {
      this.inFlight = false;
      this.submitting.set(false);
    }
  }
}
