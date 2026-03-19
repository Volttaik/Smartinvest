import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    monthly: 0,
    annual: 0,
    desc: "Perfect for first-time investors ready to begin their wealth journey.",
    features: [
      "Up to ₦10,000 managed",
      "Basic portfolio tracking",
      "Monthly performance report",
      "Email support",
      "2 asset classes",
    ],
    cta: "Get Started Free",
    highlight: false,
  },
  {
    name: "Growth",
    monthly: 29,
    annual: 24,
    desc: "For serious investors who want advanced strategies and full control.",
    features: [
      "Up to ₦250,000 managed",
      "AI portfolio optimization",
      "Weekly rebalancing",
      "Real-time analytics dashboard",
      "All asset classes",
      "Priority support",
      "Tax-loss harvesting",
    ],
    cta: "Start 30-Day Free Trial",
    highlight: true,
  },
  {
    name: "Elite",
    monthly: 99,
    annual: 82,
    desc: "Institutional-grade wealth management for high-net-worth investors.",
    features: [
      "Unlimited assets managed",
      "Dedicated wealth advisor",
      "Custom portfolio strategies",
      "Daily rebalancing",
      "Private equity access",
      "24/7 concierge support",
      "Estate & tax planning",
    ],
    cta: "Talk to an Advisor",
    highlight: false,
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-28 bg-muted/40">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Pricing
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Transparent, Fair Pricing
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            No hidden fees, no surprises. Choose the plan that fits your goals.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-background border border-border rounded-full p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-foreground text-primary-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "bg-foreground text-primary-foreground" : "text-muted-foreground"}`}
            >
              Annual
              <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-bold">-20%</span>
            </button>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(({ name, monthly, annual: annualPrice, desc, features, cta, highlight }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                highlight
                  ? "bg-foreground text-primary-foreground border-2 border-primary shadow-xl scale-105"
                  : "bg-background border border-border"
              }`}
            >
              {highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-md">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className={`text-sm font-semibold uppercase tracking-widest mb-2 ${highlight ? "text-primary" : "text-muted-foreground"}`}>
                  {name}
                </div>
                <div className="flex items-end gap-1 mb-3">
                  <span className={`text-5xl font-bold font-display ${highlight ? "text-white" : "text-foreground"}`}>
                    ₦{annual ? annualPrice : monthly}
                  </span>
                  {monthly > 0 && (
                    <span className={`text-sm mb-2 ${highlight ? "text-white/50" : "text-muted-foreground"}`}>
                      /mo
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${highlight ? "text-white/60" : "text-muted-foreground"}`}>
                  {desc}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlight ? "text-primary" : "text-primary"}`} />
                    <span className={highlight ? "text-white/80" : "text-muted-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full h-11 rounded-xl font-semibold text-sm ${
                  highlight
                    ? "bg-primary text-primary-foreground hover:brightness-110"
                    : "border border-border bg-background text-foreground hover:bg-muted"
                }`}
                variant={highlight ? "default" : "outline"}
                asChild
              >
                <Link to="/register">{cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include SSL encryption, SIPC protection, and zero trading commissions.
        </p>
      </div>
    </section>
  );
}
