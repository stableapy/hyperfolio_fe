'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { hasSeenWelcome } from '@/components/welcome-modal';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

const PROMO_KEY = 'hyperfolio_kestrell_promo_seen_v1';
const TOAST_KEY = 'hyperfolio_updates_toast_seen_v3';
const BOT_URL = 'https://t.me/kestrell_hip4_bot';

export function HomePromotions() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      if (!hasSeenWelcome()) return;
    } catch {
      return;
    }

    const timer = setTimeout(() => {
      // Keep onboarding and active wallet/swap dialogs uninterrupted.
      try {
        if (document.querySelector('[role="dialog"]')) return;

        if (!localStorage.getItem(PROMO_KEY)) {
          localStorage.setItem(PROMO_KEY, '1');
          setIsOpen(true);
          return;
        }

        if (localStorage.getItem(TOAST_KEY)) return;
        localStorage.setItem(TOAST_KEY, '1');
      } catch {
        // Skip promotions when the browser cannot remember their frequency.
        return;
      }

      toast({
        title: 'What is new on Hyperfolio',
        description: (
          <div className="space-y-3">
            <p className="text-sm">
              Meet Kestrell, our Telegram copy trading bot for Hyperliquid
              prediction markets.{' '}
              <a
                href={BOT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-medium underline"
              >
                Open Kestrell ↗
              </a>
            </p>
            <p className="text-sm">
              Use Hyperfolio directly on Telegram via{' '}
              <a
                href="https://t.me/hyperfoliothebot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                @hyperfoliothebot
              </a>
            </p>
            <p className="text-sm">
              Explore endpoints and pricing in{' '}
              <a href="/api-docs" className="text-primary underline">
                API documentation
              </a>
            </p>
          </div>
        ),
        duration: 12000,
      });
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] gap-0 overflow-y-auto rounded-2xl border-[#c7decf] bg-[#e4f3e7] p-7 text-[#102118] sm:max-w-[440px] [&>button]:text-[#102118]">
        <div className="mb-7 flex items-center gap-3">
          <Image src="/kestrell-mark.png" alt="" width={44} height={44} />
          <div>
            <p className="text-lg font-semibold tracking-tight">Kestrell</p>
            <p className="text-[10px] tracking-[0.12em] text-[#52695a] uppercase">
              From the team behind Hyperfolio
            </p>
          </div>
        </div>

        <DialogTitle className="text-[30px] leading-tight font-semibold tracking-tight text-[#102118] normal-case">
          Copy traders.
          <br />
          Right from Telegram.
        </DialogTitle>
        <DialogDescription className="mt-4 text-sm leading-relaxed text-[#52695a]">
          Discover traders on Hyperliquid prediction markets. Choose who to copy
          and set your own limits. Kestrell takes care of the next trades.
        </DialogDescription>

        <Button
          asChild
          className="mt-7 h-11 w-full rounded-lg border-[#102118] bg-[#102118] text-[11px] text-[#e4f3e7] hover:bg-[#243d2d]"
        >
          <a
            href={BOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
          >
            <Send aria-hidden="true" />
            Open Kestrell on Telegram
            <ArrowUpRight aria-hidden="true" />
          </a>
        </Button>
        <div className="mt-3 flex items-center justify-between gap-3">
          <a
            href="https://kestrell.xyz/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#52695a] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            How it works ↗
          </a>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="rounded-lg text-[#52695a] hover:bg-[#d3e8d9] hover:text-[#102118]"
            >
              Maybe later
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
