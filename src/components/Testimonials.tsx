'use client';

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Tech Entrepreneur",
    avatar: "SM",
    color: "bg-primary",
    rating: 5,
    text: "Smart Invest transformed how I think about wealth. In 18 months my portfolio grew 34%. The transparency and personalized approach is unlike anything I've experienced.",
    growth: "+34%",
  },
  {
    name: "James Okonkwo",
    role: "CFO, Global Corp",
    avatar: "JO",
    color: "bg-foreground",
    rating: 5,
    text: "As a finance professional, I'm skeptical of platforms. But Smart Invest's data-driven approach genuinely impressed me. Outstanding results, zero surprises.",
    growth: "+22%",
  },
  {
    name: "Elena Vasquez",
    role: "Retired Executive",
    avatar: "EV",
    color: "bg-primary/80",
    rating: 5,
    text: "I needed a strategy to preserve and grow my retirement savings. Smart Invest delivered beyond expectations — consistent returns with minimal risk.",
    growth: "+18%",
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 bg-muted/40 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Client Stories
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            What Our Clients Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Thousands of investors trust Smart Invest with their financial future.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, avatar, color, rating, text, growth }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="bg-background border border-border rounded-2xl p-8 hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative group"
            >
              {/* Quote icon */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <Quote className="w-5 h-5 text-primary/20" />
              </div>

              {/* Stars + growth badge */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex gap-1">
                  {Array.from({ length: rating }).map((_, j) => (
                    <motion.div
                      key={j}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.12 + j * 0.05, type: "spring", stiffness: 300 }}
                    >
                      <Star className="w-4 h-4 fill-primary text-primary" />
                    </motion.div>
                  ))}
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                  {growth} YTD
                </span>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-7">"{text}"</p>

              <div className="flex items-center gap-3 pt-5 border-t border-border">
                <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                  {avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">{name}</div>
                  <div className="text-xs text-muted-foreground">{role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          {["4.9★ on Trustpilot", "50,000+ Happy Investors", "#1 Rated Investment Platform 2024"].map(item => (
            <div key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
