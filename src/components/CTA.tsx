'use client';

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const perks = ["No hidden fees", "Start from ₦1,000", "Dedicated advisor", "Cancel anytime"];

export default function CTA() {
  return (
    <section id="contact" className="py-28 bg-background">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 40, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-3xl bg-foreground text-primary-foreground p-12 md:p-20">
          <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/5 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              Start Today
            </motion.div>

            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.15 }} className="font-display text-4xl md:text-6xl font-bold mb-6">
              Your Wealth Journey <span className="text-primary">Starts Now</span>
            </motion.h2>

            <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.2 }} className="text-white/60 text-lg max-w-lg mx-auto mb-10">
              Join 50,000+ investors who trust Smart Invest to grow and protect their wealth with institutional-grade strategies.
            </motion.p>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.25 }} className="flex flex-wrap justify-center gap-6 mb-10">
              {perks.map((perk, i) => (
                <motion.div key={perk} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.28 + i * 0.06 }}
                  className="flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  {perk}
                </motion.div>
              ))}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.35 }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-primary text-primary-foreground font-semibold px-10 py-6 text-base rounded-xl hover:brightness-110 transition-all" asChild>
                <Link href="/register">Open Free Account <ArrowRight className="ml-2 w-5 h-5" /></Link>
              </Button>
              <Button variant="ghost" size="lg" className="text-white border border-white/20 px-8 py-6 text-base rounded-xl hover:bg-white/10">
                Schedule a Call
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
