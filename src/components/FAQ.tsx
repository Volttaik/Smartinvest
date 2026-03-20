'use client';

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "How much money do I need to start investing with Nexios?",
    a: "You can open an account for free with no minimum. Our paid plans start managing portfolios from ₦1,000. The Growth plan supports up to ₦250,000, while Elite has no upper limit.",
  },
  {
    q: "Is my money safe with Nexios Capital?",
    a: "Absolutely. Your assets are held in segregated accounts protected by SIPC insurance up to ₦500,000. We use bank-level 256-bit encryption and are SEC-registered. We never lend or use client funds for our own operations.",
  },
  {
    q: "How does Nexios outperform the S&P 500?",
    a: "Our quantitative models analyze thousands of data points in real-time — macro trends, sector rotations, earnings signals, and risk metrics. Combined with daily rebalancing and tax-loss harvesting, we consistently find alpha the market misses.",
  },
  {
    q: "Can I withdraw my money at any time?",
    a: "Yes. There are no lock-up periods or early withdrawal penalties. You can initiate a withdrawal at any time and funds typically settle within 1–3 business days depending on asset type.",
  },
  {
    q: "Do I need investment experience to use Nexios?",
    a: "Not at all. Nexios is designed for investors at every level. Our onboarding questionnaire determines your risk tolerance and goals, and our AI builds and manages your portfolio automatically. You don't need to make any trading decisions.",
  },
  {
    q: "What fees does Nexios charge?",
    a: "We charge a flat monthly subscription fee — no percentage of AUM, no trading commissions, no hidden fees. The Starter plan is completely free. Growth is ₦29/month (or ₦24 billed annually) and Elite is ₦99/month.",
  },
];

export default function FAQ() {
  return (
    <section className="py-28 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              FAQ
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-foreground leading-tight">
              Frequently Asked<br />
              <span className="red-gradient">Questions</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Everything you need to know before getting started. Still have questions?
            </p>
            <a
              href="mailto:support@nexios.com"
              className="text-sm text-primary font-semibold hover:underline inline-flex items-center gap-1.5"
            >
              Contact our team →
            </a>
          </motion.div>

          {/* Right — Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map(({ q, a }, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-border rounded-xl px-5 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="text-sm font-semibold text-foreground text-left py-4 hover:no-underline hover:text-primary transition-colors">
                    {q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                    {a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
