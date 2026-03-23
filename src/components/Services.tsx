'use client';

import { motion } from "framer-motion";
import { BarChart3, Landmark, LineChart, Shield, Globe2, Briefcase } from "lucide-react";

const services = [
  {
    icon: LineChart,
    title: "Equity Portfolios",
    desc: "Diversified stock portfolios built around your risk profile and long-term financial goals.",
    tag: "Most Popular",
  },
  {
    icon: Landmark,
    title: "Fixed Income",
    desc: "Government and corporate bond strategies for stable, predictable returns.",
    tag: null,
  },
  {
    icon: Globe2,
    title: "Global Markets",
    desc: "Access to international equities, emerging markets, and cross-border opportunities.",
    tag: null,
  },
  {
    icon: BarChart3,
    title: "Alternative Assets",
    desc: "Private equity, hedge funds, REITs, and commodities to diversify beyond traditional assets.",
    tag: "High Growth",
  },
  {
    icon: Shield,
    title: "Risk Management",
    desc: "Advanced hedging and portfolio protection strategies to safeguard your capital.",
    tag: null,
  },
  {
    icon: Briefcase,
    title: "Wealth Planning",
    desc: "Holistic financial planning including estate, tax optimization, and retirement strategies.",
    tag: null,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 bg-muted/20 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider mb-6">
            Our Services
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
            Investment Solutions<br />for Every Goal
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            From conservative income strategies to high-growth packages — we have a plan for every investor.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(({ icon: Icon, title, desc, tag }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.45 }}
              className="group bg-background border border-border rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-foreground/15 hover:shadow-md relative"
            >
              {tag && (
                <span className={`absolute top-4 right-4 text-[10px] font-semibold px-2.5 py-1 rounded-full border ${
                  tag === "Most Popular"
                    ? "bg-primary/8 text-primary border-primary/20"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  {tag}
                </span>
              )}

              <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mb-5 group-hover:bg-primary/8 group-hover:border-primary/25 transition-all duration-300">
                <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>

              <h3 className="font-semibold text-sm text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
