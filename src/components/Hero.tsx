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

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[calc(100vh-103px)] flex items-center overflow-hidden bg-background">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/5"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
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

          {/* Right — Floating card stack */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Main card */}
            <motion.div
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="relative w-full max-w-sm bg-foreground rounded-2xl p-8 shadow-2xl text-primary-foreground overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/20 -translate-y-1/2 translate-x-1/2" />
              <div className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-6">Portfolio Overview</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-4xl font-bold font-display mb-1">₦248,500</div>
                <div className="text-sm text-white/60 mb-6">Total Portfolio Value</div>
                <div className="flex items-center gap-2 mb-8">
                  <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-semibold">+18.4%</span>
                  <span className="text-white/50 text-sm">YTD Return</span>
                </div>
                <div className="space-y-3">
                  {allocations.map(({ label, pct, color }, i) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>{label}</span><span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.7 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Floating mini card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              style={{ y: 0 }}
              whileInView={{}}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-8 bg-background border border-border rounded-xl p-4 shadow-lg w-44"
              >
                <div className="text-xs text-muted-foreground mb-1">Monthly Gain</div>
                <div className="text-xl font-bold text-foreground">+₦3,240</div>
                <div className="text-xs text-green-600 font-medium mt-1">↑ 2.1% this month</div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="absolute -top-6 -right-4 bg-background border border-border rounded-xl p-4 shadow-lg w-40"
              >
                <div className="text-xs text-muted-foreground mb-1">Risk Score</div>
                <div className="text-xl font-bold text-foreground">Low</div>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 2 ? "bg-primary" : "bg-muted"}`} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
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
              transition={{ delay: 0.8 + i * 0.1 }}
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
