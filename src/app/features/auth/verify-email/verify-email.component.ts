import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  OnInit,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from '../../../core/api/generated/services/auth.service';
import { BtnComponent } from '../../../shared/components/btn/btn.component';

type VerifyEmailView = 'loading' | 'error';
type VerifyEmailErrorKind = 'invalid' | 'connection' | 'generic';

@Component({
  selector: 'app-verify-email',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoModule, BtnComponent],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  private readonly authApi = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly transloco = inject(TranslocoService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly injector = inject(Injector);

  private readonly errorCtaRef = viewChild<ElementRef<HTMLElement>>('errorCta');

  readonly token = this.route.snapshot.queryParamMap.get('token')?.trim() ?? '';
  readonly view = signal<VerifyEmailView>(this.token ? 'loading' : 'error');
  readonly errorKind = signal<VerifyEmailErrorKind>('invalid');
  readonly bannerError = signal<string | null>(null);

  private destroyed = false;
  private inFlight = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }

  ngOnInit(): void {
    if (!this.token) {
      this.showError('invalid', 'auth.verifyEmail.error.invalid');
      return;
    }
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    void this.verifyToken();
  }

  private showError(kind: VerifyEmailErrorKind, messageKey: string): void {
    this.errorKind.set(kind);
    this.bannerError.set(this.transloco.translate(messageKey));
    this.view.set('error');
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    afterNextRender(
      () => {
        if (this.destroyed || this.view() !== 'error') {
          return;
        }
        this.errorCtaRef()?.nativeElement.querySelector('button')?.focus();
      },
      { injector: this.injector },
    );
  }

  private async verifyToken(): Promise<void> {
    if (this.inFlight) return;
    this.inFlight = true;
    try {
      await this.authApi.authVerifyEmailGet({ token: this.token });
      if (this.destroyed) return;
      const navigated = await this.router.navigate(['/login'], {
        queryParams: { emailVerified: '1' },
      });
      if (!navigated) {
        this.showError('generic', 'auth.verifyEmail.error.generic');
      }
    } catch (err) {
      if (this.destroyed) return;
      if (err instanceof HttpErrorResponse) {
        if (err.status === 400) {
          this.showError('invalid', 'auth.verifyEmail.error.invalid');
          return;
        }
        if (err.status === 0) {
          this.showError('connection', 'auth.verifyEmail.error.connection');
          return;
        }
      }
      this.showError('generic', 'auth.verifyEmail.error.generic');
    } finally {
      this.inFlight = false;
    }
  }
}
