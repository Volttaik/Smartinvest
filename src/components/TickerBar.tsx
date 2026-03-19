import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const tickers = [
  { symbol: "S&P 500", price: "5,234.18", change: "+0.87%", up: true },
  { symbol: "NASDAQ", price: "16,428.82", change: "+1.14%", up: true },
  { symbol: "DOW", price: "38,996.39", change: "+0.32%", up: true },
  { symbol: "AAPL", price: "189.30", change: "+0.54%", up: true },
  { symbol: "MSFT", price: "415.20", change: "+1.23%", up: true },
  { symbol: "GOOGL", price: "175.84", change: "-0.21%", up: false },
  { symbol: "TSLA", price: "175.00", change: "-1.08%", up: false },
  { symbol: "AMZN", price: "185.54", change: "+0.67%", up: true },
  { symbol: "NVDA", price: "875.39", change: "+2.41%", up: true },
  { symbol: "BTC/USD", price: "67,450", change: "+3.22%", up: true },
  { symbol: "ETH/USD", price: "3,520", change: "+1.89%", up: true },
  { symbol: "GOLD", price: "2,326", change: "-0.14%", up: false },
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
        const next = o + delta * 0.04;
        return next > containerWidth / 2 ? 0 : next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const items = [...tickers, ...tickers];

  return (
    <div className="fixed top-0 left-0 right-0 w-full bg-foreground border-b border-white/10 overflow-hidden py-2.5 z-50">
      <div
        ref={containerRef}
        className="flex gap-0 whitespace-nowrap"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {items.map((t, i) => (
          <div key={i} className="inline-flex items-center gap-2 px-6 border-r border-white/10">
            <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">{t.symbol}</span>
            <span className="text-xs font-bold text-white">{t.price}</span>
            <span className={`flex items-center gap-0.5 text-xs font-semibold ${t.up ? "text-green-400" : "text-primary"}`}>
              {t.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
