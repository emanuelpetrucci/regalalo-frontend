import type { MyRequest } from '../../core/api/generated/models/my-request';
import {
  countActiveRequestsInWindow,
  remainingRequestSlots,
  REQUEST_WINDOW_MS,
} from './request-slots.util';

function request(partial: Partial<MyRequest> & Pick<MyRequest, 'status' | 'createdAt'>): MyRequest {
  return {
    id: 'r1',
    itemId: 'i1',
    itemTitle: 'Item',
    itemStatus: 'active',
    images: [],
    ...partial,
  };
}

describe('request-slots.util', () => {
  const now = Date.UTC(2026, 4, 22, 12, 0, 0);

  it('counts pending and selected within the window', () => {
    const inside = new Date(now - REQUEST_WINDOW_MS + 1000).toISOString();
    const outside = new Date(now - REQUEST_WINDOW_MS - 1000).toISOString();

    const count = countActiveRequestsInWindow(
      [
        request({ status: 'pending', createdAt: inside }),
        request({ status: 'selected', createdAt: inside }),
        request({ status: 'rejected', createdAt: inside }),
        request({ status: 'pending', createdAt: outside }),
      ],
      now,
    );

    expect(count).toBe(2);
  });

  it('excludes selected requests whose item is already completed', () => {
    const inside = new Date(now - REQUEST_WINDOW_MS + 1000).toISOString();

    const count = countActiveRequestsInWindow(
      [
        request({ status: 'selected', itemStatus: 'completed', createdAt: inside }),
        request({ status: 'pending', createdAt: inside }),
      ],
      now,
    );

    expect(count).toBe(1);
  });

  it('computes remaining slots up to zero', () => {
    expect(remainingRequestSlots(0)).toBe(3);
    expect(remainingRequestSlots(2)).toBe(1);
    expect(remainingRequestSlots(3)).toBe(0);
    expect(remainingRequestSlots(5)).toBe(0);
  });
});
