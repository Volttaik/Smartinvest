'use client';

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

const faqs = [
  {
    q: "How much money do I need to start investing with SmartInvest?",
    a: "You can open an account for free. Investment packages start from as low as ₦5,000. Simply fund your wallet via Paystack and choose a package that fits your budget.",
  },
  {
    q: "Is my money safe with SmartInvest?",
    a: "All transactions are processed and secured via Paystack — Nigeria's leading payment infrastructure. Your wallet balance is stored securely and withdrawals require account verification.",
  },
  {
    q: "How are daily returns credited?",
    a: "Returns are calculated based on your chosen package's daily return percentage and credited to your wallet balance automatically each day. You can track all credits in your transaction history.",
  },
  {
    q: "Can I withdraw my money at any time?",
    a: "Yes. There are no lock-up periods. You can withdraw your ROI balance at any time (minimum ₦5,000). Capital withdrawal is also available with the 'Include Capital' option enabled.",
  },
  {
    q: "What is the referral program?",
    a: "Earn commission for every investor you refer. When someone signs up with your referral code and starts investing, you earn a percentage of their investment as commission — credited directly to your wallet.",
  },
  {
    q: "How long does a withdrawal take?",
    a: "Withdrawal requests are reviewed and processed within 1–3 business days. You'll receive a notification once your transfer has been completed.",
  },
];

export default function FAQ() {
  return (
    <section className="py-28 bg-muted/20 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:sticky lg:top-28"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider mb-7">
              FAQ
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-5 text-foreground leading-tight tracking-tight">
              Frequently Asked<br />
              <span className="red-gradient italic">Questions</span>
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
              Everything you need to know before getting started. Still have a question?
            </p>
            <Link
              href="/support"
              className="text-sm text-foreground font-medium hover:text-primary transition-colors inline-flex items-center gap-1.5 border border-border px-4 py-2 rounded-xl hover:border-primary/30"
            >
              Visit Support →
            </Link>
          </motion.div>

          {/* Right — Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <Accordion type="single" collapsible className="space-y-2.5">
              {faqs.map(({ q, a }, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border border-border rounded-xl px-5 bg-background data-[state=open]:border-foreground/20 transition-colors"
                >
                  <AccordionTrigger className="text-sm font-medium text-foreground text-left py-4 hover:no-underline">
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
