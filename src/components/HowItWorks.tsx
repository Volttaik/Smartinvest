'use client';

import { motion } from "framer-motion";
import { UserPlus, SlidersHorizontal, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Sign up in under 2 minutes. No paperwork, no minimum to get started — just your email and a goal.",
    detail: "Free forever · No credit card required",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Choose a Package",
    desc: "Browse 30 investment packages across 6 tiers. Pick your budget, your duration, and your target daily return.",
    detail: "From ₦5,000 · Daily returns",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Earn Daily Returns",
    desc: "Returns are credited to your wallet automatically every day. Withdraw anytime or reinvest to compound your gains.",
    detail: "Auto-credited · Withdraw anytime",
  },
];

export default function HowItWorks() {
  return (
    <section id="about" className="py-28 bg-background border-t border-border relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 bottom-0 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:sticky lg:top-32"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider mb-7">
              How It Works
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-foreground leading-tight tracking-tight">
              Three steps to<br /><span className="red-gradient italic">daily earnings</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-10 max-w-sm">
              No financial jargon. No complexity. Just a clear path to building wealth — one day at a time.
            </p>
            <Button
              size="lg"
              className="bg-primary text-white font-semibold px-7 h-11 text-sm rounded-xl hover:bg-primary/90 transition-colors"
              asChild
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          </motion.div>

          {/* Right — Steps */}
          <div className="space-y-0 pt-2">
            {steps.map(({ number, icon: Icon, title, desc, detail }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative flex gap-6 group"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-5 top-12 w-px h-full bg-border" />
                )}

                {/* Step icon */}
                <div className="flex-shrink-0 relative z-10 mt-0.5">
                  <div className="w-10 h-10 rounded-2xl border border-border bg-background flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/4 transition-all duration-300 shadow-sm">
                    <Icon className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Content */}
                <div className="pb-12">
                  <div className="text-[10px] font-bold text-primary tracking-widest uppercase mb-1.5">{number}</div>
                  <h3 className="font-semibold text-base text-foreground mb-2 leading-snug">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted border border-border px-3 py-1 rounded-full">
                    {detail}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
