import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { AlertBoxComponent } from '../../../shared/components/alert-box/alert-box.component';
import { BtnComponent } from '../../../shared/components/btn/btn.component';

@Component({
  selector: 'app-verification-pending',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule, AlertBoxComponent, BtnComponent],
  templateUrl: './verification-pending.component.html',
  styleUrl: './verification-pending.component.scss',
})
export class VerificationPendingComponent {
  private readonly authApi = inject(AuthService);
  private readonly transloco = inject(TranslocoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly cooldownSeconds = signal(0);
  readonly alreadyVerified = signal(false);
  readonly submitting = signal(false);
  readonly bannerError = signal<string | null>(null);
  readonly isInCooldown = computed(() => this.cooldownSeconds() > 0);

  private destroyed = false;
  private inFlight = false;
  private intervalRef: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.stopInterval();
    });
  }

  async onResend(): Promise<void> {
    if (this.inFlight || this.isInCooldown()) return;
    this.inFlight = true;
    this.bannerError.set(null);
    this.submitting.set(true);
    try {
      await this.authApi.authResendVerificationPost();
      if (this.destroyed) return;
      this.startCooldown(30);
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof HttpErrorResponse) {
        if (err.status === 429) {
          const raw = err.headers.get('Retry-After');
          const retryAfterSeconds = this.resolveRetryAfterSeconds(raw);
          this.startCooldown(retryAfterSeconds);
          return;
        }
        if (err.status === 409) {
          this.alreadyVerified.set(true);
          return;
        }
        if (err.status === 401) {
          // authErrorInterceptor handles this: clears token → /login
          return;
        }
        if (err.status === 0) {
          this.bannerError.set(
            this.transloco.translate('auth.verificationPending.error.connection'),
          );
          return;
        }
      }
      this.bannerError.set(
        this.transloco.translate('auth.verificationPending.error.generic'),
      );
    } finally {
      this.inFlight = false;
      this.submitting.set(false);
    }
  }

  private startCooldown(seconds: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopInterval();
    const normalizedSeconds = Math.max(0, Math.floor(seconds));
    this.cooldownSeconds.set(normalizedSeconds);
    if (normalizedSeconds <= 0) return;
    this.intervalRef = setInterval(() => {
      const next = this.cooldownSeconds() - 1;
      if (next <= 0) {
        this.cooldownSeconds.set(0);
        this.stopInterval();
      } else {
        this.cooldownSeconds.set(next);
      }
    }, 1000);
  }

  private stopInterval(): void {
    if (this.intervalRef !== null) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  private resolveRetryAfterSeconds(retryAfterHeader: string | null): number {
    const defaultSeconds = 30;

    if (!retryAfterHeader) {
      return defaultSeconds;
    }

    const numericValue = Number.parseInt(retryAfterHeader, 10);
    if (Number.isFinite(numericValue)) {
      return Math.max(1, numericValue);
    }

    const retryAtMs = Date.parse(retryAfterHeader);
    if (!Number.isNaN(retryAtMs)) {
      const secondsUntilRetry = Math.ceil((retryAtMs - Date.now()) / 1000);
      return Math.max(1, secondsUntilRetry);
    }

    return defaultSeconds;
  }
}
