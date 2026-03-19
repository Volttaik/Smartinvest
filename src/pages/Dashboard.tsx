import { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, Bell, Settings, LogOut,
  BarChart3, Wallet, ArrowUpRight, ArrowDownRight,
  DollarSign, Activity, Menu, X, PieChart as PieIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const portfolioData = [
  { date: "Jan", value: 210000 }, { date: "Feb", value: 218000 },
  { date: "Mar", value: 214000 }, { date: "Apr", value: 225000 },
  { date: "May", value: 232000 }, { date: "Jun", value: 228000 },
  { date: "Jul", value: 238000 }, { date: "Aug", value: 235000 },
  { date: "Sep", value: 244000 }, { date: "Oct", value: 240000 },
  { date: "Nov", value: 249000 }, { date: "Dec", value: 248500 },
];

const allocationData = [
  { name: "Equities", value: 60, color: "hsl(0 85% 45%)" },
  { name: "Bonds", value: 25, color: "hsl(0 0% 40%)" },
  { name: "Alternatives", value: 10, color: "hsl(0 0% 70%)" },
  { name: "Cash", value: 5, color: "hsl(0 0% 88%)" },
];

const holdings = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Tech", alloc: 18, value: "₦44,730", gain: "+21.4%", up: true },
  { symbol: "NVDA", name: "NVIDIA Corp.", sector: "Tech", alloc: 14, value: "₦34,790", gain: "+84.2%", up: true },
  { symbol: "MSFT", name: "Microsoft", sector: "Tech", alloc: 12, value: "₦29,820", gain: "+16.8%", up: true },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Finance", alloc: 9, value: "₦22,365", gain: "+12.1%", up: true },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Auto", alloc: 7, value: "₦17,395", gain: "-8.3%", up: false },
];

const transactions = [
  { symbol: "AAPL", name: "Apple Inc.", type: "Buy", amount: "+₦2,400", date: "Dec 14", up: true },
  { symbol: "NVDA", name: "NVIDIA Corp.", type: "Buy", amount: "+₦3,800", date: "Dec 12", up: true },
  { symbol: "TSLA", name: "Tesla Inc.", type: "Sell", amount: "-₦1,200", date: "Dec 10", up: false },
  { symbol: "MSFT", name: "Microsoft", type: "Buy", amount: "+₦1,600", date: "Dec 8", up: true },
];

const navItems = [
  { icon: BarChart3, label: "Overview", active: true },
  { icon: PieIcon, label: "Portfolio", active: false },
  { icon: Activity, label: "Markets", active: false },
  { icon: Wallet, label: "Transactions", active: false },
  { icon: Settings, label: "Settings", active: false },
];

const kpis = [
  { label: "Total Value", value: "₦248,500", sub: "+1.32% today", up: true, icon: DollarSign },
  { label: "YTD Return", value: "+18.4%", sub: "vs 12.4% S&P 500", up: true, icon: TrendingUp },
  { label: "Monthly Gain", value: "₦3,240", sub: "+26.5% vs last mo.", up: true, icon: Activity },
  { label: "Positions", value: "24", sub: "Across 5 sectors", up: null, icon: BarChart3 },
];

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-foreground text-primary-foreground rounded-xl px-4 py-3 shadow-xl text-sm">
      <div className="text-white/50 text-xs mb-1">{payload[0].payload.date} 2024</div>
      <div className="font-bold text-white text-base">₦{payload[0].value.toLocaleString()}</div>
    </div>
  );
};

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-foreground text-white rounded-xl px-3 py-2 shadow-xl text-xs">
      <span className="font-bold">{payload[0].name}</span>: {payload[0].value}%
    </div>
  );
};

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRange, setActiveRange] = useState("1Y");

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-60 bg-foreground text-primary-foreground z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold font-display text-base text-white">
              Smart Invest<span className="text-primary">.</span>
            </span>
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 flex-1 space-y-0.5 mt-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <motion.button
              key={label}
              whileHover={{ x: 2 }}
              transition={{ duration: 0.15 }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
            </motion.button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 cursor-pointer transition-colors group">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">JD</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">John Doe</div>
              <div className="text-xs text-white/40 truncate">Growth Plan</div>
            </div>
            <LogOut className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 flex-shrink-0 transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-semibold text-foreground text-base">Good morning, John 👋</h1>
              <p className="text-xs text-muted-foreground">Portfolio overview · Dec 14, 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative w-9 h-9">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground rounded-lg font-semibold text-xs px-4 hover:brightness-110">
              + Add Funds
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-5 max-w-6xl">

          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map(({ label, value, sub, up, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-background border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                  <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-xl font-bold font-display text-foreground mb-1">{value}</div>
                <div className={`text-xs font-medium flex items-center gap-0.5 ${up === true ? "text-green-600" : up === false ? "text-primary" : "text-muted-foreground"}`}>
                  {up === true && <ArrowUpRight className="w-3 h-3" />}
                  {up === false && <ArrowDownRight className="w-3 h-3" />}
                  {sub}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Chart + Allocation row */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Portfolio chart — 2/3 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-background border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-semibold text-foreground">Portfolio Value</div>
                  <div className="text-xs text-muted-foreground">12-Month Performance</div>
                </div>
                <div className="flex gap-1">
                  {["1M", "3M", "6M", "1Y"].map(p => (
                    <button
                      key={p}
                      onClick={() => setActiveRange(p)}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${activeRange === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(0 85% 45%)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(0 85% 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="hsl(0 0% 94%)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 55%)" }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} dx={-4} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(0 0% 88%)", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                  <Area type="monotoneX" dataKey="value" stroke="hsl(0 85% 45%)" strokeWidth={3} fill="url(#dashGrad)" dot={false} activeDot={{ r: 6, fill: "hsl(0 85% 45%)", stroke: "white", strokeWidth: 2.5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Allocation donut — 1/3 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="bg-background border border-border rounded-2xl p-6 flex flex-col"
            >
              <div className="font-semibold text-foreground mb-1">Allocation</div>
              <div className="text-xs text-muted-foreground mb-4">By asset class</div>

              <div className="relative flex items-center justify-center flex-1 py-2">
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {allocationData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<AllocationTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-lg font-bold text-foreground font-display">₦248k</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {allocationData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{value}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Holdings + Transactions row */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Holdings — 2/3 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="lg:col-span-2 bg-background border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="font-semibold text-foreground">Top Holdings</div>
                <button className="text-xs text-primary font-medium hover:underline">View all 24</button>
              </div>

              {/* Header */}
              <div className="grid grid-cols-12 text-[10px] text-muted-foreground uppercase tracking-wide font-semibold px-2 mb-2">
                <div className="col-span-4">Asset</div>
                <div className="col-span-3 text-right">Value</div>
                <div className="col-span-2 text-right">Alloc</div>
                <div className="col-span-3 text-right">Return</div>
              </div>

              <div className="space-y-1">
                {holdings.map(({ symbol, name, sector, alloc, value, gain, up }, i) => (
                  <motion.div
                    key={symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="grid grid-cols-12 items-center px-2 py-2.5 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 ${up ? "bg-primary/80" : "bg-muted-foreground/60"}`}>
                        {symbol.slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{symbol}</div>
                        <div className="text-[10px] text-muted-foreground hidden sm:block">{sector}</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-right text-xs font-semibold text-foreground">{value}</div>
                    <div className="col-span-2 text-right">
                      <div className="inline-flex items-center justify-end">
                        <div className="text-xs text-muted-foreground">{alloc}%</div>
                      </div>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-primary"}`}>
                        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {gain}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Transactions — 1/3 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.36 }}
              className="bg-background border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="font-semibold text-foreground">Activity</div>
                <button className="text-xs text-primary font-medium hover:underline">View all</button>
              </div>
              <div className="space-y-3">
                {transactions.map(({ symbol, name, type, amount, date, up }, i) => (
                  <motion.div
                    key={`${symbol}-${date}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.07 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${up ? "bg-green-50" : "bg-primary/5"}`}>
                        {up ? <ArrowUpRight className="w-3.5 h-3.5 text-green-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{symbol}</div>
                        <div className="text-[10px] text-muted-foreground">{date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold ${up ? "text-green-600" : "text-primary"}`}>{amount}</div>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 ${up ? "border-green-200 text-green-600" : "border-primary/20 text-primary"}`}>
                        {type}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick stats */}
              <div className="mt-5 pt-4 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">This month</span>
                  <span className="font-semibold text-green-600">+₦6,440</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total invested</span>
                  <span className="font-semibold text-foreground">₦210,000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total gains</span>
                  <span className="font-semibold text-green-600">+₦38,500</span>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
