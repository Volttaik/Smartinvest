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
    desc: "Sign up in under 2 minutes. No paperwork, no minimums to get started. Just your email and a goal.",
    detail: "Free forever · No credit card required",
  },
  {
    number: "02",
    icon: SlidersHorizontal,
    title: "Set Your Strategy",
    desc: "Tell us your risk tolerance, timeline, and financial goals. Our algorithm builds a custom portfolio for you.",
    detail: "AI-powered · Fully personalized",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Watch It Grow",
    desc: "We handle rebalancing, reinvesting, and optimization automatically. Track everything in real-time from your dashboard.",
    detail: "Hands-off · Always optimized",
  },
];

export default function HowItWorks() {
  return (
    <section id="about" className="py-28 bg-background relative overflow-hidden">
      {/* Subtle background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              How It Works
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-foreground leading-tight">
              Investing Made<br />
              <span className="red-gradient">Simple & Smart</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              Three steps is all it takes. No financial jargon, no hidden complexity — just a clear path to building lasting wealth.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground font-semibold px-8 rounded-xl hover:brightness-110"
              asChild
            >
              <Link href="/register">Get Started Free</Link>
            </Button>
          </motion.div>

          {/* Right — Steps */}
          <div className="space-y-0">
            {steps.map(({ number, icon: Icon, title, desc, detail }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative flex gap-6 group"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 + 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformOrigin: "top" }}
                    className="absolute left-[22px] top-14 w-px h-full bg-border"
                  />
                )}

                {/* Step circle */}
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-11 h-11 rounded-full border-2 border-border bg-background flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all duration-300">
                    <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>

                {/* Content */}
                <div className="pb-10">
                  <div className="text-xs font-bold text-primary tracking-widest uppercase mb-1">{number}</div>
                  <h3 className="font-semibold text-lg text-foreground mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">{desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/8 border border-primary/20 px-3 py-1 rounded-full">
                    ✓ {detail}
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
