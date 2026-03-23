'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lock, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getPackages } from "@/lib/api";

const TIER_STYLES: Record<string, { badge: string; dot: string }> = {
  Starter:      { badge: "bg-zinc-100 text-zinc-600 border-zinc-200",   dot: "bg-zinc-400" },
  Basic:        { badge: "bg-sky-50 text-sky-700 border-sky-200",       dot: "bg-sky-500" },
  Standard:     { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  Advanced:     { badge: "bg-violet-50 text-violet-700 border-violet-200", dot: "bg-violet-500" },
  Professional: { badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  Executive:    { badge: "bg-red-50 text-red-700 border-red-200",       dot: "bg-primary" },
};

const FEATURED_TIERS = ["Standard", "Advanced", "Professional"];

export default function Pricing() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tierFilter, setTierFilter] = useState("All");

  useEffect(() => {
    getPackages().then(setPackages).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const tiers = ["All", "Starter", "Basic", "Standard", "Advanced", "Professional", "Executive"];
  const filtered = tierFilter === "All" ? packages : packages.filter(p => p.tier === tierFilter);

  return (
    <section id="pricing" className="py-28 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.55 }}
          className="text-center max-w-lg mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider mb-6">
            Investment Packages
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
            30 Packages,<br />One Goal
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Choose a package that fits your budget. Daily returns credited automatically. All amounts in Naira.
          </p>
        </motion.div>

        {/* Tier filters */}
        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {tiers.map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                tierFilter === t
                  ? "bg-foreground text-white border-foreground"
                  : "bg-background border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              }`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-border border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filtered.map((pkg, i) => {
              const isFeatured = FEATURED_TIERS.includes(pkg.tier);
              const tierStyle = TIER_STYLES[pkg.tier] || TIER_STYLES.Starter;
              const estReturn = parseFloat(pkg.price) * (1 + parseFloat(pkg.total_roi) / 100);

              return (
                <motion.div key={pkg.id || i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 5) * 0.05, duration: 0.45 }}
                  className={`relative rounded-2xl flex flex-col border transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                    isFeatured
                      ? "bg-foreground text-white border-foreground shadow-xl"
                      : "bg-background border-border hover:border-foreground/20 hover:shadow-md"
                  }`}
                >
                  {isFeatured && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary" />
                  )}

                  <div className="p-5 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold ${
                        isFeatured ? "bg-white/10 text-white/80 border-white/15" : tierStyle.badge
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isFeatured ? "bg-white/60" : tierStyle.dot}`} />
                        {pkg.tier}
                      </div>
                      {isFeatured && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Popular</span>
                      )}
                    </div>

                    <h3 className={`font-semibold text-sm mb-1 leading-snug ${isFeatured ? "text-white" : "text-foreground"}`}>{pkg.name}</h3>
                    <div className={`text-2xl font-bold font-display mb-4 tracking-tight ${isFeatured ? "text-white" : "text-foreground"}`}>
                      ₦{parseFloat(pkg.price).toLocaleString()}
                    </div>

                    {/* Stats */}
                    <div className="space-y-2 mb-5 flex-1">
                      {[
                        { label: "Daily Return", value: `+${pkg.daily_return_pct}%`, highlight: true },
                        { label: "Duration",     value: `${pkg.duration_days} days` },
                        { label: "Total ROI",    value: `+${parseFloat(pkg.total_roi).toFixed(1)}%` },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className={`text-[11px] ${isFeatured ? "text-white/50" : "text-muted-foreground"}`}>{label}</span>
                          <span className={`text-[11px] font-bold ${
                            highlight
                              ? isFeatured ? "text-emerald-400" : "text-emerald-600"
                              : isFeatured ? "text-white" : "text-foreground"
                          }`}>{value}</span>
                        </div>
                      ))}

                      <div className={`my-2 h-px ${isFeatured ? "bg-white/8" : "bg-border"}`} />

                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] ${isFeatured ? "text-white/50" : "text-muted-foreground"}`}>Est. Return</span>
                        <span className={`text-[11px] font-bold flex items-center gap-0.5 ${isFeatured ? "text-white" : "text-foreground"}`}>
                          <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                          ₦{estReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>

                    <Button asChild size="sm"
                      className={`w-full h-9 rounded-xl text-xs font-semibold transition-all ${
                        isFeatured
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-foreground text-white hover:bg-foreground/90"
                      }`}>
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-2"><Lock className="w-3.5 h-3.5" /> Secured by Paystack</div>
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <div className="flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5" /> Daily returns auto-credited</div>
          <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <div>Min. ₦5,000 withdrawal</div>
        </motion.div>
      </div>
    </section>
  );
}
