'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingUp, Layers, ArrowUpRight, BarChart2, Zap } from "lucide-react";
import Link from "next/link";

const badges = [
  { icon: ShieldCheck, label: "Secured by Paystack" },
  { icon: TrendingUp,  label: "Daily Returns" },
  { icon: Layers,      label: "30 Packages" },
];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export default function Hero() {
  return (
    <section id="home" className="relative min-h-[calc(100vh-103px)] flex items-center overflow-hidden bg-background">
      {/* Background: subtle dot grid + vertical dividers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-primary/4 rounded-full blur-[100px] -translate-y-1/4 translate-x-1/4" />
      </div>

      <div className="container mx-auto px-6 pt-10 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text */}
          <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
            <motion.div variants={item}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted border border-border mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground font-medium tracking-wide">AI-Powered Investment Platform</span>
            </motion.div>

            <motion.h1 variants={item}
              className="font-display text-[2.9rem] md:text-[3.6rem] lg:text-[4rem] font-bold leading-[1.08] mb-6 text-foreground tracking-tight">
              Invest Smarter,<br />Earn <span className="red-gradient italic">Daily Returns</span>
            </motion.h1>

            <motion.p variants={item} className="text-[1.05rem] text-muted-foreground max-w-md mb-10 leading-relaxed">
              SmartInvest delivers institutional-grade, AI-driven investment strategies to individual investors in Nigeria. Choose a package, fund your account, and watch returns roll in daily.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 mb-12">
              <Button size="lg"
                className="bg-primary text-white font-semibold px-7 h-12 text-sm rounded-xl hover:bg-primary/90 transition-colors"
                asChild>
                <Link href="/register">Open Free Account <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button variant="outline" size="lg"
                className="px-7 h-12 text-sm rounded-xl border-border text-foreground hover:bg-muted transition-colors" asChild>
                <Link href="#pricing">View Packages</Link>
              </Button>
            </motion.div>

            <motion.div variants={item} className="flex flex-wrap gap-2.5">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/80 border border-border text-xs text-muted-foreground font-medium">
                  <Icon className="w-3.5 h-3.5 text-primary/70" />
                  {label}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.85, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              {/* Main card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 bg-foreground rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold mb-1">Portfolio Value</p>
                    <p className="text-3xl font-bold font-display text-white">₦248,500</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <BarChart2 className="w-5 h-5 text-primary" />
                  </div>
                </div>

                {/* Mini chart bars */}
                <div className="flex items-end gap-1.5 h-16 mb-5">
                  {[40, 55, 45, 70, 60, 80, 65, 90, 75, 95, 88, 100].map((h, i) => (
                    <motion.div key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 0.7 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                      className={`flex-1 rounded-sm ${i === 11 ? 'bg-primary' : 'bg-white/12'}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-sm text-green-400 font-semibold">
                    <ArrowUpRight className="w-4 h-4" />
                    +18.4% this month
                  </div>
                  <span className="text-white/30 text-xs">2 active plans</span>
                </div>

                {/* Investment items */}
                <div className="mt-5 space-y-2.5">
                  {[
                    { name: "Gold Package", return: "+2.1%/day", amount: "₦50,000" },
                    { name: "BTC Strategy", return: "+1.8%/day", amount: "₦25,000" },
                  ].map((inv) => (
                    <div key={inv.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{inv.name}</p>
                        <p className="text-[10px] text-white/40">{inv.amount} invested</p>
                      </div>
                      <span className="text-xs font-bold text-green-400">{inv.return}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Floating card: AI Signal */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }} animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -top-5 -right-8 bg-background border border-border rounded-2xl p-4 shadow-lg w-52 z-20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Daily Return</span>
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">Credited to your wallet</p>
                  <p className="text-lg font-bold text-foreground font-display">+₦3,240</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Today 12:00 AM</p>
                </motion.div>
              </motion.div>

              {/* Floating card: Trust */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-8 bg-background border border-border rounded-2xl p-3.5 shadow-lg z-20 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">Paystack Secured</p>
                    <p className="text-[10px] text-muted-foreground">256-bit SSL encryption</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.75 }}
          className="mt-24 grid grid-cols-3 gap-0 divide-x divide-border border border-border rounded-2xl overflow-hidden bg-muted/30"
        >
          {[
            { value: "₦850K+", label: "Assets Managed" },
            { value: "18.4%",  label: "Average Annual Return" },
            { value: "12K+",   label: "Active Investors" },
          ].map(({ value, label }) => (
            <div key={label} className="py-7 px-6 text-center">
              <div className="text-2xl md:text-3xl font-bold font-display text-foreground mb-1">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
