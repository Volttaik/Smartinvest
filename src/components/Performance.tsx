'use client';

import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const data = [
  { month: "Jan", smart: 4.2,  sp500: 2.1  },
  { month: "Feb", smart: 7.1,  sp500: 3.8  },
  { month: "Mar", smart: 5.8,  sp500: 1.2  },
  { month: "Apr", smart: 9.4,  sp500: 4.5  },
  { month: "May", smart: 12.3, sp500: 6.1  },
  { month: "Jun", smart: 10.7, sp500: 5.4  },
  { month: "Jul", smart: 15.1, sp500: 8.2  },
  { month: "Aug", smart: 13.6, sp500: 7.9  },
  { month: "Sep", smart: 17.2, sp500: 9.3  },
  { month: "Oct", smart: 15.8, sp500: 8.7  },
  { month: "Nov", smart: 18.4, sp500: 11.2 },
  { month: "Dec", smart: 21.0, sp500: 12.4 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-foreground rounded-xl px-4 py-3 shadow-xl text-sm min-w-[160px] border border-white/10">
      <div className="text-white/50 text-xs font-medium mb-2">{label} 2024</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-6 mb-1">
          <span className="flex items-center gap-1.5 text-white/60 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey === "smart" ? "SmartInvest" : "S&P 500"}
          </span>
          <span className="font-bold text-white text-xs">+{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const metrics = [
  { label: "YTD Return",    value: "+21.0%", sub: "vs market avg 12.4%", color: "text-emerald-600" },
  { label: "vs S&P 500",   value: "+8.6%",  sub: "outperformance",       color: "text-emerald-600" },
  { label: "Max Drawdown", value: "-4.2%",  sub: "12-month low",          color: "text-primary" },
  { label: "Sharpe Ratio", value: "2.41",   sub: "risk-adjusted return",  color: "text-foreground" },
];

export default function Performance() {
  return (
    <section id="portfolio" className="py-28 bg-background border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground font-medium uppercase tracking-wider mb-6">
            Track Record
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
            Performance That<br /><span className="red-gradient italic">Speaks for Itself</span>
          </h2>
          <p className="text-muted-foreground text-base">
            Our strategies consistently outperform benchmarks — 21% YTD vs 12.4% for the S&P 500.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Metrics */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 content-start">
            {metrics.map(({ label, value, sub, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-muted/40 border border-border rounded-2xl p-5"
              >
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2">{label}</div>
                <div className={`text-2xl font-bold font-display mb-1 tracking-tight ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-2 bg-background border border-border rounded-2xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-7">
              <div>
                <div className="font-semibold text-sm text-foreground">Annual Performance</div>
                <div className="text-xs text-muted-foreground mt-0.5">2024 Year-to-Date</div>
              </div>
              <div className="flex items-center gap-5 text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
                  SmartInvest
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-border inline-block" />
                  S&amp;P 500
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="smartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 84% 42%)" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="hsl(0 84% 42%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(220 13% 70%)" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="hsl(220 13% 70%)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="2 6" stroke="hsl(220 13% 93%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(220 9% 55%)" }}
                  axisLine={false} tickLine={false} dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(220 9% 55%)" }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `${v}%`} dx={-4}
                />
                <ReferenceLine y={0} stroke="hsl(220 13% 91%)" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(220 13% 88%)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />

                <Area type="monotoneX" dataKey="sp500"
                  stroke="hsl(220 9% 70%)" strokeWidth={1.5} strokeDasharray="5 4"
                  fill="url(#spGrad)" dot={false}
                  activeDot={{ r: 3.5, fill: "hsl(220 9% 60%)", stroke: "white", strokeWidth: 2 }}
                />
                <Area type="monotoneX" dataKey="smart"
                  stroke="hsl(0 84% 42%)" strokeWidth={2}
                  fill="url(#smartGrad)" dot={false}
                  activeDot={{ r: 5, fill: "hsl(0 84% 42%)", stroke: "white", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              SmartInvest outperformed the S&P 500 by
              <span className="text-emerald-600 font-semibold">+8.6%</span> this year
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
