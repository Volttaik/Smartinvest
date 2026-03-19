import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

function CountUp({ target, suffix = "", prefix = "", start }: { target: number; suffix?: string; prefix?: string; start: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / 1800, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, start]);
  return <>{prefix}{count}{suffix}</>;
}

const statItems = [
  { value: 4200, suffix: "M+", prefix: "₦", label: "Assets Managed", desc: "in client portfolios" },
  { value: 50, suffix: "K+", prefix: "", label: "Active Investors", desc: "across the globe" },
  { value: 18, suffix: "%+", prefix: "", label: "Annual Returns", desc: "average YTD" },
  { value: 32, suffix: "", prefix: "", label: "Countries", desc: "worldwide reach" },
];

export default function Stats() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-20 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/10">
          {statItems.map(({ value, suffix, prefix, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center md:px-8"
            >
              <div className="text-4xl md:text-5xl font-bold font-display text-primary mb-1">
                <CountUp target={value} suffix={suffix} prefix={prefix} start={visible} />
              </div>
              <div className="font-semibold text-white mb-1">{label}</div>
              <div className="text-sm text-white/50">{desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
