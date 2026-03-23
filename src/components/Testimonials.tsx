'use client';

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Tech Entrepreneur",
    initials: "SM",
    rating: 5,
    text: "SmartInvest transformed how I think about wealth. In 18 months my portfolio grew 34%. The transparency and personalized approach is unlike anything I've experienced.",
    growth: "+34%",
  },
  {
    name: "James Okonkwo",
    role: "CFO, Global Corp",
    initials: "JO",
    rating: 5,
    text: "As a finance professional, I'm skeptical of platforms. But SmartInvest's data-driven approach genuinely impressed me. Outstanding results, zero surprises.",
    growth: "+22%",
  },
  {
    name: "Elena Vasquez",
    role: "Retired Executive",
    initials: "EV",
    rating: 5,
    text: "I needed a strategy to preserve and grow my retirement savings. SmartInvest delivered beyond expectations — consistent returns with minimal risk.",
    growth: "+18%",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-lg mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider mb-6">
            Client Stories
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
            What Our Investors Say
          </h2>
          <p className="text-muted-foreground text-base">
            Thousands of investors trust SmartInvest with their financial future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, initials, rating, text, growth }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55 }}
              className="bg-background border border-border rounded-2xl p-7 hover:border-foreground/15 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">
                  {growth}
                </span>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-7">&ldquo;{text}&rdquo;</p>

              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ delay: 0.3 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          {["4.9★ on Trustpilot", "50,000+ Happy Investors", "#1 Rated Investment Platform"].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
