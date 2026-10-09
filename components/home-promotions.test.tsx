import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { toast } from '@/hooks/use-toast';
import { HomePromotions } from './home-promotions';

vi.mock('@/hooks/use-toast', () => ({ toast: vi.fn() }));

const PROMO_KEY = 'hyperfolio_kestrell_promo_seen_v1';
const TOAST_KEY = 'hyperfolio_updates_toast_seen_v3';
const WELCOME_KEY = 'hyperfolio-welcome-seen';

function advancePromotion() {
  act(() => vi.advanceTimersByTime(1200));
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe('HomePromotions', () => {
  it('leaves new visitors in onboarding, even if they dismiss it quickly', () => {
    render(<HomePromotions />);
    localStorage.setItem(WELCOME_KEY, 'true');
    advancePromotion();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
    expect(localStorage.getItem(PROMO_KEY)).toBeNull();
  });

  it('shows the popup once and keeps the notification for a later visit', () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    const firstVisit = render(<HomePromotions />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    advancePromotion();

    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Copy traders. Right from Telegram.'
    );
    expect(screen.getByRole('link', { name: /Open Kestrell/ })).toHaveAttribute(
      'href',
      'https://t.me/kestrell_hip4_bot'
    );
    expect(screen.getByRole('link', { name: /How it works/ })).toHaveAttribute(
      'href',
      'https://kestrell.xyz/'
    );
    expect(localStorage.getItem(PROMO_KEY)).toBe('1');
    expect(toast).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Maybe later' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    advancePromotion();
    expect(toast).not.toHaveBeenCalled();
    firstVisit.unmount();

    const secondVisit = render(<HomePromotions />);
    advancePromotion();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toast).toHaveBeenCalledTimes(1);
    const notification = vi.mocked(toast).mock.calls[0][0];
    expect(notification.duration).toBe(12000);
    render(<>{notification.description}</>);
    expect(screen.getByRole('link', { name: /Open Kestrell/ })).toHaveAttribute(
      'href',
      'https://t.me/kestrell_hip4_bot'
    );
    expect(
      screen.getByRole('link', { name: '@hyperfoliothebot' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'API documentation' })
    ).toBeInTheDocument();
    expect(localStorage.getItem(TOAST_KEY)).toBe('1');
    secondVisit.unmount();

    render(<HomePromotions />);
    advancePromotion();
    expect(toast).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes the popup when the Telegram link is clicked', () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    render(<HomePromotions />);
    advancePromotion();

    const link = screen.getByRole('link', { name: /Open Kestrell/ });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    fireEvent.click(link);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([false, true])(
    'does not interrupt an active dialog (promo already seen: %s)',
    (seen) => {
      localStorage.setItem(WELCOME_KEY, 'true');
      if (seen) localStorage.setItem(PROMO_KEY, '1');
      render(
        <>
          <div role="dialog" aria-label="Add wallet" />
          <HomePromotions />
        </>
      );
      advancePromotion();

      expect(screen.getAllByRole('dialog')).toHaveLength(1);
      expect(toast).not.toHaveBeenCalled();
      expect(localStorage.getItem(TOAST_KEY)).toBeNull();
    }
  );

  it('cancels pending promotions when leaving the page', () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    const view = render(<HomePromotions />);
    view.unmount();
    advancePromotion();

    expect(localStorage.getItem(PROMO_KEY)).toBeNull();
    expect(toast).not.toHaveBeenCalled();
  });

  it.each(['getItem', 'setItem'] as const)(
    'skips promotions if storage %s fails',
    (method) => {
      localStorage.setItem(WELCOME_KEY, 'true');
      vi.spyOn(localStorage, method).mockImplementation(() => {
        throw new DOMException('Storage unavailable', 'SecurityError');
      });
      render(<HomePromotions />);
      advancePromotion();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(toast).not.toHaveBeenCalled();
    }
  );

  it('skips promotions if storage becomes unavailable after mounting', () => {
    localStorage.setItem(WELCOME_KEY, 'true');
    render(<HomePromotions />);
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage unavailable', 'SecurityError');
    });
    advancePromotion();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
  });
});
