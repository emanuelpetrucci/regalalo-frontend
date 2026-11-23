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
import { NgOptimizedImage } from '@angular/common';
import { TranslocoModule } from '@jsverse/transloco';
import { map } from 'rxjs';
import type { MyDeliverySession } from '../../../core/api/generated/models/my-delivery-session';
import { UsersService } from '../../../core/api/generated/services/users.service';
import { DeliverySessionStatusBadgeComponent } from '../../../shared/components/delivery-session-status-badge/delivery-session-status-badge.component';
import { UserAvatarComponent } from '../../../shared/components/user-avatar/user-avatar.component';
import { EntregaDetalleComponent } from '../entrega-detalle/entrega-detalle.component';

export type DeliveryRoleTab = 'donor' | 'receiver';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SESSION_PAGE_LIMIT = 50;

function daysUntilDeadline(iso: string): number | null {
  const ms = new Date(iso).getTime();
  if (!Number.isFinite(ms)) {
    return null;
  }
  return Math.ceil((ms - Date.now()) / 86_400_000);
}

@Component({
  selector: 'app-entregas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgOptimizedImage,
    TranslocoModule,
    DeliverySessionStatusBadgeComponent,
    UserAvatarComponent,
    EntregaDetalleComponent,
  ],
  templateUrl: './entregas.component.html',
  styleUrl: './entregas.component.scss',
})
export class EntregasComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersApi = inject(UsersService);

  private readonly routeSessionId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
    { initialValue: null as string | null },
  );

  readonly activeRole = signal<DeliveryRoleTab>('donor');
  readonly selectedSessionId = signal<string | null>(null);
  readonly sessions = signal<MyDeliverySession[]>([]);
  readonly loading = signal(false);
  readonly listErrorKey = signal<string | null>(null);
  readonly roleActiveCounts = signal({ donor: 0, receiver: 0 });

  private listLoadSeq = 0;
  private invalidRouteHandled = false;

  readonly hasSelection = computed(() => this.selectedSessionId() !== null);

  readonly activeTabId = computed(() =>
    this.activeRole() === 'donor' ? 'entregas-tab-donor' : 'entregas-tab-receiver',
  );

  readonly activeSessions = computed(() =>
    this.sessions().filter((s) => s.status === 'active'),
  );

  readonly historySessions = computed(() =>
    this.sessions().filter((s) => s.status !== 'active'),
  );

  readonly totalSessionCount = computed(() => this.sessions().length);

  constructor() {
    effect(() => {
      const routeId = this.routeSessionId();
      if (!routeId) {
        this.invalidRouteHandled = false;
        return;
      }
      if (!UUID_V4.test(routeId)) {
        this.selectedSessionId.set(null);
        if (!this.invalidRouteHandled) {
          this.invalidRouteHandled = true;
          void this.router.navigate(['/entregas'], { replaceUrl: true });
        }
        return;
      }
      this.invalidRouteHandled = false;
      this.selectedSessionId.set(routeId);
    });

    effect(() => {
      const role = this.activeRole();
      void this.loadSessions(role);
    });

    void this.loadRoleCounts();
  }

  daysLeft(session: MyDeliverySession): number | null {
    return daysUntilDeadline(session.deadlineAt);
  }

  deadlineShortLabel(session: MyDeliverySession): string {
    const days = this.daysLeft(session);
    if (days === null) {
      return '';
    }
    if (days <= 0) {
      return 'delivery.list.deadline_last_day';
    }
    return 'delivery.list.deadline_days';
  }

  deadlineShortParams(session: MyDeliverySession): { days: number } | undefined {
    const days = this.daysLeft(session);
    return days !== null && days > 0 ? { days } : undefined;
  }

  sessionRowLabelKey(session: MyDeliverySession): string {
    return session.role === 'receiver'
      ? 'delivery.list.row_as_receiver'
      : 'delivery.list.row_as_donor';
  }

  deadlineTone(session: MyDeliverySession): 'ok' | 'warn' | 'urgent' {
    const days = this.daysLeft(session);
    if (days === null) {
      return 'ok';
    }
    if (days <= 1) {
      return 'urgent';
    }
    if (days <= 3) {
      return 'warn';
    }
    return 'ok';
  }

  setRole(role: DeliveryRoleTab): void {
    if (this.activeRole() === role) {
      return;
    }
    this.closeDetail();
    this.activeRole.set(role);
  }

  selectSession(session: MyDeliverySession): void {
    this.selectedSessionId.set(session.id);
    void this.router.navigate(['/entregas', session.id]);
  }

  closeDetail(): void {
    this.selectedSessionId.set(null);
    void this.router.navigate(['/entregas']);
  }

  async onSessionUpdated(): Promise<void> {
    await Promise.all([this.loadSessions(this.activeRole()), this.loadRoleCounts()]);
  }

  private async loadRoleCounts(): Promise<void> {
    try {
      const [donorRes, receiverRes] = await Promise.all([
        this.usersApi.usersMeDeliverySessionsGet({
          role: 'donor',
          status: 'active',
          page: 1,
          limit: 1,
        }),
        this.usersApi.usersMeDeliverySessionsGet({
          role: 'receiver',
          status: 'active',
          page: 1,
          limit: 1,
        }),
      ]);
      this.roleActiveCounts.set({
        donor: donorRes.pagination?.total ?? 0,
        receiver: receiverRes.pagination?.total ?? 0,
      });
    } catch {
      this.roleActiveCounts.set({ donor: 0, receiver: 0 });
    }
  }

  private async loadSessions(role: DeliveryRoleTab): Promise<void> {
    const seq = ++this.listLoadSeq;
    this.loading.set(true);
    this.listErrorKey.set(null);

    try {
      const sessions = await this.fetchAllSessions({ role });
      if (seq !== this.listLoadSeq) {
        return;
      }
      this.sessions.set(sessions);

      const routeId = this.routeSessionId();
      const selectedId =
        this.selectedSessionId() ??
        (routeId && UUID_V4.test(routeId) ? routeId : null);

      if (selectedId && !sessions.some((s) => s.id === selectedId)) {
        const otherRole: DeliveryRoleTab = role === 'donor' ? 'receiver' : 'donor';
        const otherSessions = await this.fetchAllSessions({ role: otherRole });
        if (seq !== this.listLoadSeq) {
          return;
        }
        if (otherSessions.some((s) => s.id === selectedId)) {
          this.selectedSessionId.set(selectedId);
          if (this.activeRole() !== otherRole) {
            this.activeRole.set(otherRole);
          }
          return;
        }
        this.clearInvalidSelection();
      } else if (
        selectedId &&
        !this.selectedSessionId() &&
        sessions.some((s) => s.id === selectedId)
      ) {
        this.selectedSessionId.set(selectedId);
      }
    } catch {
      if (seq === this.listLoadSeq) {
        this.sessions.set([]);
        this.listErrorKey.set('delivery.list.errors.load_failed');
      }
    } finally {
      if (seq === this.listLoadSeq) {
        this.loading.set(false);
      }
    }
  }

  private async fetchAllSessions(params: {
    role: DeliveryRoleTab;
    status?: 'active' | 'completed' | 'cancelled' | 'expired';
  }): Promise<MyDeliverySession[]> {
    const res = await this.usersApi.usersMeDeliverySessionsGet({
      ...params,
      page: 1,
      limit: SESSION_PAGE_LIMIT,
    });
    const sessions = [...(res.sessions ?? [])];
    const totalPages = res.pagination?.totalPages ?? 1;
    for (let page = 2; page <= totalPages; page++) {
      const next = await this.usersApi.usersMeDeliverySessionsGet({
        ...params,
        page,
        limit: SESSION_PAGE_LIMIT,
      });
      sessions.push(...(next.sessions ?? []));
    }
    return sessions;
  }

  private clearInvalidSelection(): void {
    this.selectedSessionId.set(null);
    void this.router.navigate(['/entregas'], { replaceUrl: true });
  }
}
