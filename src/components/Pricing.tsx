import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { getPackages } from "@/lib/api";

const TIER_COLORS: Record<string, string> = {
  Starter: "bg-gray-100 text-gray-700 border-gray-200",
  Basic: "bg-blue-50 text-blue-700 border-blue-200",
  Standard: "bg-green-50 text-green-700 border-green-200",
  Advanced: "bg-purple-50 text-purple-700 border-purple-200",
  Professional: "bg-orange-50 text-orange-700 border-orange-200",
  Executive: "bg-red-50 text-red-700 border-red-200",
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
    <section id="pricing" className="py-28 bg-muted/40">
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Investment Packages
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            30 Packages, One Goal
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose a package that fits your budget. Daily returns credited automatically. All packages in Naira.
          </p>
        </motion.div>

        <div className="flex gap-2 flex-wrap justify-center mb-10">
          {tiers.map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${tierFilter === t ? "bg-primary text-white border-primary" : "bg-background border-border text-muted-foreground hover:border-primary hover:text-foreground"}`}>
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {filtered.map((pkg, i) => {
              const isFeatured = FEATURED_TIERS.includes(pkg.tier);
              return (
                <motion.div key={pkg.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: (i % 5) * 0.06, duration: 0.5 }}
                  className={`relative rounded-2xl p-5 flex flex-col border transition-all hover:-translate-y-1 hover:shadow-lg ${isFeatured ? "bg-foreground text-primary-foreground border-foreground shadow-xl" : "bg-background border-border"}`}>
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">Popular</span>
                    </div>
                  )}
                  <div className={`inline-flex items-center px-2 py-1 rounded-lg border text-xs font-semibold mb-3 self-start ${TIER_COLORS[pkg.tier] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {pkg.tier}
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isFeatured ? "text-white" : "text-foreground"}`}>{pkg.name}</h3>
                  <div className={`text-2xl font-bold mb-3 ${isFeatured ? "text-primary" : "text-primary"}`}>
                    ₦{parseFloat(pkg.price).toLocaleString()}
                  </div>
                  <div className="space-y-1.5 mb-4 flex-1">
                    <div className="flex justify-between text-xs">
                      <span className={isFeatured ? "text-white/60" : "text-muted-foreground"}>Daily Return</span>
                      <span className={`font-bold ${isFeatured ? "text-green-400" : "text-green-600"}`}>+{pkg.daily_return_pct}%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isFeatured ? "text-white/60" : "text-muted-foreground"}>Duration</span>
                      <span className={`font-semibold ${isFeatured ? "text-white" : ""}`}>{pkg.duration_days} days</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className={isFeatured ? "text-white/60" : "text-muted-foreground"}>Total ROI</span>
                      <span className={`font-bold ${isFeatured ? "text-primary" : "text-primary"}`}>+{parseFloat(pkg.total_roi).toFixed(1)}%</span>
                    </div>
                    <div className={`h-px my-2 ${isFeatured ? "bg-white/10" : "bg-border"}`} />
                    <div className="flex justify-between text-xs">
                      <span className={isFeatured ? "text-white/60" : "text-muted-foreground"}>Est. Return</span>
                      <span className={`font-bold text-xs ${isFeatured ? "text-white" : ""}`}>
                        ₦{(parseFloat(pkg.price) * (1 + parseFloat(pkg.total_roi) / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                  <Button asChild size="sm"
                    className={`w-full rounded-xl text-xs font-semibold ${isFeatured ? "bg-primary text-white hover:brightness-110" : "bg-foreground text-primary-foreground hover:brightness-110"}`}>
                    <Link to="/register">Get Started</Link>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> Secured by Paystack</div>
          <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Daily returns auto-credited</div>
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">₦10k+</span> min. balance to withdraw
          </div>
        </motion.div>
      </div>
    </section>
  );
}
