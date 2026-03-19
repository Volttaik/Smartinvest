import { useState, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Bell, Settings, LogOut,
  BarChart3, Wallet, ArrowUpRight, ArrowDownRight,
  DollarSign, Activity, Menu, X, PieChart as PieIcon,
  CreditCard, Target, Layers, Zap, Eye, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

/* ── Data ─────────────────────────────────────────────── */

const portfolioData = [
  { date: "Jan", value: 210000 }, { date: "Feb", value: 218000 },
  { date: "Mar", value: 214000 }, { date: "Apr", value: 225000 },
  { date: "May", value: 232000 }, { date: "Jun", value: 228000 },
  { date: "Jul", value: 238000 }, { date: "Aug", value: 235000 },
  { date: "Sep", value: 244000 }, { date: "Oct", value: 240000 },
  { date: "Nov", value: 249000 }, { date: "Dec", value: 248500 },
];

const miniSparkline = [40, 45, 38, 52, 48, 60, 55, 70, 65, 78, 72, 85];

const allocationData = [
  { name: "Equities", value: 60, color: "hsl(var(--primary))" },
  { name: "Bonds", value: 25, color: "hsl(var(--muted-foreground))" },
  { name: "Alternatives", value: 10, color: "hsl(var(--border))" },
  { name: "Cash", value: 5, color: "hsl(var(--muted))" },
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
  { symbol: "JPM", name: "JPMorgan", type: "Buy", amount: "+₦900", date: "Dec 5", up: true },
];

const navItems = [
  { icon: BarChart3, label: "Overview", active: true },
  { icon: PieIcon, label: "Portfolio", active: false },
  { icon: Activity, label: "Markets", active: false },
  { icon: Wallet, label: "Transactions", active: false },
  { icon: Settings, label: "Settings", active: false },
];

/* ── Investment Cards Data ────────────────────────────── */

const investmentCards = [
  {
    id: "portfolio",
    title: "Portfolio Value",
    icon: Wallet,
    value: "₦248,500",
    change: "+₦3,240",
    changePercent: "+1.32%",
    changePeriod: "today",
    positive: true,
    details: [
      { label: "Invested", value: "₦210,000" },
      { label: "Returns", value: "₦38,500" },
      { label: "YTD", value: "+18.4%" },
    ],
  },
  {
    id: "profit",
    title: "Total Profit/Loss",
    icon: TrendingUp,
    value: "+₦38,500",
    change: "+₦6,440",
    changePercent: "+26.5%",
    changePeriod: "this month",
    positive: true,
    details: [
      { label: "Realized", value: "₦22,300" },
      { label: "Unrealized", value: "₦16,200" },
      { label: "Dividends", value: "₦2,840" },
    ],
  },
  {
    id: "performance",
    title: "Performance",
    icon: Target,
    value: "+18.4%",
    change: "+8.6%",
    changePercent: "vs S&P 500",
    changePeriod: "YTD",
    positive: true,
    details: [
      { label: "Best Month", value: "+4.2%" },
      { label: "Worst Month", value: "-1.8%" },
      { label: "Sharpe", value: "2.41" },
    ],
  },
  {
    id: "allocation",
    title: "Asset Allocation",
    icon: Layers,
    value: "4 Classes",
    change: "Balanced",
    changePercent: "Risk Profile",
    changePeriod: "",
    positive: true,
    details: [
      { label: "Equities", value: "60%" },
      { label: "Bonds", value: "25%" },
      { label: "Alt + Cash", value: "15%" },
    ],
  },
  {
    id: "activity",
    title: "Recent Activity",
    icon: Zap,
    value: "5 Trades",
    change: "+₦7,500",
    changePercent: "net invested",
    changePeriod: "this week",
    positive: true,
    details: [
      { label: "Buys", value: "4" },
      { label: "Sells", value: "1" },
      { label: "Volume", value: "₦9,700" },
    ],
  },
  {
    id: "highlight",
    title: "Top Performer",
    icon: CreditCard,
    value: "NVDA",
    change: "+84.2%",
    changePercent: "all-time",
    changePeriod: "",
    positive: true,
    details: [
      { label: "Value", value: "₦34,790" },
      { label: "Cost Basis", value: "₦18,880" },
      { label: "Gain", value: "₦15,910" },
    ],
  },
];

/* ── Card Carousel Component ──────────────────────────── */

function CardCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const dragX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 340;
  const CARD_GAP = 16;
  const VISIBLE_CARDS = 3;

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 60;
    if (info.offset.x < -threshold && activeIndex < investmentCards.length - 1) {
      setActiveIndex(i => i + 1);
    } else if (info.offset.x > threshold && activeIndex > 0) {
      setActiveIndex(i => i - 1);
    }
  };

  const goTo = (dir: number) => {
    setActiveIndex(i => Math.max(0, Math.min(investmentCards.length - 1, i + dir)));
  };

  return (
    <div className="relative">
      {/* Navigation Arrows */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-foreground text-base">Financial Overview</h2>
          <p className="text-xs text-muted-foreground">Swipe or use arrows to browse</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goTo(-1)}
            disabled={activeIndex === 0}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => goTo(1)}
            disabled={activeIndex === investmentCards.length - 1}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Stack */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl"
        style={{ height: 220 }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{ x: dragX }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          <AnimatePresence mode="popLayout">
            {investmentCards.map((card, i) => {
              const offset = i - activeIndex;
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 2;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    x: offset * (CARD_WIDTH + CARD_GAP) + (offset > 0 ? 20 : offset < 0 ? -20 : 0),
                    scale: isActive ? 1 : 0.92 - Math.abs(offset) * 0.03,
                    opacity: isActive ? 1 : 0.6 - Math.abs(offset) * 0.15,
                    zIndex: 10 - Math.abs(offset),
                    rotateY: offset * -2,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="absolute top-0 left-0 w-full max-w-[340px] sm:max-w-[380px]"
                  style={{ originX: 0.5 }}
                >
                  <InvestmentCard card={card} isActive={isActive} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-2 mt-4">
        {investmentCards.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => setActiveIndex(i)}
            animate={{
              width: i === activeIndex ? 24 : 8,
              backgroundColor: i === activeIndex ? "hsl(var(--primary))" : "hsl(var(--border))",
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="h-2 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

function InvestmentCard({ card, isActive }: { card: typeof investmentCards[0]; isActive: boolean }) {
  const Icon = card.icon;

  return (
    <motion.div
      whileHover={isActive ? { y: -2, transition: { duration: 0.2 } } : {}}
      className="relative overflow-hidden rounded-2xl bg-foreground text-primary-foreground p-6 shadow-xl h-[210px] select-none"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/15 -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-primary/8 translate-y-1/2 -translate-x-1/2" />
      {/* Subtle card pattern lines */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 via-primary/20 to-transparent" />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">{card.title}</span>
          </div>
          <Eye className="w-3.5 h-3.5 text-white/30" />
        </div>

        {/* Value */}
        <div className="mb-1">
          <div className="text-2xl sm:text-3xl font-bold font-display">{card.value}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${card.positive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
              {card.change}
            </span>
            <span className="text-white/40 text-xs">{card.changePercent} {card.changePeriod}</span>
          </div>
        </div>

        {/* Bottom details */}
        <div className="mt-auto flex items-center gap-4 pt-3 border-t border-white/10">
          {card.details.map(({ label, value }) => (
            <div key={label} className="flex-1 min-w-0">
              <div className="text-[10px] text-white/40 uppercase tracking-wide truncate">{label}</div>
              <div className="text-sm font-semibold text-white/90">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Chart Tooltips ───────────────────────────────────── */

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

/* ── Mini Sparkline ───────────────────────────────────── */

function MiniSparkline({ data, positive = true }: { data: number[]; positive?: boolean }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        fill="none"
        stroke={positive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

/* ── Main Dashboard ───────────────────────────────────── */

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeRange, setActiveRange] = useState("1Y");

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static top-0 left-0 h-full w-60 bg-foreground text-primary-foreground z-50 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold font-display text-base text-white">
              Smart Invest<span className="text-primary">.</span>
            </span>
          </Link>
          <button className="lg:hidden text-white/50 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="p-3 flex-1 space-y-0.5 mt-1">
          {navItems.map(({ icon: Icon, label, active }) => (
            <motion.button
              key={label}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active ? "bg-primary/20 text-primary" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                />
              )}
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

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between"
        >
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
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full"
              />
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground rounded-lg font-semibold text-xs px-4 hover:brightness-110 transition-all">
              + Add Funds
            </Button>
          </div>
        </motion.div>

        <div className="p-6 space-y-6 max-w-6xl">

          {/* ── Swipeable Card Carousel ─────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <CardCarousel />
          </motion.div>

          {/* ── KPI Quick Stats ─────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Value", value: "₦248,500", sub: "+1.32% today", up: true, icon: DollarSign },
              { label: "YTD Return", value: "+18.4%", sub: "vs 12.4% S&P 500", up: true, icon: TrendingUp },
              { label: "Monthly Gain", value: "₦3,240", sub: "+26.5% vs last mo.", up: true, icon: Activity },
              { label: "Positions", value: "24", sub: "Across 5 sectors", up: null, icon: BarChart3 },
            ].map(({ label, value, sub, up, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="bg-background border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-md transition-all"
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

          {/* ── Chart + Allocation Row ──────────────── */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Portfolio chart — 2/3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 bg-background border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="font-semibold text-foreground">Portfolio Value</div>
                  <div className="text-xs text-muted-foreground">12-Month Performance</div>
                </div>
                <div className="flex gap-1">
                  {["1M", "3M", "6M", "1Y"].map(p => (
                    <motion.button
                      key={p}
                      onClick={() => setActiveRange(p)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${activeRange === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={portfolioData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 6" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} dy={6} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} dx={-4} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1.5, strokeDasharray: "4 4" }} />
                  <Area type="monotoneX" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fill="url(#dashGrad)" dot={false} activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "white", strokeWidth: 2.5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Allocation donut — 1/3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-lg font-bold text-foreground font-display">₦248k</div>
                  <div className="text-[10px] text-muted-foreground">Total</div>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {allocationData.map(({ name, value, color }) => (
                  <motion.div
                    key={name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                      <span className="text-muted-foreground">{name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{value}%</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Holdings + Recent Activity + Insights ── */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Holdings — 2/3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 bg-background border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="font-semibold text-foreground">Top Holdings</div>
                <button className="text-xs text-primary font-medium hover:underline">View all 24</button>
              </div>

              <div className="grid grid-cols-12 text-[10px] text-muted-foreground uppercase tracking-wide font-semibold px-2 mb-2">
                <div className="col-span-4">Asset</div>
                <div className="col-span-2 text-right">Value</div>
                <div className="col-span-2 text-right">Alloc</div>
                <div className="col-span-2 text-right">Return</div>
                <div className="col-span-2 text-right">Trend</div>
              </div>

              <div className="space-y-1">
                {holdings.map(({ symbol, sector, alloc, value, gain, up }, i) => (
                  <motion.div
                    key={symbol}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.42 + i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)", transition: { duration: 0.15 } }}
                    className="grid grid-cols-12 items-center px-2 py-2.5 rounded-xl cursor-pointer group"
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
                    <div className="col-span-2 text-right text-xs font-semibold text-foreground">{value}</div>
                    <div className="col-span-2 text-right text-xs text-muted-foreground">{alloc}%</div>
                    <div className="col-span-2 text-right">
                      <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-green-600" : "text-primary"}`}>
                        {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {gain}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <MiniSparkline data={miniSparkline} positive={up} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recent Activity + Insights — 1/3 */}
            <div className="space-y-5">
              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-background border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="font-semibold text-foreground">Activity</div>
                  <button className="text-xs text-primary font-medium hover:underline">View all</button>
                </div>
                <div className="space-y-3">
                  {transactions.map(({ symbol, type, amount, date, up }, i) => (
                    <motion.div
                      key={`${symbol}-${date}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.46 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      className="flex items-center justify-between cursor-pointer"
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
              </motion.div>

              {/* Investment Insights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-background border border-border rounded-2xl p-6"
              >
                <div className="font-semibold text-foreground mb-4">Insights</div>
                <div className="space-y-3">
                  {[
                    { emoji: "📈", title: "Portfolio is outperforming", desc: "Your returns beat the S&P 500 by 8.6% YTD", accent: true },
                    { emoji: "🎯", title: "Risk score: Low", desc: "Well-balanced across 4 asset classes", accent: false },
                    { emoji: "💡", title: "Consider rebalancing", desc: "Tech allocation is 4% above target", accent: false },
                  ].map((insight, i) => (
                    <motion.div
                      key={insight.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
                      whileHover={{ x: 2, transition: { duration: 0.15 } }}
                      className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${insight.accent ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"}`}
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">{insight.emoji}</span>
                      <div>
                        <div className="text-xs font-semibold text-foreground">{insight.title}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{insight.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-4 pt-4 border-t border-border space-y-2">
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

        </div>
      </main>
    </div>
  );
}
