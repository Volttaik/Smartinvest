'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, LogOut, BarChart3, Wallet,
  ArrowUpRight, Activity, Menu,
  CreditCard, Zap, RefreshCw, Copy, Check, Package, AlertCircle,
  ChevronLeft, ChevronRight, Target, Layers, DollarSign, Bell,
  ArrowDownLeft, Plus, Minus, Clock, Star, PieChartIcon, Gem,
  Coins, LineChart, Flame,
  UserCircle, BellRing, ChevronDown, Search, CheckCheck,
  CalendarDays, Phone, MapPin, FileText, ShieldCheck, Shield, X,
  Lock, Camera, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

const AVATAR_COLORS = [
  "bg-primary", "bg-blue-500", "bg-green-500", "bg-purple-500",
  "bg-orange-500", "bg-teal-500", "bg-pink-500", "bg-indigo-500"
];
const AVATAR_ICONS = [TrendingUp, BarChart3, Activity, Zap, Wallet, CreditCard, ArrowUpRight, Star];

function AvatarIcon({ picture, size = "md" }: { picture?: string; size?: "sm" | "md" | "lg" }) {
  const idx = Math.abs((picture || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const Icon = AVATAR_ICONS[idx];
  const dim = size === "lg" ? "w-16 h-16" : size === "sm" ? "w-7 h-7" : "w-9 h-9";
  const icon = size === "lg" ? "w-7 h-7" : size === "sm" ? "w-3 h-3" : "w-4 h-4";
  if (picture && picture.startsWith("data:image/")) {
    return <img src={picture} alt="Avatar" className={`${dim} rounded-full object-cover shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full ${AVATAR_COLORS[idx]} flex items-center justify-center shrink-0`}>
      <Icon className={`${icon} text-white`} />
    </div>
  );
}

const PIE_COLORS = ["hsl(var(--primary))", "#3b82f6", "#10b981", "#8b5cf6", "#f97316"];
type Tab = "overview" | "invest" | "transactions" | "referrals" | "fund" | "withdraw" | "portfolio" | "assets" | "profile" | "notifications" | "security";
declare const PaystackPop: any;

/* ─────────────────────────────────────────
   PROFIT & LOSS CHART
───────────────────────────────────────── */
function PnLChart({ chartData, totalEarned, totalInvested }: {
  chartData: { month: string; earnings: number; invested: number }[];
  totalEarned: number;
  totalInvested: number;
}) {
  const [view, setView] = useState<"earnings" | "pnl">("earnings");
  const pnlData = chartData.map((d, i) => {
    const cumEarned = chartData.slice(0, i + 1).reduce((s, x) => s + x.earnings, 0);
    const cumInvested = chartData.slice(0, i + 1).reduce((s, x) => s + x.invested, 0);
    return { ...d, pnl: cumEarned - cumInvested };
  });
  const displayData = view === "earnings" ? chartData : pnlData;
  const dataKey = view === "earnings" ? "earnings" : "pnl";
  const latestVal = (displayData as any[])[displayData.length - 1]?.[dataKey] ?? 0;
  const prevVal = (displayData as any[])[displayData.length - 2]?.[dataKey] ?? 0;
  const isUp = latestVal >= prevVal;
  const changePct = prevVal !== 0 ? (((latestVal - prevVal) / Math.abs(prevVal)) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">Your Profit & Loss</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Based on your investment activity</p>
        </div>
        <div className="flex gap-1.5">
          {(["earnings", "pnl"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize
                ${view === v ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {v === "earnings" ? "Returns" : "P&L"}
            </button>
          ))}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-[160px] flex flex-col items-center justify-center text-muted-foreground">
          <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
          <p className="text-sm">P&L chart appears after your first investment</p>
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-2xl font-bold ${latestVal >= 0 ? "text-foreground" : "text-red-500"}`}>
              ₦{Math.abs(latestVal).toLocaleString()}
            </span>
            <span className={`text-sm font-semibold flex items-center gap-0.5 ${isUp ? "text-emerald-600" : "text-red-500"}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isUp ? "+" : ""}{changePct}%
            </span>
            <span className="text-xs text-muted-foreground">vs last month</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="pnl-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `₦${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [`₦${parseFloat(v).toLocaleString()}`, view === "earnings" ? "Returns" : "Net P&L"]}
                contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Area type="monotone" dataKey={dataKey}
                stroke={isUp ? "#10b981" : "#ef4444"}
                fill="url(#pnl-grad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            <span>Total Earned: <span className="text-emerald-600 font-semibold">₦{totalEarned.toLocaleString()}</span></span>
            <span>Total Invested: <span className="text-foreground font-semibold">₦{totalInvested.toLocaleString()}</span></span>
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SWIPEABLE INVESTMENT CARD CAROUSEL
───────────────────────────────────────── */
function InvestmentCardCarousel({ dashData, user, balance, onFund, onInvest }: {
  dashData: any; user: any; balance: number;
  onFund: () => void; onInvest: () => void;
}) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const totalInvested = parseFloat(dashData?.investments?.total_invested || 0);
  const totalEarned   = parseFloat(dashData?.investments?.total_earned   || 0);
  const activeCount   = dashData?.investments?.active_count   || 0;
  const profitLoss    = totalEarned - totalInvested;
  const roi           = totalInvested > 0 ? ((totalEarned / totalInvested) * 100).toFixed(1) : "0.0";
  const allocation    = dashData?.allocation || [];
  const recent        = (dashData?.recentTransactions || []).slice(0, 4);
  const activeInvs    = (dashData?.activeInvestments || []).slice(0, 3);

  const cards = [
    {
      id: "portfolio",
      label: "Portfolio Value",
      gradient: "from-zinc-900 via-zinc-800 to-zinc-900",
      accent: "bg-primary",
      content: (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">SmartInvest</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Total Balance</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">₦{balance.toLocaleString()}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold">
                +{roi}% ROI
              </span>
              <span className="text-white/30 text-xs">{activeCount} active</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={onFund}
              className="flex-1 h-9 rounded-xl bg-primary flex items-center justify-center gap-1.5 text-white text-xs font-semibold active:opacity-80 transition-opacity">
              <Plus className="w-3.5 h-3.5" /> Fund
            </button>
            <button onClick={onInvest}
              className="flex-1 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center gap-1.5 text-white text-xs font-semibold active:opacity-80 transition-opacity">
              <TrendingUp className="w-3.5 h-3.5" /> Invest
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "pnl",
      label: "Profit & Loss",
      gradient: profitLoss >= 0 ? "from-emerald-950 via-emerald-900 to-emerald-950" : "from-red-950 via-red-900 to-red-950",
      content: (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">P&L Summary</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              {profitLoss >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
          </div>
          <div>
            <p className="text-white/40 text-xs mb-1">Net Return</p>
            <h2 className={`text-3xl sm:text-4xl font-bold ${profitLoss >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              {profitLoss >= 0 ? "+" : ""}₦{Math.abs(profitLoss).toLocaleString()}
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-[10px] mb-0.5">Invested</p>
              <p className="text-white text-sm font-semibold">₦{totalInvested.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-white/40 text-[10px] mb-0.5">Earned</p>
              <p className="text-emerald-300 text-sm font-semibold">₦{totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "performance",
      label: "Performance",
      gradient: "from-blue-950 via-blue-900 to-blue-950",
      content: (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Earnings Trend</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-blue-300" />
            </div>
          </div>
          <div className="flex-1 min-h-0 my-3">
            {dashData?.chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashData.chartData}>
                  <defs>
                    <linearGradient id="card-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="earnings" stroke="#60a5fa" fill="url(#card-grad)" strokeWidth={2} dot={false} />
                  <Tooltip formatter={(v: any) => `₦${parseFloat(v).toLocaleString()}`}
                    contentStyle={{ background: "#1e3a5f", border: "none", borderRadius: 8, fontSize: 11, color: "#fff" }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-white/30 text-xs">Chart appears after investing</p>
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-white/40">6-Month Earnings</span>
            <span className="text-blue-300 font-semibold">₦{totalEarned.toLocaleString()}</span>
          </div>
        </div>
      ),
    },
    {
      id: "allocation",
      label: "Asset Allocation",
      gradient: "from-violet-950 via-purple-900 to-violet-950",
      content: (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Allocation</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Layers className="w-4 h-4 text-violet-300" />
            </div>
          </div>
          {allocation.length > 0 ? (
            <div className="flex items-center gap-4 flex-1 my-2">
              <div className="w-20 h-20 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={20} outerRadius={36} dataKey="value" paddingAngle={3}>
                      {allocation.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {allocation.slice(0, 4).map((a: any, i: number) => (
                  <div key={a.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-white/60 text-[10px] truncate max-w-[70px]">{a.name}</span>
                    </div>
                    <span className="text-white text-[10px] font-semibold">₦{parseFloat(a.value).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/30 text-xs text-center">Invest to see allocation</p>
            </div>
          )}
          <div className="flex justify-between text-xs">
            <span className="text-white/40">{activeCount} positions</span>
            <span className="text-violet-300 font-semibold">{allocation.length} assets</span>
          </div>
        </div>
      ),
    },
    {
      id: "activity",
      label: "Recent Activity",
      gradient: "from-amber-950 via-orange-900 to-amber-950",
      content: (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Activity</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <div className="flex-1 space-y-1.5 my-2 overflow-hidden">
            {recent.length > 0 ? recent.map((tx: any, i: number) => {
              const isCredit = ["deposit","daily_return","trade_gain","referral_commission"].includes(tx.type);
              return (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-500/20" : "bg-red-500/20"}`}>
                    {isCredit ? <ArrowUpRight className="w-3 h-3 text-emerald-400" /> : <ArrowDownLeft className="w-3 h-3 text-red-400" />}
                  </div>
                  <p className="flex-1 text-white text-[10px] font-medium capitalize truncate">{tx.type?.replace(/_/g," ")}</p>
                  <span className={`text-[10px] font-bold ${isCredit ? "text-emerald-400" : "text-red-400"}`}>
                    {isCredit ? "+" : "-"}₦{parseFloat(tx.amount).toLocaleString()}
                  </span>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center h-full pt-6">
                <p className="text-white/30 text-xs">No recent transactions</p>
              </div>
            )}
          </div>
          <p className="text-[10px] text-white/30 text-right">Last {recent.length} transactions</p>
        </div>
      ),
    },
    {
      id: "investments",
      label: "Active Investments",
      gradient: "from-teal-950 via-cyan-900 to-teal-950",
      content: (
        <div className="flex flex-col h-full justify-between">
          <div className="flex items-center justify-between">
            <span className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Investments</span>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Target className="w-4 h-4 text-cyan-300" />
            </div>
          </div>
          <div className="flex-1 space-y-2 my-2 overflow-hidden">
            {activeInvs.length > 0 ? activeInvs.map((inv: any, i: number) => {
              const pct = Math.min(100, (inv.days_completed / inv.duration_days) * 100);
              return (
                <div key={i} className="p-2 rounded-lg bg-white/5">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-white text-[10px] font-semibold truncate max-w-[110px]">{inv.package_name}</span>
                    <span className="text-cyan-300 text-[10px] font-bold shrink-0 ml-1">+{inv.daily_return_pct}%</span>
                  </div>
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/40 text-[9px]">Day {inv.days_completed}/{inv.duration_days}</span>
                    <span className="text-emerald-400 text-[9px]">+₦{parseFloat(inv.total_earned).toLocaleString()}</span>
                  </div>
                </div>
              );
            }) : (
              <div className="flex-1 flex items-center justify-center h-full pt-6">
                <div className="text-center">
                  <Package className="w-7 h-7 text-white/20 mx-auto mb-1" />
                  <p className="text-white/30 text-xs">No active investments</p>
                </div>
              </div>
            )}
          </div>
          <p className="text-[10px] text-white/30">{activeCount} total positions</p>
        </div>
      ),
    },
  ];

  const total = cards.length;

  const goTo = (idx: number, dir: number) => {
    setDirection(dir);
    setCurrent(((idx % total) + total) % total);
  };

  const handleDragEnd = (_: never, info: PanInfo) => {
    const swipe = Math.abs(info.offset.x) > 50 || Math.abs(info.velocity.x) > 300;
    if (swipe) {
      if (info.offset.x < 0) goTo(current + 1, 1);
      else goTo(current - 1, -1);
    }
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div className="select-none" ref={containerRef}>
      {/* Card viewport */}
      <div className="relative h-[210px] overflow-hidden rounded-2xl">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "tween", ease: [0.25, 0.46, 0.45, 0.94], duration: 0.3 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.08}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${cards[current].gradient} p-5 sm:p-6 border border-white/8 shadow-xl cursor-grab active:cursor-grabbing`}
          >
            {cards[current].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots + arrows */}
      <div className="flex items-center justify-between mt-4 px-0.5">
        <button
          onClick={() => goTo(current - 1, -1)}
          className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/60 active:scale-95 transition-all">
          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-1.5">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > current ? 1 : -1)}
                className={`h-1.5 rounded-full transition-all duration-200 ${i === current ? "w-5 bg-foreground" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground">{cards[current].label} · {current + 1}/{total}</p>
        </div>

        <button
          onClick={() => goTo(current + 1, 1)}
          className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/60 active:scale-95 transition-all">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PORTFOLIO TAB
───────────────────────────────────────── */
function PortfolioTab({ dashData, balance }: { dashData: any; balance: number }) {
  const totalInvested = parseFloat(dashData?.investments?.total_invested || 0);
  const totalEarned   = parseFloat(dashData?.investments?.total_earned   || 0);
  const activeCount   = dashData?.investments?.active_count || 0;
  const allocation    = dashData?.allocation || [];
  const roi = totalInvested > 0 ? ((totalEarned / totalInvested) * 100).toFixed(1) : "0.0";

  return (
    <motion.div key="portfolio-tab"
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }} className="p-5 space-y-5">

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Portfolio Value", value: `₦${balance.toLocaleString()}`,       icon: Wallet,     accent: "from-primary/10 to-primary/5",      iconBg: "bg-primary/15",   iconColor: "text-primary" },
          { label: "Total Invested",  value: `₦${totalInvested.toLocaleString()}`,  icon: TrendingUp,  accent: "from-blue-50 to-blue-50/30",        iconBg: "bg-blue-100",     iconColor: "text-blue-600" },
          { label: "Total Earned",    value: `₦${totalEarned.toLocaleString()}`,    icon: DollarSign,  accent: "from-emerald-50 to-emerald-50/30",  iconBg: "bg-emerald-100",  iconColor: "text-emerald-600" },
          { label: "ROI",             value: `+${roi}%`,                            icon: BarChart3,   accent: "from-violet-50 to-violet-50/30",    iconBg: "bg-violet-100",   iconColor: "text-violet-600" },
        ].map(({ label, value, icon: Icon, accent, iconBg, iconColor }) => (
          <motion.div key={label}
            whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`bg-gradient-to-br ${accent} border border-border rounded-2xl p-4 relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-40 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at top right, currentColor 0%, transparent 70%)" }} />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-muted-foreground font-semibold tracking-wide uppercase">{label}</span>
                <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
              </div>
              <div className="font-bold text-foreground text-[17px] leading-tight tracking-tight">{value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {allocation.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Asset Allocation</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={allocation} cx="50%" cy="50%" innerRadius={32} outerRadius={56} dataKey="value" paddingAngle={3}>
                    {allocation.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {allocation.map((a: any, i: number) => (
                <div key={a.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-muted-foreground truncate max-w-[100px]">{a.name}</span>
                  </div>
                  <span className="text-sm font-semibold">₦{parseFloat(a.value).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Earnings History</h3>
        {dashData?.chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={dashData.chartData}>
              <defs>
                <linearGradient id="port-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => [`₦${parseFloat(v).toLocaleString()}`, "Earnings"]}
                contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 11 }} />
              <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))"
                fill="url(#port-grad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
            No earnings history yet
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Active Investments ({activeCount})</h3>
        {dashData?.activeInvestments?.length > 0 ? (
          <div className="space-y-3">
            {dashData.activeInvestments.map((inv: any) => {
              const pct = Math.min(100, (inv.days_completed / inv.duration_days) * 100);
              return (
                <div key={inv.id} className="p-4 rounded-xl bg-muted/30 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold">{inv.package_name}</p>
                      <Badge className="text-[9px] h-4 mt-0.5">{inv.tier}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-emerald-600">+{inv.daily_return_pct}%/day</div>
                      <div className="text-[10px] text-muted-foreground">Day {inv.days_completed}/{inv.duration_days}</div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                    <span>Principal: <strong>₦{parseFloat(inv.amount).toLocaleString()}</strong></span>
                    <span className="text-emerald-600 font-semibold">+₦{parseFloat(inv.total_earned).toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{pct.toFixed(0)}% complete</p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">No active investments</div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   ASSETS TAB
───────────────────────────────────────── */
const CRYPTO_LIST = [
  { id: "bitcoin",           symbol: "BTC",  name: "Bitcoin",      bg: "bg-orange-50 border-orange-100",   text: "text-orange-600",  fallback: { usd: 65000,  usd_24h_change: 2.4  } },
  { id: "ethereum",          symbol: "ETH",  name: "Ethereum",     bg: "bg-violet-50 border-violet-100",   text: "text-violet-600",  fallback: { usd: 3200,   usd_24h_change: 1.8  } },
  { id: "binancecoin",       symbol: "BNB",  name: "BNB",          bg: "bg-yellow-50 border-yellow-100",   text: "text-yellow-600",  fallback: { usd: 580,    usd_24h_change: -0.5 } },
  { id: "solana",            symbol: "SOL",  name: "Solana",       bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600", fallback: { usd: 155,    usd_24h_change: 3.2  } },
  { id: "tether",            symbol: "USDT", name: "Tether",       bg: "bg-blue-50 border-blue-100",       text: "text-blue-600",    fallback: { usd: 1.0,    usd_24h_change: 0.01 } },
  { id: "ripple",            symbol: "XRP",  name: "XRP",          bg: "bg-sky-50 border-sky-100",          text: "text-sky-600",     fallback: { usd: 0.60,   usd_24h_change: 1.1  } },
  { id: "dogecoin",          symbol: "DOGE", name: "Dogecoin",     bg: "bg-amber-50 border-amber-100",     text: "text-amber-600",   fallback: { usd: 0.14,   usd_24h_change: 2.5  } },
  { id: "cardano",           symbol: "ADA",  name: "Cardano",      bg: "bg-blue-50 border-blue-200",       text: "text-blue-700",    fallback: { usd: 0.45,   usd_24h_change: -0.8 } },
  { id: "avalanche-2",       symbol: "AVAX", name: "Avalanche",    bg: "bg-red-50 border-red-100",         text: "text-red-600",     fallback: { usd: 36.00,  usd_24h_change: 1.5  } },
  { id: "matic-network",     symbol: "MATIC",name: "Polygon",      bg: "bg-purple-50 border-purple-100",   text: "text-purple-600",  fallback: { usd: 0.58,   usd_24h_change: 0.9  } },
  { id: "chainlink",         symbol: "LINK", name: "Chainlink",    bg: "bg-blue-50 border-blue-300",       text: "text-blue-800",    fallback: { usd: 14.20,  usd_24h_change: 1.3  } },
  { id: "polkadot",          symbol: "DOT",  name: "Polkadot",     bg: "bg-pink-50 border-pink-100",       text: "text-pink-600",    fallback: { usd: 6.80,   usd_24h_change: -0.7 } },
  { id: "litecoin",          symbol: "LTC",  name: "Litecoin",     bg: "bg-slate-50 border-slate-200",     text: "text-slate-600",   fallback: { usd: 82.00,  usd_24h_change: 0.4  } },
  { id: "uniswap",           symbol: "UNI",  name: "Uniswap",      bg: "bg-pink-50 border-pink-200",       text: "text-pink-700",    fallback: { usd: 7.40,   usd_24h_change: 2.1  } },
  { id: "shiba-inu",         symbol: "SHIB", name: "Shiba Inu",    bg: "bg-orange-50 border-orange-200",   text: "text-orange-700",  fallback: { usd: 0.000018, usd_24h_change: 3.5 } },
];

const STOCK_LIST = [
  { symbol: "TSLA",  name: "Tesla Inc.",      category: "EV / Tech",    bg: "bg-red-50 border-red-100",      text: "text-red-600"    },
  { symbol: "AAPL",  name: "Apple Inc.",      category: "Technology",   bg: "bg-gray-50 border-gray-200",    text: "text-gray-700"   },
  { symbol: "MSFT",  name: "Microsoft",       category: "Technology",   bg: "bg-blue-50 border-blue-100",    text: "text-blue-600"   },
  { symbol: "GOOGL", name: "Alphabet Inc.",   category: "Technology",   bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600" },
  { symbol: "NVDA",  name: "NVIDIA Corp.",    category: "Semiconductors",bg: "bg-green-50 border-green-100", text: "text-green-600"  },
  { symbol: "AMZN",  name: "Amazon.com",      category: "E-Commerce",   bg: "bg-orange-50 border-orange-100",text: "text-orange-600" },
];

const COMMODITY_LIST = [
  { symbol: "GC=F", name: "Gold",       category: "Precious Metal", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" },
  { symbol: "SI=F", name: "Silver",     category: "Precious Metal", bg: "bg-slate-50 border-slate-200",   text: "text-slate-600"  },
  { symbol: "CL=F", name: "Crude Oil",  category: "Energy",         bg: "bg-zinc-50 border-zinc-200",     text: "text-zinc-700"   },
];

function AssetsTab({ dashData }: { dashData: any }) {
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, { usd: number; usd_24h_change: number }>>({});
  const [marketData, setMarketData] = useState<Record<string, { price: number; change: number; name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"crypto" | "stocks" | "commodities">("crypto");
  const allocation = dashData?.allocation || [];

  useEffect(() => {
    const ids = CRYPTO_LIST.map(c => c.id).join(",");
    const fallback: Record<string, { usd: number; usd_24h_change: number }> = {};
    CRYPTO_LIST.forEach(c => { fallback[c.symbol] = c.fallback; });

    Promise.all([
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`)
        .then(r => r.json())
        .then(data => {
          const map: Record<string, { usd: number; usd_24h_change: number }> = {};
          CRYPTO_LIST.forEach(c => { if (data[c.id]) map[c.symbol] = data[c.id]; else map[c.symbol] = c.fallback; });
          setCryptoPrices(map);
        })
        .catch(() => setCryptoPrices(fallback)),
      fetch("/api/market")
        .then(r => r.json())
        .then(setMarketData)
        .catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const renderRow = (symbol: string, name: string, bg: string, text: string, price: number | undefined, change: number | undefined, currency?: string) => {
    const isUp = (change ?? 0) >= 0;
    return (
      <motion.div key={symbol} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
          <span className={`text-[10px] font-bold ${text}`}>{symbol.replace("=F","").slice(0,4)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{symbol}</p>
        </div>
        {price !== undefined ? (
          <div className="text-right">
            <p className="text-sm font-bold">{currency ?? "$"}{price.toLocaleString()}</p>
            <p className={`text-xs font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
              {isUp ? "+" : ""}{(change ?? 0).toFixed(2)}%
            </p>
          </div>
        ) : (
          <div className="w-16 h-8 bg-muted rounded animate-pulse" />
        )}
      </motion.div>
    );
  };

  return (
    <motion.div key="assets-tab"
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }} className="p-5 space-y-5">

      <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white">
        <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-2">Global Markets</p>
        <h2 className="text-3xl font-bold font-display">{CRYPTO_LIST.length + STOCK_LIST.length + COMMODITY_LIST.length} Assets</h2>
        <p className="text-white/50 text-sm mt-1">Crypto · Stocks · Commodities tracked</p>
        <div className="flex gap-2.5 mt-4 text-[10px] font-semibold flex-wrap">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
            <Coins className="w-3 h-3" /> {CRYPTO_LIST.length} Crypto
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
            <LineChart className="w-3 h-3" /> {STOCK_LIST.length} Stocks
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10">
            <Flame className="w-3 h-3" /> {COMMODITY_LIST.length} Commodities
          </span>
        </div>
      </div>

      {allocation.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Your Portfolio Allocation</h3>
          <div className="space-y-3">
            {allocation.map((a: any, i: number) => {
              const total = allocation.reduce((s: number, x: any) => s + parseFloat(x.value), 0);
              const pct = total > 0 ? ((parseFloat(a.value) / total) * 100).toFixed(1) : "0";
              return (
                <div key={a.name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="font-medium">{a.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold">₦{parseFloat(a.value).toLocaleString()}</span>
                      <span className="text-muted-foreground text-xs ml-2">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, delay: i * 0.05, ease: "easeOut" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Live Market Prices</h3>
            {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
          </div>
          <div className="flex gap-2">
            {(["crypto", "stocks", "commodities"] as const).map(s => (
              <button key={s} onClick={() => setActiveSection(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all
                  ${activeSection === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-border">
          {activeSection === "crypto" && CRYPTO_LIST.map(({ symbol, name, bg, text }) => {
            const p = cryptoPrices[symbol];
            return renderRow(symbol, name, bg, text, p?.usd, p?.usd_24h_change);
          })}
          {activeSection === "stocks" && STOCK_LIST.map(({ symbol, name, bg, text }) => {
            const d = marketData[symbol];
            return renderRow(symbol, name, bg, text, d?.price, d?.change);
          })}
          {activeSection === "commodities" && COMMODITY_LIST.map(({ symbol, name, bg, text }) => {
            const d = marketData[symbol];
            return renderRow(symbol, name, bg, text, d?.price, d?.change);
          })}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
───────────────────────────────────────── */
export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dashData, setDashData] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pkgLoading, setPkgLoading] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: "", accountName: "", accountNumber: "", bankCode: "", bankName: ""
  });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<any>(null);
  const [tierFilter, setTierFilter] = useState("All");
  const [authChecked, setAuthChecked] = useState(false);

  const [notifications, setNotifications] = useState<any[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [resolving, setResolving] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileForm, setProfileForm] = useState({
    date_of_birth: "", gender: "", address: "", phone: "", bio: "", nin: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profilePicLoading, setProfilePicLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = () => {
    const tok = localStorage.getItem('si_token');
    return { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) };
  };

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showNotif("error", "Image must be under 2 MB"); return; }
    setProfilePicLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({ profile_picture: base64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        await refreshUser();
        showNotif("success", "Profile picture updated!");
        setProfilePicLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showNotif("error", err.message || "Failed to update profile picture.");
      setProfilePicLoading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    const tok = localStorage.getItem('si_token');
    if (!tok && !user) router.replace('/login');
    else setAuthChecked(true);
  }, [user, router]);

  const showNotif = (type: "success" | "error", msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard', { headers: authHeaders() });
      if (res.status === 401) { router.replace('/login'); return; }
      const data = await res.json();
      if (!res.ok) { showNotif("error", data.error || "Failed to load."); return; }
      setDashData(data);
    } catch { showNotif("error", "Failed to load dashboard."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { if (authChecked) loadDashboard(); }, [authChecked, loadDashboard]);

  useEffect(() => {
    if (authChecked) {
      fetch('/api/notifications', { headers: authHeaders() })
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setNotifications(data); })
        .catch(() => {});
    }
  }, [authChecked]);

  useEffect(() => {
    if (!authChecked) return;
    const dashInterval = setInterval(() => {
      fetch('/api/dashboard', { headers: authHeaders() })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) { setDashData(data); } })
        .catch(() => {});
    }, 30000);
    const notifInterval = setInterval(() => {
      fetch('/api/notifications', { headers: authHeaders() })
        .then(r => r.json()).then(data => { if (Array.isArray(data)) setNotifications(data); })
        .catch(() => {});
    }, 10000);
    return () => { clearInterval(dashInterval); clearInterval(notifInterval); };
  }, [authChecked]);

  useEffect(() => {
    if (authChecked && user && user.profile_completed === false) {
      setShowProfileSetup(true);
    }
  }, [authChecked, user]);

  useEffect(() => {
    if (activeTab === "withdraw" && banks.length === 0) {
      fetch('/api/banks').then(r => r.json())
        .then(d => { if (d.banks) setBanks(d.banks); })
        .catch(() => {});
    }
  }, [activeTab, banks.length]);

  useEffect(() => {
    const { accountNumber, bankCode } = withdrawForm;
    if (accountNumber.length === 10 && bankCode) {
      setResolving(true);
      fetch(`/api/banks/resolve?account_number=${accountNumber}&bank_code=${bankCode}`)
        .then(r => r.json())
        .then(d => {
          if (d.account_name) setWithdrawForm(f => ({ ...f, accountName: d.account_name }));
        })
        .catch(() => {})
        .finally(() => setResolving(false));
    }
  }, [withdrawForm.accountNumber, withdrawForm.bankCode]);

  useEffect(() => {
    if (activeTab === "invest" && packages.length === 0) {
      fetch('/api/packages', { headers: authHeaders() })
        .then(r => r.json()).then(setPackages).catch(() => {});
    }
  }, [activeTab, packages.length]);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const funded = params.get("funded");
    const ref = params.get("ref");
    if (funded && ref) {
      fetch(`/api/wallet/verify/${ref}`, { headers: authHeaders() })
        .then(async r => {
          const data = await r.json();
          if (!r.ok) throw new Error(data.error || "Payment verification failed.");
          showNotif("success", "Wallet funded successfully!");
          loadDashboard(); refreshUser();
          window.history.replaceState({}, '', '/dashboard');
        })
        .catch((e) => showNotif("error", e.message || "Payment verification failed. Please contact support."));
    }
  }, []);

  const handleLogout = () => { logout(); router.push("/"); };

  const handleInvest = async (pkg: any) => {
    setPkgLoading(true);
    try {
      const res = await fetch('/api/packages/invest', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ packageId: pkg.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotif("success", `Invested in ${pkg.name}!`);
      setSelectedPkg(null);
      await loadDashboard(); await refreshUser();
      setActiveTab("overview");
    } catch (err: any) {
      showNotif("error", err.message || "Investment failed.");
    } finally { setPkgLoading(false); }
  };

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) < 100) {
      showNotif("error", "Minimum deposit is ₦100"); return;
    }
    setFundLoading(true);
    try {
      const res = await fetch('/api/wallet/fund', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ amount: parseFloat(fundAmount) })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (result.authorizationUrl) {
        if (typeof PaystackPop !== "undefined") {
          const handler = PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
            email: user?.email,
            amount: parseFloat(fundAmount) * 100,
            ref: result.reference,
            onClose: () => {
              setFundLoading(false);
              showNotif("error", "Payment was cancelled.");
            },
            callback: async (response: any) => {
              try {
                const verifyRes = await fetch(`/api/wallet/verify/${response.reference}`, { headers: authHeaders() });
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok) throw new Error(verifyData.error || "Payment verification failed.");
                showNotif("success", "Wallet funded successfully!");
                await loadDashboard(); await refreshUser(); setFundAmount("");
              } catch (e: any) {
                showNotif("error", e.message || "Verification failed. Please contact support.");
              }
              setFundLoading(false);
            },
          });
          handler.openIframe();
        } else {
          window.location.href = result.authorizationUrl;
        }
      }
    } catch (err: any) {
      showNotif("error", err.message || "Payment failed.");
      setFundLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setShowProfileSetup(false);
      refreshUser();
    } catch (err: any) {
      showNotif("error", err.message || "Could not save profile.");
    } finally { setProfileSaving(false); }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...withdrawForm, amount: parseFloat(withdrawForm.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotif("success", "Withdrawal request submitted! You'll be notified once processed.");
      setWithdrawForm({ amount: "", accountName: "", accountNumber: "", bankCode: "", bankName: "" });
      await loadDashboard(); await refreshUser();
      fetch('/api/notifications', { headers: authHeaders() })
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d); }).catch(() => {});
    } catch (err: any) {
      showNotif("error", err.message || "Withdrawal failed.");
    } finally { setWithdrawLoading(false); }
  };

  const copyReferral = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    }
  };

  const balance = parseFloat(String(dashData?.balance ?? user?.balance ?? 0));
  const tiers = ["All", ...Array.from(new Set(packages.map((p: any) => p.tier)))];
  const filteredPkgs = tierFilter === "All" ? packages : packages.filter((p: any) => p.tier === tierFilter);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: "overview",       icon: BarChart3,     label: "Home" },
    { id: "portfolio",      icon: PieChartIcon,  label: "Portfolio" },
    { id: "assets",         icon: Gem,           label: "Assets" },
    { id: "invest",         icon: Package,       label: "Invest" },
    { id: "transactions",   icon: Activity,      label: "Transactions" },
    { id: "referrals",      icon: Zap,           label: "Referrals" },
    { id: "fund",           icon: Wallet,        label: "Fund Wallet" },
    { id: "withdraw",       icon: CreditCard,    label: "Withdraw" },
    { id: "notifications",  icon: BellRing,      label: "Notifications", badge: unreadCount },
    { id: "profile",        icon: UserCircle,    label: "Profile" },
    { id: "security",       icon: Lock,          label: "Security" },
  ] as const;

  const currentNav = navItems.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

      {/* Hidden file input for profile picture */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleProfilePicUpload}
      />

      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium border
              ${notification.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-red-50 border-red-200 text-red-800"}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
              ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}>
              {notification.type === "success"
                ? <Check className="w-3 h-3 text-white" />
                : <AlertCircle className="w-3 h-3 text-white" />}
            </div>
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-40 flex flex-col h-full bg-foreground w-64 shrink-0 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display text-lg text-white">
              Smart<span className="text-primary">Invest</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label, ...rest }) => {
            const badge = (rest as any).badge;
            return (
              <button key={id} onClick={() => { setActiveTab(id as Tab); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative
                  ${activeTab === id
                    ? "bg-primary text-white shadow-sm"
                    : "text-white/55 hover:text-white hover:bg-white/8"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <AvatarIcon picture={user?.profile_picture} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-white truncate">{user?.username}</div>
              <div className="text-xs text-white/40 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-tight">
                {activeTab === "overview" ? `${greeting}, ${user?.username || 'investor'}` : currentNav?.label}
              </h1>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {activeTab === "overview" ? "Here's your investment summary" : "SmartInvest Platform"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700">
                ₦{parseFloat(String(user?.balance || 0)).toLocaleString()}
              </span>
            </div>
            <button onClick={() => setActiveTab("fund")}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:brightness-110 transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Funds
            </button>
            <button onClick={async () => { setLoading(true); await loadDashboard(); await refreshUser(); fetch('/api/notifications', { headers: authHeaders() }).then(r => r.json()).then(d => { if (Array.isArray(d)) setNotifications(d); }).catch(() => {}); }}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setBellOpen(v => !v);
                  if (!bellOpen && unreadCount > 0) {
                    fetch('/api/notifications', { method: 'PATCH', headers: authHeaders() }).catch(() => {});
                    setNotifications(n => n.map(x => ({ ...x, read: true })));
                  }
                }}
                className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: 'hsl(var(--card))' }}>
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                      <span className="font-semibold text-sm">Notifications</span>
                      <button onClick={() => setBellOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {notifications.slice(0, 8).length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-foreground">No notifications yet</div>
                      ) : notifications.slice(0, 8).map((n: any) => (
                        <div key={n._id} className={`px-4 py-3 ${n.read ? '' : 'bg-primary/5'}`}>
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              n.type === 'login' ? 'bg-blue-100' :
                              n.type === 'deposit' ? 'bg-emerald-100' :
                              n.type === 'withdrawal' ? 'bg-amber-100' :
                              n.type === 'investment' ? 'bg-violet-100' : 'bg-muted'
                            }`}>
                              {n.type === 'login' && <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />}
                              {n.type === 'deposit' && <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />}
                              {n.type === 'withdrawal' && <CreditCard className="w-3.5 h-3.5 text-amber-600" />}
                              {n.type === 'investment' && <TrendingUp className="w-3.5 h-3.5 text-violet-600" />}
                              {!['login','deposit','withdrawal','investment'].includes(n.type) && <Bell className="w-3.5 h-3.5 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[12px] font-semibold text-foreground">{n.title}</div>
                              <div className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{n.message}</div>
                              <div className="text-[10px] text-muted-foreground/60 mt-1">
                                {new Date(n.created_at).toLocaleString('en-NG', { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2.5 border-t border-border">
                      <button onClick={() => { setBellOpen(false); setActiveTab("notifications"); }}
                        className="text-xs text-primary font-semibold hover:underline">
                        View all notifications →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-2 pl-1 border-l border-border ml-1">
              <button onClick={() => fileInputRef.current?.click()} className="relative group" title="Change profile picture">
                <AvatarIcon picture={user?.profile_picture} />
                {profilePicLoading
                  ? <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
                  : <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Camera className="w-3 h-3 text-white" /></div>
                }
              </button>
              <span className="hidden sm:block text-xs font-semibold text-foreground truncate max-w-[80px]">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading your portfolio…</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">

              {/* ═══ OVERVIEW / WELCOME ═══ */}
              {activeTab === "overview" && (
                <motion.div key="overview"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-6">

                  <InvestmentCardCarousel
                    dashData={dashData} user={user} balance={balance}
                    onFund={() => setActiveTab("fund")} onInvest={() => setActiveTab("invest")} />

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Balance",   value: `₦${balance.toLocaleString()}`,                                                 icon: Wallet,     sub: "available",    accent: "from-primary/10 to-primary/5",     iconBg: "bg-primary/15",     iconColor: "text-primary" },
                      { label: "Invested",  value: `₦${parseFloat(dashData?.investments?.total_invested || 0).toLocaleString()}`,  icon: TrendingUp,  sub: `${dashData?.investments?.active_count || 0} active`,  accent: "from-blue-50 to-blue-50/30",       iconBg: "bg-blue-100",       iconColor: "text-blue-600" },
                      { label: "Earned",    value: `₦${parseFloat(dashData?.investments?.total_earned || 0).toLocaleString()}`,    icon: DollarSign,  sub: "total returns", accent: "from-emerald-50 to-emerald-50/30", iconBg: "bg-emerald-100",    iconColor: "text-emerald-600" },
                      { label: "Referrals", value: String(dashData?.referrals?.referred_users || 0),                               icon: Zap,         sub: `₦${parseFloat(dashData?.referrals?.earnings || 0).toLocaleString()} earned`, accent: "from-amber-50 to-amber-50/30", iconBg: "bg-amber-100", iconColor: "text-amber-600" },
                    ].map(({ label, value, icon: Icon, sub, accent, iconBg, iconColor }) => (
                      <motion.div key={label}
                        whileHover={{ y: -2, boxShadow: "0 8px 24px -4px rgba(0,0,0,0.08)" }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`bg-gradient-to-br ${accent} border border-border rounded-2xl p-4 relative overflow-hidden`}>
                        <div className="absolute inset-0 opacity-40 pointer-events-none"
                          style={{ background: "radial-gradient(ellipse at top right, currentColor 0%, transparent 70%)" }} />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] text-muted-foreground font-semibold tracking-wide uppercase">{label}</span>
                            <div className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}>
                              <Icon className={`w-4 h-4 ${iconColor}`} />
                            </div>
                          </div>
                          <div className="font-bold text-foreground text-[17px] leading-tight tracking-tight">{value}</div>
                          <div className="text-[10px] text-muted-foreground mt-1.5 font-medium">{sub}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Chart + Referral */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm text-foreground">Earnings History</h3>
                        <Badge variant="secondary" className="text-[10px]">6 months</Badge>
                      </div>
                      {dashData?.chartData?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                          <AreaChart data={dashData.chartData}>
                            <defs>
                              <linearGradient id="earn-grad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip formatter={(v: any) => [`₦${parseFloat(v).toLocaleString()}`, "Earnings"]}
                              contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 11 }} />
                            <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))"
                              fill="url(#earn-grad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[180px] flex flex-col items-center justify-center text-muted-foreground">
                          <BarChart3 className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-sm">Chart appears after first investment</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
                      <h3 className="font-semibold text-sm text-foreground mb-4">Referral Program</h3>
                      <div className="flex-1 space-y-3">
                        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15">
                          <div className="text-[10px] text-muted-foreground mb-1.5 uppercase tracking-wider font-medium">Your Code</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary text-sm tracking-widest">{user?.referral_code}</span>
                            <button onClick={copyReferral}
                              className="ml-auto p-1.5 rounded-lg hover:bg-primary/10 transition-colors text-muted-foreground hover:text-primary">
                              {referralCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-xl bg-muted/50 text-center">
                            <div className="text-lg font-bold text-foreground">{dashData?.referrals?.referred_users || 0}</div>
                            <div className="text-[10px] text-muted-foreground">Referred</div>
                          </div>
                          <div className="p-3 rounded-xl bg-muted/50 text-center">
                            <div className="text-base font-bold text-emerald-600">₦{parseFloat(dashData?.referrals?.earnings || 0).toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground">Earned</div>
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground text-center">50% · 25% · 10% · 5% tiered commissions</p>
                      </div>
                      <Button size="sm" onClick={() => setActiveTab("fund")} className="w-full bg-primary text-white rounded-xl mt-3">
                        Fund Wallet
                      </Button>
                    </div>
                  </div>

                  {/* Profit & Loss chart */}
                  <PnLChart
                    chartData={dashData?.chartData || []}
                    totalEarned={parseFloat(dashData?.investments?.total_earned || 0)}
                    totalInvested={parseFloat(dashData?.investments?.total_invested || 0)}
                  />

                  {/* Active Investments */}
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-sm text-foreground">Active Investments</h3>
                      <button onClick={() => setActiveTab("invest")} className="text-xs text-primary hover:underline font-medium">
                        + Invest More
                      </button>
                    </div>
                    {dashData?.activeInvestments?.length > 0 ? (
                      <div className="space-y-3">
                        {dashData.activeInvestments.map((inv: any) => {
                          const pct = Math.min(100, (inv.days_completed / inv.duration_days) * 100);
                          return (
                            <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              className="p-4 rounded-xl bg-muted/30 border border-border">
                              <div className="flex items-center justify-between mb-2.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold">{inv.package_name}</p>
                                    <Badge className="text-[9px] h-4 mt-0.5">{inv.tier}</Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-emerald-600">+{inv.daily_return_pct}%/day</div>
                                  <div className="text-[10px] text-muted-foreground">Day {inv.days_completed}/{inv.duration_days}</div>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>Principal: <span className="text-foreground font-semibold">₦{parseFloat(inv.amount).toLocaleString()}</span></span>
                                <span>Earned: <span className="text-emerald-600 font-semibold">₦{parseFloat(inv.total_earned).toLocaleString()}</span></span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div className="h-full bg-primary rounded-full"
                                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ duration: 1.2, ease: "easeOut" }} />
                              </div>
                              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                                <span>{pct.toFixed(0)}% complete</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-muted-foreground">
                        <div className="w-14 h-14 rounded-2xl bg-muted mx-auto mb-3 flex items-center justify-center">
                          <Package className="w-7 h-7 opacity-30" />
                        </div>
                        <p className="text-sm font-medium">No active investments</p>
                        <p className="text-xs mt-1">
                          <button onClick={() => setActiveTab("invest")} className="text-primary hover:underline">Browse packages</button>
                          {" "}to start earning
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Recent Transactions */}
                  {dashData?.recentTransactions?.length > 0 && (
                    <div className="bg-card border border-border rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-sm text-foreground">Recent Transactions</h3>
                        <button onClick={() => setActiveTab("transactions")} className="text-xs text-primary hover:underline">View all</button>
                      </div>
                      <div className="space-y-1 max-h-72 overflow-y-auto pr-1">
                        {dashData.recentTransactions.slice(0, 10).map((tx: any, i: number) => {
                          const isCredit = ["deposit","daily_return","trade_gain","referral_commission"].includes(tx.type);
                          const isFailed = tx.status === 'failed';
                          const isPending = tx.status === 'pending';
                          return (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5
                                ${isFailed ? 'bg-orange-50 border border-orange-100' : isCredit ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                {isFailed
                                  ? <AlertCircle className="w-4 h-4 text-orange-500" />
                                  : isCredit
                                    ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                    : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium text-foreground capitalize">
                                    {tx.type.replace(/_/g, ' ')}
                                  </p>
                                  {isFailed && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">FAILED</span>
                                  )}
                                  {isPending && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">PENDING</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </p>
                                {isFailed && tx.failure_reason && (
                                  <p className="text-[10px] text-orange-500 mt-0.5 truncate">{tx.failure_reason}</p>
                                )}
                              </div>
                              <span className={`text-sm font-bold shrink-0 ${isFailed ? 'text-muted-foreground line-through' : isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isCredit ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString()}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ PORTFOLIO ═══ */}
              {activeTab === "portfolio" && (
                <PortfolioTab dashData={dashData} balance={balance} />
              )}

              {/* ═══ ASSETS ═══ */}
              {activeTab === "assets" && (
                <AssetsTab dashData={dashData} />
              )}

              {/* ═══ INVEST ═══ */}
              {activeTab === "invest" && (
                <motion.div key="invest"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-4">

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Investment Notice</p>
                      <p className="text-xs text-amber-700 mt-0.5">
                        Amounts are deducted from your wallet. Daily returns are probabilistic and may include trading gains or losses.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Available to Invest</p>
                      <p className="text-2xl font-bold text-foreground">₦{balance.toLocaleString()}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab("fund")}
                      className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white transition-all">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Funds
                    </Button>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {tiers.map(t => (
                      <button key={t} onClick={() => setTierFilter(t)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border
                          ${tierFilter === t
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  {packages.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">Loading packages…</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredPkgs.map((pkg: any) => (
                        <motion.div key={pkg.id} whileHover={{ scale: 1.01 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="bg-card border border-border rounded-2xl p-5 cursor-pointer relative overflow-hidden"
                          onClick={() => setSelectedPkg(pkg)}>
                          <div className="absolute top-3 right-3">
                            <Badge variant="secondary" className="text-[10px]">{pkg.tier}</Badge>
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                            <Package className="w-5 h-5 text-primary" />
                          </div>
                          <h3 className="font-semibold text-sm mb-1">{pkg.name}</h3>
                          <p className="text-xs text-muted-foreground mb-3">{pkg.description}</p>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 rounded-lg bg-muted/50">
                              <div className="text-muted-foreground">Min. Amount</div>
                              <div className="font-bold text-foreground mt-0.5">₦{parseFloat(pkg.min_amount).toLocaleString()}</div>
                            </div>
                            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                              <div className="text-muted-foreground">Daily Return</div>
                              <div className="font-bold text-emerald-600 mt-0.5">+{pkg.daily_return_pct}%</div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Investment modal */}
                  <AnimatePresence>
                    {selectedPkg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={e => e.target === e.currentTarget && setSelectedPkg(null)}>
                        <motion.div initial={{ opacity: 0, y: 40, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 40, scale: 0.97 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}
                          className="bg-background border border-border rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                          <div className="flex items-center justify-between mb-5">
                            <div>
                              <h3 className="font-bold text-lg">{selectedPkg.name}</h3>
                              <Badge variant="secondary" className="text-[10px] mt-0.5">{selectedPkg.tier}</Badge>
                            </div>
                            <button onClick={() => setSelectedPkg(null)}
                              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                              ✕
                            </button>
                          </div>
                          <div className="space-y-3 mb-5">
                            {[
                              { label: "Minimum Amount", value: `₦${parseFloat(selectedPkg.min_amount).toLocaleString()}` },
                              { label: "Daily Return",   value: `+${selectedPkg.daily_return_pct}%`, cls: "text-emerald-600" },
                              { label: "Duration",       value: `${selectedPkg.duration_days} days` },
                              { label: "Your Balance",   value: `₦${balance.toLocaleString()}`, cls: balance >= parseFloat(selectedPkg.min_amount) ? "text-foreground" : "text-red-500" },
                            ].map(({ label, value, cls }) => (
                              <div key={label} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                                <span className="text-muted-foreground">{label}</span>
                                <span className={`font-semibold ${cls || ""}`}>{value}</span>
                              </div>
                            ))}
                          </div>
                          {balance < parseFloat(selectedPkg.min_amount) ? (
                            <div>
                              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 mb-3">
                                Insufficient balance. You need ₦{(parseFloat(selectedPkg.min_amount) - balance).toLocaleString()} more.
                              </div>
                              <Button onClick={() => { setSelectedPkg(null); setActiveTab("fund"); }}
                                className="w-full h-11 bg-primary text-white rounded-xl">
                                <Plus className="w-4 h-4 mr-1" /> Fund Wallet First
                              </Button>
                            </div>
                          ) : (
                            <Button onClick={() => handleInvest(selectedPkg)} disabled={pkgLoading}
                              className="w-full h-11 bg-primary text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                              {pkgLoading
                                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Investing…</span>
                                : `Invest ₦${parseFloat(selectedPkg.min_amount).toLocaleString()}`}
                            </Button>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ═══ TRANSACTIONS ═══ */}
              {activeTab === "transactions" && (
                <motion.div key="txs"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5">
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-border bg-muted/30">
                      <h3 className="font-semibold text-sm">Transaction History</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">All wallet and investment activity</p>
                    </div>
                    {dashData?.recentTransactions?.length > 0 ? (
                      <div className="divide-y divide-border">
                        {dashData.recentTransactions.map((tx: any, i: number) => {
                          const isCredit = ["deposit","daily_return","trade_gain","referral_commission"].includes(tx.type);
                          return (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.03 }}
                              className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
                                ${isCredit ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                {isCredit
                                  ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                  : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold capitalize">{tx.type.replace(/_/g, ' ')}</p>
                                {tx.description && <p className="text-xs text-muted-foreground truncate">{tx.description}</p>}
                                <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                              </div>
                              <span className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
                                {isCredit ? '+' : '-'}₦{parseFloat(tx.amount).toLocaleString()}
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-16 text-center text-muted-foreground">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="font-medium text-sm">No transactions yet</p>
                        <p className="text-xs mt-1">Fund your wallet to get started</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ═══ REFERRALS ═══ */}
              {activeTab === "referrals" && (
                <motion.div key="refs"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-4">

                  <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-3">Referral Program</p>
                    <h2 className="text-3xl font-bold font-display mb-1">Up to 50% Commission</h2>
                    <p className="text-white/60 text-sm">Tiered rewards for every referral who invests</p>
                    <div className="mt-5 p-3.5 rounded-2xl bg-white/8 border border-white/15">
                      <p className="text-white/50 text-[10px] uppercase tracking-wider mb-1.5">Your Referral Code</p>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-2xl text-white tracking-widest">{user?.referral_code}</span>
                        <button onClick={copyReferral}
                          className="ml-auto p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                          {referralCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "People Referred", value: String(dashData?.referrals?.referred_users || 0), icon: Zap, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                      { label: "Commission Earned", value: `₦${parseFloat(dashData?.referrals?.earnings || 0).toLocaleString()}`, icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className="bg-card border border-border rounded-2xl p-5 text-center">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mx-auto mb-2 ${bg}`}>
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                        <div className="text-xs text-muted-foreground mt-1">{label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-sm mb-4">How It Works</h3>
                    <div className="space-y-4">
                      {[
                        { step: "1", title: "Share your code", desc: "Send your referral code to friends and family" },
                        { step: "2", title: "They register", desc: "They create an account using your referral code" },
                        { step: "3", title: "They invest", desc: "1st referral → 50% · 2nd → 25% · 3rd → 10% · 4th+ → 5%" },
                        { step: "4", title: "Instant payout", desc: "Commission is credited to your wallet immediately" },
                      ].map(({ step, title, desc }) => (
                        <div key={step} className="flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                            {step}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ FUND WALLET ═══ */}
              {activeTab === "fund" && (
                <motion.div key="fund"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-5">

                  <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-2">Current Balance</p>
                    <h2 className="text-4xl font-bold font-display">₦{balance.toLocaleString()}</h2>
                    <p className="text-white/50 text-sm mt-1">Add funds to start or increase investments</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 space-y-5">
                    <div>
                      <h3 className="font-semibold text-base">Add Money to Wallet</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Secured payment via Paystack</p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-2.5">Quick Select</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["1000","5000","10000","25000","50000","100000"].map(amt => (
                          <button key={amt} onClick={() => setFundAmount(amt)}
                            className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                              ${fundAmount === amt
                                ? 'bg-primary text-white border-primary shadow-sm'
                                : 'border-border hover:border-primary/50 text-foreground'}`}>
                            ₦{parseInt(amt).toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium block mb-2">Custom Amount</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₦</span>
                        <input type="number" placeholder="Min ₦100" value={fundAmount}
                          onChange={e => setFundAmount(e.target.value)}
                          className="w-full h-12 pl-8 pr-4 rounded-xl border border-border bg-background text-foreground text-sm
                            focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {fundAmount && parseFloat(fundAmount) >= 100 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
                          Adding <strong>₦{parseFloat(fundAmount).toLocaleString()}</strong> →
                          New balance: <strong>₦{(balance + parseFloat(fundAmount)).toLocaleString()}</strong>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button onClick={handleFund} disabled={fundLoading || !fundAmount || parseFloat(fundAmount) < 100}
                      className="w-full h-12 bg-primary text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                      {fundLoading
                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</span>
                        : <span className="flex items-center gap-2"><Wallet className="w-4 h-4" />Fund Wallet</span>}
                    </Button>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      256-bit SSL encryption · Powered by Paystack
                    </div>

                    {/* EasyBuy Guide */}
                    <div className="rounded-2xl overflow-hidden border border-border">
                      <div className="bg-foreground px-5 py-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center shrink-0">
                              <Zap className="w-3 h-3 text-white" />
                            </div>
                            <span className="text-white font-bold text-sm tracking-tight">Fund with EasyBuy</span>
                          </div>
                          <p className="text-white/40 text-[11px]">Instant virtual account · Powered by Paystack</p>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                          <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Recommended</span>
                        </div>
                      </div>

                      <div className="bg-muted/30 p-4 space-y-3">
                        {[
                          { step: 1, icon: Wallet,       title: "Enter amount & tap Fund Wallet",         desc: "Choose a quick amount or type a custom value above, then hit the Fund Wallet button." },
                          { step: 2, icon: CreditCard,   title: "Select EasyBuy on Paystack checkout",   desc: "On the Paystack payment page, tap the EasyBuy channel option." },
                          { step: 3, icon: ArrowDownLeft,title: "Get your unique virtual account",        desc: "A dedicated account number is instantly generated just for this transaction." },
                          { step: 4, icon: ArrowUpRight, title: "Transfer from your bank app",            desc: "Open your banking app and send the exact amount to the virtual account shown." },
                          { step: 5, icon: Check,        title: "Wallet credited automatically",          desc: "Your SmartInvest wallet is funded within seconds — no manual action needed." },
                        ].map(({ step, icon: Icon, title, desc }, i, arr) => (
                          <div key={step} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center shrink-0 shadow-sm">
                                <Icon className="w-3.5 h-3.5 text-primary" />
                              </div>
                              {i < arr.length - 1 && (
                                <div className="w-px flex-1 mt-1.5 bg-border min-h-[16px]" />
                              )}
                            </div>
                            <div className="pb-3 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Step {step}</span>
                              </div>
                              <p className="text-xs font-semibold text-foreground leading-snug">{title}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="px-4 py-3 bg-amber-50 border-t border-amber-200 flex gap-2.5 items-start">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-800 leading-relaxed">
                          Always verify the account name on checkout shows <strong>SmartInvest / EasyBuy</strong> before transferring.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══ WITHDRAW ═══ */}
              {activeTab === "withdraw" && (
                <motion.div key="withdraw"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-5">

                  <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white">
                    <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-2">Available Balance</p>
                    <h2 className="text-4xl font-bold font-display">₦{balance.toLocaleString()}</h2>
                    <p className="text-white/50 text-sm mt-1">Withdraw to your Nigerian bank account</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <div>
                      <h3 className="font-semibold text-base">Withdraw Funds</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">Processed within 1–3 business days</p>
                    </div>

                    {/* Amount */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Amount (₦)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">₦</span>
                        <input type="number" placeholder="Enter amount"
                          value={withdrawForm.amount}
                          onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
                          className="w-full h-11 pl-8 pr-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                      </div>
                    </div>

                    {/* Bank dropdown */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Select Bank</label>
                      <div className="relative">
                        <select
                          value={withdrawForm.bankCode}
                          onChange={e => {
                            const bank = banks.find((b: any) => b.code === e.target.value);
                            setWithdrawForm(f => ({ ...f, bankCode: e.target.value, bankName: bank?.name || '', accountName: '' }));
                          }}
                          className="w-full h-11 pl-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all appearance-none">
                          <option value="">-- Select your bank --</option>
                          {banks.map((b: any) => (
                            <option key={b.code} value={b.code}>{b.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>

                    {/* Account Number */}
                    <div>
                      <label className="text-sm font-medium block mb-1.5">Account Number</label>
                      <input type="text" maxLength={10} placeholder="10-digit NUBAN number"
                        value={withdrawForm.accountNumber}
                        onChange={e => {
                          setWithdrawForm(f => ({ ...f, accountNumber: e.target.value, accountName: '' }));
                        }}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                    </div>

                    {/* Auto-resolved account name */}
                    <AnimatePresence>
                      {(resolving || withdrawForm.accountName) && (
                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          {resolving ? (
                            <>
                              <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin shrink-0" />
                              <span className="text-sm text-emerald-700">Resolving account…</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span className="text-sm font-semibold text-emerald-800">{withdrawForm.accountName}</span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {withdrawForm.amount && parseFloat(withdrawForm.amount) > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`p-3 rounded-xl text-xs border ${
                            parseFloat(withdrawForm.amount) > balance
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}>
                          {parseFloat(withdrawForm.amount) > balance
                            ? 'Amount exceeds your available balance'
                            : `Withdrawing ₦${parseFloat(withdrawForm.amount).toLocaleString()} · Remaining: ₦${(balance - parseFloat(withdrawForm.amount)).toLocaleString()}`}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button onClick={handleWithdraw}
                      disabled={withdrawLoading || !withdrawForm.amount || !withdrawForm.accountName
                        || !withdrawForm.accountNumber || !withdrawForm.bankCode
                        || parseFloat(withdrawForm.amount) > balance || parseFloat(withdrawForm.amount) <= 0}
                      className="w-full h-12 bg-primary text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                      {withdrawLoading
                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting Request…</span>
                        : <span className="flex items-center gap-2"><Minus className="w-4 h-4" />Submit Withdrawal Request</span>}
                    </Button>
                  </div>
                </motion.div>
              )}

              {activeTab === "notifications" && (
                <motion.div key="notifications"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-lg">All Notifications</h2>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={() => {
                          fetch('/api/notifications', { method: 'PATCH', headers: authHeaders() }).catch(() => {});
                          setNotifications(n => n.map(x => ({ ...x, read: true })));
                        }}
                        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                        <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                      <BellRing className="w-12 h-12 mb-3 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                      <p className="text-xs mt-1">Activity like logins and transactions will appear here</p>
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                      {notifications.map((n: any) => (
                        <div key={n._id} className={`p-4 flex items-start gap-3 ${n.read ? '' : 'bg-primary/5'}`}>
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            n.type === 'login' ? 'bg-blue-100' :
                            n.type === 'deposit' ? 'bg-emerald-100' :
                            n.type === 'withdrawal' ? 'bg-amber-100' :
                            n.type === 'investment' ? 'bg-violet-100' : 'bg-muted'
                          }`}>
                            {n.type === 'login' && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                            {n.type === 'deposit' && <ArrowDownLeft className="w-4 h-4 text-emerald-600" />}
                            {n.type === 'withdrawal' && <CreditCard className="w-4 h-4 text-amber-600" />}
                            {n.type === 'investment' && <TrendingUp className="w-4 h-4 text-violet-600" />}
                            {!['login','deposit','withdrawal','investment'].includes(n.type) && <Bell className="w-4 h-4 text-muted-foreground" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-semibold text-foreground">{n.title}</span>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                              {new Date(n.created_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ═══ SECURITY ═══ */}
              {activeTab === "security" && (
                <motion.div key="security"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-5">

                  <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                      <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold font-display mb-1">Your Security</h2>
                    <p className="text-white/60 text-sm">How your transactions and data are kept safe on SmartInvest.</p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Secured by Paystack</h3>
                        <p className="text-xs text-muted-foreground">Nigeria's most trusted payment infrastructure</p>
                      </div>
                    </div>
                    {[
                      { title: "PCI DSS Compliant", desc: "All card and payment data is handled in compliance with Payment Card Industry Data Security Standards. Your card details are never stored on our servers." },
                      { title: "256-bit SSL Encryption", desc: "Every transaction between your browser and our servers is encrypted using bank-grade 256-bit SSL, ensuring your data cannot be intercepted." },
                      { title: "3D Secure Authentication", desc: "Transactions are protected by 3D Secure (3DS), which adds an extra verification step with your bank before any payment is completed." },
                      { title: "Instant Transaction Alerts", desc: "You receive an in-app notification for every deposit, withdrawal, and investment activity on your account in real time." },
                    ].map(({ title, desc }) => (
                      <div key={title} className="p-4 rounded-xl bg-muted/30 border border-border">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-sm font-semibold text-foreground">{title}</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">{desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-blue-900">EasyBuy — Our Payment Channel</h3>
                        <p className="text-xs text-blue-700">Safe virtual account funding powered by EasyBuy</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      EasyBuy is our API-level payment provider integrated through Paystack. When you fund your wallet and select the <strong>EasyBuy</strong> channel, a unique virtual bank account is generated specifically for your transaction.
                    </p>
                    {[
                      { title: "Unique per transaction", desc: "Each virtual account number is single-use and tied to your specific top-up amount, so only the exact amount you intend to deposit is accepted." },
                      { title: "Instant crediting", desc: "Once your bank transfer reaches the virtual account, your SmartInvest wallet is credited automatically within seconds — no manual confirmation needed." },
                      { title: "No third-party access", desc: "EasyBuy does not store or share your bank account details. All account resolution is handled securely within Paystack's encrypted infrastructure." },
                    ].map(({ title, desc }) => (
                      <div key={title} className="p-3 rounded-xl bg-white/60 border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="text-xs font-semibold text-blue-900">{title}</span>
                        </div>
                        <p className="text-xs text-blue-700 leading-relaxed pl-5">{desc}</p>
                      </div>
                    ))}
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-800">
                        <strong>Important:</strong> Always verify that the virtual account name shown on the Paystack checkout matches <strong>SmartInvest / EasyBuy</strong> before making any transfer.
                      </p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-sm mb-3">Security Tips</h3>
                    <div className="space-y-3">
                      {[
                        "Never share your login credentials or OTP with anyone, including SmartInvest support.",
                        "Always access the platform from the official SmartInvest URL.",
                        "Log out of your account when using shared or public devices.",
                        "If you suspect unauthorized activity, contact support immediately.",
                      ].map((tip, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div key="profile"
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.28 }} className="p-5 space-y-5">

                  <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white flex items-center gap-4">
                    <button onClick={() => fileInputRef.current?.click()} className="relative group shrink-0" title="Change profile picture">
                      <AvatarIcon picture={user?.profile_picture} size="lg" />
                      {profilePicLoading
                        ? <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /></div>
                        : <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all flex-col gap-0.5"><Camera className="w-5 h-5 text-white" /><span className="text-[9px] text-white font-medium">Change</span></div>
                      }
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold font-display">{user?.username}</h2>
                      <p className="text-white/50 text-sm mt-0.5">{user?.email}</p>
                      <p className="text-white/40 text-xs mt-1">Referral: {user?.referral_code}</p>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                    <h3 className="font-semibold text-base">Personal Information</h3>
                    {[
                      { key: "date_of_birth", label: "Date of Birth",   placeholder: "YYYY-MM-DD", icon: CalendarDays, type: "date" },
                      { key: "phone",         label: "Phone Number",    placeholder: "+234 800 000 0000", icon: Phone,       type: "tel" },
                      { key: "gender",        label: "Gender",          placeholder: "", icon: UserCircle, type: "select" },
                      { key: "address",       label: "Home Address",    placeholder: "Street, City, State", icon: MapPin,      type: "text" },
                      { key: "nin",           label: "NIN",             placeholder: "11-digit NIN", icon: ShieldCheck, type: "text" },
                      { key: "bio",           label: "Bio",             placeholder: "Tell us a bit about yourself", icon: FileText,   type: "textarea" },
                    ].map(({ key, label, placeholder, icon: Icon, type }) => (
                      <div key={key}>
                        <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />{label}
                        </label>
                        {type === "select" ? (
                          <div className="relative">
                            <select value={(profileForm as any)[key] || (user as any)?.[key] || ""}
                              onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                              className="w-full h-11 pl-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 appearance-none">
                              <option value="">Select gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Prefer not to say</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                          </div>
                        ) : type === "textarea" ? (
                          <textarea rows={3} placeholder={placeholder}
                            value={(profileForm as any)[key] || (user as any)?.[key] || ""}
                            onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground resize-none" />
                        ) : (
                          <input type={type} placeholder={placeholder}
                            value={(profileForm as any)[key] || (user as any)?.[key] || ""}
                            onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground" />
                        )}
                      </div>
                    ))}
                    <Button onClick={handleSaveProfile} disabled={profileSaving}
                      className="w-full h-11 bg-primary text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                      {profileSaving
                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
                        : <span className="flex items-center gap-2"><Check className="w-4 h-4" />Save Profile</span>}
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Profile Setup Modal — shown on first login */}
      <AnimatePresence>
        {showProfileSetup && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="bg-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="bg-gradient-to-br from-foreground to-foreground/90 p-6 text-white">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-4">
                  <UserCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-1">Tell us about you</h2>
                <p className="text-white/60 text-sm">Complete your profile to personalize your experience. You can update this anytime.</p>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                {[
                  { key: "date_of_birth", label: "Date of Birth",  icon: CalendarDays, type: "date",     placeholder: "" },
                  { key: "phone",         label: "Phone Number",   icon: Phone,        type: "tel",      placeholder: "+234 800 000 0000" },
                  { key: "gender",        label: "Gender",         icon: UserCircle,   type: "select",   placeholder: "" },
                  { key: "address",       label: "Home Address",   icon: MapPin,       type: "text",     placeholder: "Street, City, State" },
                  { key: "nin",           label: "NIN",            icon: ShieldCheck,  type: "text",     placeholder: "11-digit NIN" },
                  { key: "bio",           label: "Short Bio",      icon: FileText,     type: "textarea", placeholder: "A little about yourself…" },
                ].map(({ key, label, icon: Icon, type, placeholder }) => (
                  <div key={key}>
                    <label className="text-sm font-medium flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />{label}
                    </label>
                    {type === "select" ? (
                      <div className="relative">
                        <select value={(profileForm as any)[key]}
                          onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full h-11 pl-4 pr-10 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 appearance-none">
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Prefer not to say</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    ) : type === "textarea" ? (
                      <textarea rows={2} placeholder={placeholder}
                        value={(profileForm as any)[key]}
                        onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all placeholder:text-muted-foreground resize-none" />
                    ) : (
                      <input type={type} placeholder={placeholder}
                        value={(profileForm as any)[key]}
                        onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/25 transition-all placeholder:text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-border flex gap-3">
                <button onClick={() => setShowProfileSetup(false)}
                  className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
                  Skip for now
                </button>
                <Button onClick={handleSaveProfile} disabled={profileSaving}
                  className="flex-1 h-11 bg-primary text-white rounded-xl font-semibold hover:brightness-110">
                  {profileSaving
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</span>
                    : "Save Profile"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
