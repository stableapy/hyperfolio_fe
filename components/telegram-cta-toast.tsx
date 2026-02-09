'use client';

import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

const TOAST_KEY = 'hyperfolio_updates_toast_dismissed_v2';

export function TelegramCtaToast() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(TOAST_KEY)) return;

    const timer = setTimeout(() => {
      toast({
        title: 'What is new on Hyperfolio',
        description: (
          <div className="space-y-1">
            <p className="text-sm">
              - Use Hyperfolio directly on Telegram (mini app) via{' '}
              <a
                href="https://t.me/hyperfoliothebot"
                target="_blank"
                rel="noreferrer"
                className="text-theme-accent underline"
              >
                @hyperfoliothebot
              </a>
            </p>
            <p className="text-sm">
              - Explore endpoints and pricing in{' '}
              <a href="/api-docs" className="text-theme-accent underline">
                API documentation
              </a>
            </p>
          </div>
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
