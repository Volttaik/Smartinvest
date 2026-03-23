'use client';

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function CountUp({ target, suffix = "", prefix = "", decimals = 0, start }: { target: number; suffix?: string; prefix?: string; decimals?: number; start: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 2000, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(parseFloat((eased * target).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, start, decimals]);
  return <>{prefix}{decimals > 0 ? count.toFixed(decimals) : Math.floor(count)}{suffix}</>;
}

const statItems = [
  { value: 850, suffix: "K+", prefix: "₦", label: "Assets Managed", desc: "in client portfolios" },
  { value: 12,  suffix: "K+", prefix: "", label: "Active Investors", desc: "across Nigeria" },
  { value: 18,  suffix: ".4%", prefix: "", decimals: 0, label: "Average Return", desc: "annual YTD" },
  { value: 30,  suffix: "", prefix: "", label: "Packages", desc: "from ₦5,000" },
];

export default function Stats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.25 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.04]" />
      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-white/8">
          {statItems.map(({ value, suffix, prefix, decimals, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-4 px-6 md:px-10"
            >
              <div className="text-3xl md:text-4xl font-bold font-display text-primary mb-2 tracking-tight">
                <CountUp target={value} suffix={suffix} prefix={prefix} decimals={decimals ?? 0} start={visible} />
              </div>
              <div className="text-sm font-semibold text-white mb-0.5">{label}</div>
              <div className="text-xs text-white/40">{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
