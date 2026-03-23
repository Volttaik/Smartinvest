'use client';

import { useEffect, useRef, useState } from "react";

const tickers = [
  { symbol: "S&P 500",  price: "5,234.18", change: "+0.87%", up: true  },
  { symbol: "NASDAQ",   price: "16,428.82", change: "+1.14%", up: true  },
  { symbol: "DOW",      price: "38,996.39", change: "+0.32%", up: true  },
  { symbol: "AAPL",     price: "189.30",    change: "+0.54%", up: true  },
  { symbol: "MSFT",     price: "415.20",    change: "+1.23%", up: true  },
  { symbol: "GOOGL",    price: "175.84",    change: "-0.21%", up: false },
  { symbol: "TSLA",     price: "175.00",    change: "-1.08%", up: false },
  { symbol: "AMZN",     price: "185.54",    change: "+0.67%", up: true  },
  { symbol: "NVDA",     price: "875.39",    change: "+2.41%", up: true  },
  { symbol: "BTC/USD",  price: "67,450",    change: "+3.22%", up: true  },
  { symbol: "ETH/USD",  price: "3,520",     change: "+1.89%", up: true  },
  { symbol: "GOLD",     price: "2,326",     change: "-0.14%", up: false },
];

export default function TickerBar() {
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let prev = performance.now();
    const step = (now: number) => {
      const delta = now - prev;
      prev = now;
      setOffset(o => {
        const containerWidth = containerRef.current?.scrollWidth ?? 1200;
        const next = o + delta * 0.038;
        return next > containerWidth / 2 ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const items = [...tickers, ...tickers];

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-foreground overflow-hidden py-2 z-50 border-b border-white/6">
      <div
        ref={containerRef}
        className="flex whitespace-nowrap"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {items.map((t, i) => (
          <div key={i} className="inline-flex items-center gap-2.5 px-6 border-r border-white/8">
            <span className="text-[11px] font-medium text-white/45 tracking-wide">{t.symbol}</span>
            <span className="text-[11px] font-semibold text-white/85">{t.price}</span>
            <span className={`text-[10px] font-semibold ${t.up ? "text-emerald-400" : "text-primary/90"}`}>
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
