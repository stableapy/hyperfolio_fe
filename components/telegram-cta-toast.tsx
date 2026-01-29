'use client';

import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const TOAST_KEY = 'hyperfolio_tg_toast_dismissed_v1';

export function TelegramCtaToast() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(TOAST_KEY)) return;

    const timer = setTimeout(() => {
      toast({
        title: 'Hyperfolio is now on Telegram',
        description: (
          <span>
            Use the bot{' '}
            <a
              href="https://t.me/hyperfoliothebot"
              target="_blank"
              rel="noreferrer"
              className="text-theme-accent underline"
            >
              @hyperfoliothebot
            </a>
          </span>
        ),
        duration: 12000,
        onOpenChange: (open) => {
          if (!open) {
            window.localStorage.setItem(TOAST_KEY, '1');
          }
        },
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
