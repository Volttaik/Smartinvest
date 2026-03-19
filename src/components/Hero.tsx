import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingUp, Globe } from "lucide-react";
import { Link } from "react-router-dom";

const badges = [
  { icon: ShieldCheck, label: "SEC Regulated" },
  { icon: TrendingUp, label: "18.4% Avg Return" },
  { icon: Globe, label: "32 Countries" },
];

const allocations = [
  { label: "Equities", pct: 60, color: "bg-primary" },
  { label: "Bonds", pct: 25, color: "bg-white/60" },
  { label: "Alternatives", pct: 15, color: "bg-white/30" },
];

const stats = [
  { value: "₦4.2B+", label: "Assets Under Management" },
  { value: "18.4%", label: "Average Annual Return" },
  { value: "99.7%", label: "Client Satisfaction Rate" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ── Financial Illustration (SVG) ─────────────────────── */
function FinancialIllustration() {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
      {/* Grid Background */}
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.8" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id="barGradLight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(var(--muted-foreground))" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Floating card - Portfolio Growth */}
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <rect x="20" y="30" width="280" height="170" rx="16" fill="hsl(var(--foreground))" />
        <rect x="20" y="30" width="280" height="4" rx="2" fill="hsl(var(--primary))" opacity="0.6" />
        {/* Title */}
        <text x="44" y="68" fontSize="11" fill="white" opacity="0.5" fontFamily="Inter" fontWeight="600" letterSpacing="0.05em">PORTFOLIO GROWTH</text>
        {/* Chart area fill */}
        <motion.path
          d="M44 170 L80 155 L120 160 L160 140 L200 130 L240 115 L276 95 L276 175 L44 175 Z"
          fill="url(#chartFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        />
        {/* Chart line */}
        <motion.path
          d="M44 170 L80 155 L120 160 L160 140 L200 130 L240 115 L276 95"
          stroke="hsl(var(--primary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
        {/* End dot */}
        <motion.circle
          cx="276" cy="95" r="4"
          fill="hsl(var(--primary))"
          stroke="white"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.8, type: "spring", stiffness: 300 }}
        />
        {/* Percentage badge */}
        <motion.g
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.4 }}
        >
          <rect x="240" y="72" width="48" height="20" rx="10" fill="hsl(var(--primary))" opacity="0.2" />
          <text x="250" y="86" fontSize="10" fill="hsl(var(--primary))" fontFamily="Inter" fontWeight="700">+18.4%</text>
        </motion.g>
      </motion.g>

      {/* Floating card - Bar Chart Analytics */}
      <motion.g
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <rect x="200" y="140" width="280" height="150" rx="16" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
        <text x="224" y="174" fontSize="11" fill="hsl(var(--muted-foreground))" fontFamily="Inter" fontWeight="600" letterSpacing="0.05em">MONTHLY RETURNS</text>

        {/* Bar chart */}
        {[
          { x: 230, h: 50 }, { x: 254, h: 35 }, { x: 278, h: 65 },
          { x: 302, h: 45 }, { x: 326, h: 75 }, { x: 350, h: 55 },
          { x: 374, h: 40 }, { x: 398, h: 80 }, { x: 422, h: 60 },
          { x: 446, h: 70 },
        ].map((bar, i) => (
          <motion.rect
            key={i}
            x={bar.x}
            y={270 - bar.h}
            width="16"
            height={bar.h}
            rx="4"
            fill={i % 2 === 0 ? "url(#barGrad)" : "url(#barGradLight)"}
            initial={{ height: 0, y: 270 }}
            animate={{ height: bar.h, y: 270 - bar.h }}
            transition={{ delay: 1.0 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </motion.g>

      {/* Floating mini card - Profit indicator */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.g
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        >
          <rect x="30" y="220" width="160" height="75" rx="14" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          <circle cx="58" cy="250" r="14" fill="hsl(var(--primary))" opacity="0.15" />
          <text x="52" y="255" fontSize="14" fill="hsl(var(--primary))" fontFamily="Inter">↗</text>
          <text x="80" y="248" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="Inter">Monthly Gain</text>
          <text x="80" y="266" fontSize="16" fill="hsl(var(--foreground))" fontFamily="Inter" fontWeight="700">+₦3,240</text>
          <text x="80" y="282" fontSize="9" fill="hsl(var(--primary))" fontFamily="Inter" fontWeight="600">↑ 2.1% this month</text>
        </motion.g>
      </motion.g>

      {/* Floating mini card - Allocation */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.g
          animate={{ y: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <rect x="30" y="310" width="140" height="70" rx="14" fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth="1" />
          {/* Donut ring segments */}
          <circle cx="66" cy="345" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <motion.circle
            cx="66" cy="345" r="16"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            strokeDasharray="60.3 100.5"
            strokeLinecap="round"
            transform="rotate(-90 66 345)"
            initial={{ strokeDasharray: "0 100.5" }}
            animate={{ strokeDasharray: "60.3 100.5" }}
            transition={{ delay: 1.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <text x="92" y="340" fontSize="9" fill="hsl(var(--muted-foreground))" fontFamily="Inter">Allocation</text>
          <text x="92" y="356" fontSize="12" fill="hsl(var(--foreground))" fontFamily="Inter" fontWeight="700">Balanced</text>
          <text x="92" y="369" fontSize="9" fill="hsl(var(--primary))" fontFamily="Inter" fontWeight="600">4 Asset Classes</text>
        </motion.g>
      </motion.g>

      {/* Decorative dots */}
      {[
        [190, 230], [195, 310], [185, 350], [495, 50], [490, 100],
      ].map(([cx, cy], i) => (
        <motion.circle
          key={i}
          cx={cx} cy={cy} r="2"
          fill="hsl(var(--primary))"
          opacity="0.3"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ delay: 1.5 + i * 0.2, duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      ))}
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[calc(100vh-103px)] flex items-center overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/5"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.2 }}
          className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-primary/4 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 pt-12 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-semibold tracking-wider uppercase">
                Trusted by 50,000+ Investors
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-foreground"
            >
              Smart Investing
              <br />
              for a{" "}
              <span className="red-gradient">Wealthier</span>
              <br />
              Tomorrow
            </motion.h1>

            <motion.p variants={item} className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              Smart Invest delivers institutional-grade investment strategies to individual investors.
              Data-driven portfolios built for real, lasting returns.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl red-glow hover:brightness-110 transition-all"
                asChild
              >
                <Link to="/register">
                  Open Free Account <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-6 text-base rounded-xl border-border hover:bg-muted">
                View Performance
              </Button>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-3">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Financial Illustration + Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:block"
          >
            <FinancialIllustration />
          </motion.div>
        </div>

        {/* Bottom stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border shadow-sm"
        >
          {stats.map(({ value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="bg-background text-center py-8 px-6"
            >
              <div className="text-3xl font-bold font-display text-primary mb-1">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
