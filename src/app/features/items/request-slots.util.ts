import type { MyRequest } from '../../core/api/generated/models/my-request';

/** Misma ventana que `request.repository.ts` (720 h ≈ 30 días). */
export const MONTHLY_REQUEST_LIMIT = 3;
export const REQUEST_WINDOW_MS = 720 * 60 * 60 * 1000;

export function countActiveRequestsInWindow(
  requests: MyRequest[],
  nowMs = Date.now(),
): number {
  return requests.filter((r) => {
    if (r.status !== 'pending' && r.status !== 'selected') {
      return false;
    }
    if (r.itemStatus === 'completed') {
      return false;
    }
    const created = new Date(r.createdAt).getTime();
    return nowMs - created < REQUEST_WINDOW_MS;
  }).length;
}

export function remainingRequestSlots(activeCount: number): number {
  return Math.max(0, MONTHLY_REQUEST_LIMIT - activeCount);
}
