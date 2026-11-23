import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { map } from 'rxjs';
import type { PublicProfile } from '../../../core/api/generated/models/public-profile';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { SessionService } from '../../../core/services/session.service';
import { displayNameFromParts } from '../../../core/utils/user-display.util';
import { ReportModalComponent } from '../../../shared/components/report-modal/report-modal.component';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-perfil-publico',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, UserAvatarComponent, ReportModalComponent],
  templateUrl: './perfil-publico.component.html',
  styleUrl: './perfil-publico.component.scss',
})
export class PerfilPublicoComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly usersApi = inject(UsersService);
  private readonly transloco = inject(TranslocoService);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly session = inject(SessionService);

  readonly userId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );

  readonly loading = signal(true);
  readonly errorKey = signal<string | null>(null);
  readonly profile = signal<PublicProfile | null>(null);
  readonly reportModalOpen = signal(false);

  private loadSeq = 0;
  private reportTriggerEl: HTMLElement | null = null;

  readonly canReport = computed(() => {
    const u = this.session.user();
    return this.session.isLoggedIn() && u?.emailVerified === true && u?.id !== this.userId();
  });

  readonly displayName = computed(() => {
    const p = this.profile();
    if (!p) return '';
    return displayNameFromParts(p.firstName, p.lastName);
  });

  readonly memberSince = computed(() => {
    const p = this.profile();
    if (!p) return '';
    const ms = new Date(p.createdAt).getTime();
    if (!Number.isFinite(ms)) return '—';
    return new Intl.DateTimeFormat(this.transloco.getActiveLang(), {
      month: 'long',
      year: 'numeric',
    }).format(ms);
  });

  readonly scoreDisplay = computed(() => {
    const p = this.profile();
    if (!p) return '0';
    const s = p.reputationScore;
    return s > 0 ? `+${s}` : String(s);
  });

  readonly scoreTone = computed<'good' | 'muted' | 'low'>(() => {
    const p = this.profile();
    if (!p) return 'muted';
    const s = p.reputationScore;
    if (s > 0) return 'good';
    if (s < 0) return 'low';
    return 'muted';
  });

  constructor() {
    effect(() => {
      const id = this.userId();
      if (!id) {
        this.loading.set(false);
        this.errorKey.set('profile.public.errors.invalid_id');
        this.profile.set(null);
        return;
      }

      const sessionUserId = this.session.getUser()?.id;
      if (sessionUserId && sessionUserId === id) {
        this.loading.set(false);
        this.errorKey.set(null);
        this.profile.set(null);
        void this.router.navigate(['/perfil'], { replaceUrl: true });
        return;
      }

      void this.loadProfile(id);
    });
  }

  openReportModal(event: Event): void {
    this.reportTriggerEl = ((event.currentTarget ?? event.target) as HTMLElement) ?? null;
    this.reportModalOpen.set(true);
  }

  onReportClosed(): void {
    this.reportModalOpen.set(false);
    this.reportTriggerEl?.focus();
    this.reportTriggerEl = null;
  }

  onReportSubmitted(): void {
    this.reportModalOpen.set(false);
    this.reportTriggerEl?.focus();
    this.reportTriggerEl = null;
  }

  goBack(): void {
    if (typeof history !== 'undefined' && history.length > 1) {
      this.location.back();
      return;
    }
    void this.router.navigate(['/explorar']);
  }

  goExplore(): void {
    void this.router.navigate(['/explorar']);
  }

  async retry(): Promise<void> {
    const id = this.userId();
    if (!id || !UUID_V4.test(id)) {
      return;
    }
    await this.loadProfile(id);
  }

  private async loadProfile(id: string): Promise<void> {
    if (!UUID_V4.test(id)) {
      this.loading.set(false);
      this.errorKey.set('profile.public.errors.invalid_id');
      this.profile.set(null);
      return;
    }

    const seq = ++this.loadSeq;
    this.loading.set(true);
    this.errorKey.set(null);

    try {
      const profile = await this.usersApi.usersIdGet({ id });
      if (seq !== this.loadSeq) {
        return;
      }
      this.profile.set(profile);
    } catch (err) {
      if (seq !== this.loadSeq) {
        return;
      }
      this.profile.set(null);
      if (err instanceof HttpErrorResponse) {
        if (err.status === 404) {
          this.errorKey.set('profile.public.errors.not_found');
        } else if (err.status === 400) {
          this.errorKey.set('profile.public.errors.invalid_id');
        } else {
          this.errorKey.set('profile.public.errors.load');
        }
      } else {
        this.errorKey.set('profile.public.errors.load');
      }
    } finally {
      if (seq === this.loadSeq) {
        this.loading.set(false);
      }
    }
  }
}
