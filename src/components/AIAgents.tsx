import { motion } from "framer-motion";
import { Bot, Flame, Gem, Bitcoin, BarChart3, Shield, Cpu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const agents = [
  {
    icon: Flame,
    name: "Oil & Energy Agent",
    desc: "Monitors crude oil prices, OPEC decisions, and energy sector trends to identify high-confidence trading windows.",
    markets: ["WTI Crude", "Brent", "Natural Gas"],
    status: "Active",
  },
  {
    icon: Gem,
    name: "Gold & Commodities Agent",
    desc: "Tracks precious metals, agricultural futures, and commodity cycles to find inflation-resistant opportunities.",
    markets: ["Gold", "Silver", "Copper"],
    status: "Active",
  },
  {
    icon: Bitcoin,
    name: "Crypto Intelligence Agent",
    desc: "Analyzes blockchain data, whale movements, and market sentiment across major cryptocurrency exchanges.",
    markets: ["BTC", "ETH", "Altcoins"],
    status: "Active",
  },
  {
    icon: BarChart3,
    name: "Equity & Index Agent",
    desc: "Scans global equity markets, earnings data, and sector rotations to build optimized stock portfolios.",
    markets: ["S&P 500", "NASDAQ", "Emerging"],
    status: "Active",
  },
];

const capabilities = [
  {
    icon: Cpu,
    title: "Real-Time Analysis",
    desc: "AI agents process thousands of data points per second across global markets.",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    desc: "Continuous risk monitoring with automated hedging recommendations.",
  },
  {
    icon: Bot,
    title: "Adaptive Learning",
    desc: "Models evolve with market conditions, improving accuracy over time.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function AIAgents() {
  return (
    <section className="py-28 bg-foreground text-primary-foreground overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
              <Bot className="w-3 h-3" />
              AI Investment Agents
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              Intelligent Agents
              <br />
              <span className="text-primary">Working for You</span>
            </h2>
            <p className="text-white/60 text-lg leading-relaxed max-w-lg mb-8">
              Our AI-powered investment agents continuously analyze global markets, identify patterns,
              and execute strategies across multiple asset classes — so your portfolio is always optimized.
            </p>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground font-semibold px-8 rounded-xl hover:brightness-110 transition-all"
              asChild
            >
              <Link to="/register">
                Activate AI Agents <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </motion.div>

          {/* Capabilities */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4 lg:pt-8"
          >
            {capabilities.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-primary/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm mb-1">{title}</div>
                  <div className="text-white/50 text-sm leading-relaxed">{desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Agent Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {agents.map(({ icon: Icon, name, desc, markets, status }) => (
            <motion.div
              key={name}
              variants={card}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
            >
              {/* Status indicator */}
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400 font-medium">{status}</span>
              </div>

              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>

              <h3 className="font-semibold text-white text-sm mb-2">{name}</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-4">{desc}</p>

              {/* Market tags */}
              <div className="flex flex-wrap gap-1.5">
                {markets.map(m => (
                  <span key={m} className="text-[10px] font-medium text-white/40 bg-white/8 border border-white/10 px-2 py-0.5 rounded-full">
                    {m}
                  </span>
                ))}
              </div>

              {/* Hover arrow */}
              <motion.div
                initial={{ opacity: 0, x: -4 }}
                whileHover={{ opacity: 1, x: 0 }}
                className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="w-4 h-4 text-primary" />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40"
        >
          {[
            "4 Active AI Agents",
            "Real-Time Market Analysis",
            "Multi-Asset Coverage",
            "24/7 Automated Monitoring",
          ].map(item => (
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
