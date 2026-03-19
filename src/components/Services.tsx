import { motion } from "framer-motion";
import { BarChart3, Landmark, LineChart, Shield, Globe2, Briefcase, ArrowRight } from "lucide-react";

const services = [
  {
    icon: LineChart,
    title: "Equity Portfolios",
    desc: "Diversified stock portfolios built around your risk profile and long-term financial goals.",
    tag: "Most Popular",
    tagColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: Landmark,
    title: "Fixed Income",
    desc: "Government and corporate bond strategies for stable, predictable returns.",
    tag: null,
    tagColor: "",
  },
  {
    icon: Globe2,
    title: "Global Markets",
    desc: "Access to international equities, emerging markets, and cross-border opportunities.",
    tag: null,
    tagColor: "",
  },
  {
    icon: BarChart3,
    title: "Alternative Assets",
    desc: "Private equity, hedge funds, REITs, and commodities to diversify beyond traditional assets.",
    tag: "High Growth",
    tagColor: "bg-green-50 text-green-700 border-green-200",
  },
  {
    icon: Shield,
    title: "Risk Management",
    desc: "Advanced hedging and portfolio protection strategies to safeguard your capital.",
    tag: null,
    tagColor: "",
  },
  {
    icon: Briefcase,
    title: "Wealth Planning",
    desc: "Holistic financial planning including estate, tax optimization, and retirement strategies.",
    tag: null,
    tagColor: "",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function Services() {
  return (
    <section id="services" className="py-28 bg-muted/40 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Our Services
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Investment Solutions<br />for Every Goal
          </h2>
          <p className="text-muted-foreground text-lg">
            From conservative income strategies to aggressive growth — we tailor every investment to your needs.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map(({ icon: Icon, title, desc, tag, tagColor }) => (
            <motion.div
              key={title}
              variants={card}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group bg-background border border-border rounded-2xl p-7 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-lg relative overflow-hidden"
            >
              {/* Hover background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {tag && (
                <span className={`absolute top-4 right-4 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${tagColor}`}>
                  {tag}
                </span>
              )}

              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.2 }}
                className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300"
              >
                <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </motion.div>

              <h3 className="font-semibold text-base mb-2 text-foreground">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>

              <motion.div
                initial={{ opacity: 0, x: -8 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="mt-5 text-primary text-sm font-medium flex items-center gap-1.5 group-hover:opacity-100 opacity-0 transition-opacity"
              >
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
