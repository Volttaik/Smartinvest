'use client';

import { motion } from "framer-motion";
import { Bot, Flame, Gem, Bitcoin, BarChart3, Shield, Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const agents = [
  {
    icon: Flame,
    name: "Oil & Energy",
    desc: "Monitors crude oil prices, OPEC decisions, and energy sector trends.",
    markets: ["WTI Crude", "Brent", "Gas"],
  },
  {
    icon: Gem,
    name: "Gold & Commodities",
    desc: "Tracks precious metals, agricultural futures, and commodity cycles.",
    markets: ["Gold", "Silver", "Copper"],
  },
  {
    icon: Bitcoin,
    name: "Crypto Intelligence",
    desc: "Analyzes blockchain data, whale movements, and market sentiment.",
    markets: ["BTC", "ETH", "Altcoins"],
  },
  {
    icon: BarChart3,
    name: "Equity & Index",
    desc: "Scans global equity markets, earnings data, and sector rotations.",
    markets: ["S&P 500", "NASDAQ", "EM"],
  },
];

const capabilities = [
  { icon: Cpu,    title: "Real-Time Analysis",  desc: "AI agents process thousands of data points per second across global markets." },
  { icon: Shield, title: "Risk Assessment",     desc: "Continuous risk monitoring with automated hedging recommendations." },
  { icon: Bot,    title: "Adaptive Learning",   desc: "Models evolve with market conditions, improving accuracy over time." },
];

export default function AIAgents() {
  return (
    <section className="py-28 bg-foreground text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-[0.05]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/8 blur-[100px] translate-x-1/2 -translate-y-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/12 text-white/60 text-xs font-medium uppercase tracking-wider mb-7">
              <Bot className="w-3 h-3" />
              AI Investment Agents
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-white leading-tight tracking-tight">
              Intelligent Agents<br />
              <span className="text-primary">Working for You</span>
            </h2>
            <p className="text-white/50 text-base leading-relaxed max-w-md mb-8">
              Our AI-powered investment agents continuously analyze global markets, identify patterns, and execute strategies — so your portfolio is always optimized.
            </p>
            <Button
              size="lg"
              className="bg-primary text-white font-semibold px-7 h-11 text-sm rounded-xl hover:bg-primary/90 transition-colors"
              asChild
            >
              <Link href="/register">Activate AI Agents <ArrowRight className="ml-2 w-4 h-4" /></Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="space-y-3 lg:pt-6"
          >
            {capabilities.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.45 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/8"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">{title}</div>
                  <div className="text-white/45 text-sm leading-relaxed">{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Agent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map(({ icon: Icon, name, desc, markets }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="relative bg-white/5 border border-white/8 rounded-2xl p-6 hover:border-white/15 hover:bg-white/[0.07] transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-400">Active</span>
                </div>
              </div>

              <h3 className="font-semibold text-white text-sm mb-2">{name}</h3>
              <p className="text-white/40 text-xs leading-relaxed mb-4">{desc}</p>

              <div className="flex flex-wrap gap-1.5">
                {markets.map(m => (
                  <span key={m} className="text-[10px] font-medium text-white/35 bg-white/6 border border-white/8 px-2 py-0.5 rounded-full">
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/35"
        >
          {["4 Active AI Agents", "Real-Time Market Analysis", "Multi-Asset Coverage", "24/7 Automated Monitoring"].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-white/25" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
