import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const data = [
  { month: "Jan", smart: 4.2, sp500: 2.1 },
  { month: "Feb", smart: 7.1, sp500: 3.8 },
  { month: "Mar", smart: 5.8, sp500: 1.2 },
  { month: "Apr", smart: 9.4, sp500: 4.5 },
  { month: "May", smart: 12.3, sp500: 6.1 },
  { month: "Jun", smart: 10.7, sp500: 5.4 },
  { month: "Jul", smart: 15.1, sp500: 8.2 },
  { month: "Aug", smart: 13.6, sp500: 7.9 },
  { month: "Sep", smart: 17.2, sp500: 9.3 },
  { month: "Oct", smart: 15.8, sp500: 8.7 },
  { month: "Nov", smart: 18.4, sp500: 11.2 },
  { month: "Dec", smart: 21.0, sp500: 12.4 },
];

const CustomDot = (props: any) => {
  const { cx, cy, active } = props;
  if (!active) return null;
  return <circle cx={cx} cy={cy} r={5} fill="hsl(0 85% 45%)" stroke="white" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="bg-foreground text-primary-foreground rounded-xl px-4 py-3 shadow-xl text-sm min-w-[160px]"
    >
      <div className="text-white/50 text-xs font-medium mb-2 uppercase tracking-wide">{label} 2024</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            {p.dataKey === "smart" ? "Smart Invest" : "S&P 500"}
          </span>
          <span className="font-bold text-white">+{p.value}%</span>
        </div>
      ))}
    </motion.div>
  );
};

const metrics = [
  { label: "YTD Return", value: "+21.0%", sub: "vs market avg 12.4%", pos: true },
  { label: "vs S&P 500", value: "+8.6%", sub: "outperformance", pos: true },
  { label: "Max Drawdown", value: "-4.2%", sub: "12-month low", pos: false },
  { label: "Sharpe Ratio", value: "2.41", sub: "risk-adjusted return", pos: null },
];

export default function Performance() {
  return (
    <section id="portfolio" className="py-28 bg-background">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Track Record
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Performance That <span className="red-gradient">Speaks for Itself</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Our strategies consistently outperform benchmarks — 21% YTD vs 12.4% for the S&P 500.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Metric cards */}
          <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 content-start">
            {metrics.map(({ label, value, sub, pos }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-muted/40 border border-border rounded-2xl p-5 hover:border-primary/20 transition-colors"
              >
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{label}</div>
                <div className={`text-2xl font-bold font-display mb-1 ${pos === true ? "text-green-600" : pos === false ? "text-primary" : "text-foreground"}`}>
                  {value}
                </div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-background border border-border rounded-2xl p-6 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="font-semibold text-foreground text-base">Annual Performance</div>
                <div className="text-xs text-muted-foreground mt-0.5">2024 Year-to-Date</div>
              </div>
              <div className="flex items-center gap-5 text-xs">
                <span className="flex items-center gap-2 font-medium">
                  <span className="w-3 h-3 rounded-full bg-primary inline-block" />
                  Smart Invest
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-3 h-3 rounded-full bg-muted-foreground inline-block" />
                  S&P 500
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="smartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 85% 45%)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="hsl(0 85% 45%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0 0% 50%)" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="hsl(0 0% 50%)" stopOpacity={0} />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                <CartesianGrid strokeDasharray="3 6" stroke="hsl(0 0% 93%)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "hsl(0 0% 55%)", fontFamily: "Inter" }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(0 0% 55%)", fontFamily: "Inter" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `${v}%`}
                  dx={-4}
                />
                <ReferenceLine y={0} stroke="hsl(0 0% 88%)" strokeWidth={1} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "hsl(0 0% 88%)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />

                {/* S&P 500 — dashed underneath */}
                <Area
                  type="monotoneX"
                  dataKey="sp500"
                  stroke="hsl(0 0% 65%)"
                  strokeWidth={1.5}
                  strokeDasharray="5 4"
                  fill="url(#spGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: "hsl(0 0% 55%)", stroke: "white", strokeWidth: 2 }}
                />

                {/* Smart Invest — bold on top */}
                <Area
                  type="monotoneX"
                  dataKey="smart"
                  stroke="hsl(0 85% 45%)"
                  strokeWidth={3}
                  fill="url(#smartGrad)"
                  dot={false}
                  activeDot={{ r: 6, fill: "hsl(0 85% 45%)", stroke: "white", strokeWidth: 2.5 }}
                  filter="url(#glow)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {/* Bottom annotation */}
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground border-t border-border pt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
              Smart Invest outperformed the S&P 500 by <span className="text-green-600 font-semibold">+8.6%</span> this year
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
