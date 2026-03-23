'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const perks = [
  "Free to open",
  "Starts from ₦5,000",
  "Daily returns",
  "Withdraw anytime",
];

export default function CTA() {
  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl bg-foreground text-white p-12 md:p-20"
        >
          {/* Subtle background texture */}
          <div className="absolute inset-0 bg-dot-grid opacity-[0.06]" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-primary/10 translate-x-1/2 -translate-y-1/2 blur-[80px]" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-white/70 text-xs font-medium uppercase tracking-wider mb-8">
              Start Today
            </div>

            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 leading-tight tracking-tight">
              Your Wealth Journey<br />
              <span className="text-primary">Starts Now</span>
            </h2>

            <p className="text-white/55 text-base max-w-md mx-auto mb-8 leading-relaxed">
              Join thousands of investors growing their wealth with SmartInvest — simple, transparent, and daily returns.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2 text-sm text-white/55">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {perk}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                className="bg-primary text-white font-semibold px-8 h-12 text-sm rounded-xl hover:bg-primary/90 transition-colors"
                asChild
              >
                <Link href="/register">Open Free Account <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-white/70 border border-white/15 px-8 h-12 text-sm rounded-xl hover:bg-white/8 hover:text-white transition-colors"
                asChild
              >
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
