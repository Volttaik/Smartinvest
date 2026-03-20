'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, TrendingUp, Globe, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const badges = [
  { icon: ShieldCheck, label: "Secure & Regulated" },
  { icon: TrendingUp,  label: "18.4% Avg Return" },
  { icon: Globe,       label: "30 Packages" },
];

const stats = [
  { value: "₦850K+", label: "Assets Under Management" },
  { value: "18.4%",  label: "Average Annual Return" },
  { value: "12K+",   label: "Active Investors" },
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
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary/5" />
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 1.6, delay: 0.2 }}
          className="absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 pt-12 pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left — text content */}
          <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-primary font-semibold tracking-wider uppercase">AI-Powered Investment Platform</span>
            </motion.div>

            <motion.h1 variants={item}
              className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 text-foreground">
              Smart Investing<br />for a{" "}<span className="red-gradient">Wealthier</span><br />Tomorrow
            </motion.h1>

            <motion.p variants={item} className="text-lg text-muted-foreground max-w-lg mb-10 leading-relaxed">
              SmartInvest delivers institutional-grade, AI-driven investment strategies to individual investors.
              Data-driven portfolios built for real, lasting returns.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg"
                className="bg-primary text-primary-foreground font-semibold px-8 py-6 text-base rounded-xl red-glow hover:brightness-110 transition-all"
                asChild>
                <Link href="/register">Open Free Account <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button variant="outline" size="lg"
                className="px-8 py-6 text-base rounded-xl border-border hover:bg-muted" asChild>
                <Link href="#pricing">View Packages</Link>
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

          {/* Right — financial illustration + floating cards */}
          <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative hidden lg:flex items-center justify-center">

            <div className="relative w-full max-w-lg">

              {/* Main illustration - generated financial graphic */}
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                {/* Hero financial illustration with transparent bg */}
                <img
                  src="/hero-finance.png"
                  alt="Financial analytics and investment growth"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                  style={{ maxHeight: 420 }}
                />
              </motion.div>

              {/* Floating card: Portfolio Value */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                  className="absolute -bottom-4 -left-6 bg-foreground rounded-2xl p-4 shadow-xl w-52 z-20">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Portfolio Value</div>
                  <div className="text-2xl font-bold font-display text-white">₦248,500</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-bold">+18.4%</span>
                    <span className="text-white/40 text-[10px]">YTD return</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating card: AI Signal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                  className="absolute -top-2 -right-4 bg-background border border-border rounded-2xl p-3.5 shadow-lg w-48 z-20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                      <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-[11px] font-bold text-foreground">AI Signal</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="text-xs text-muted-foreground">Market opportunity detected</div>
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= 4 ? "bg-primary" : "bg-muted"}`} />
                    ))}
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating card: Monthly Gain */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
                  className="absolute bottom-20 -right-6 bg-background border border-border rounded-xl p-3 shadow-lg z-20">
                  <div className="text-[10px] text-muted-foreground mb-0.5">Monthly Gain</div>
                  <div className="text-lg font-bold text-foreground">+₦3,240</div>
                  <div className="flex items-center gap-1 text-[10px] text-green-600 font-semibold">
                    <ArrowUpRight className="w-3 h-3" /> 2.1% this month
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats bar */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border shadow-sm">
          {stats.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.8 + i * 0.1, duration: 0.5 }}
              className="bg-background text-center py-8 px-6">
              <div className="text-3xl font-bold font-display text-primary mb-1">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
