'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";
import {
  TrendingUp, TrendingDown, LogOut, BarChart3, Wallet,
  ArrowUpRight, Activity, Menu,
  CreditCard, Zap, RefreshCw, Copy, Check, Package, AlertCircle,
  ChevronLeft, ChevronRight, Target, Layers, DollarSign, Bell,
  ArrowDownLeft, Plus, Minus, Clock, Star, PieChartIcon, Gem,
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

function AvatarIcon({ picture }: { picture?: string }) {
  const idx = Math.abs((picture || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const Icon = AVATAR_ICONS[idx];
  return (
    <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[idx]} flex items-center justify-center shrink-0`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
  );
}

const PIE_COLORS = ["hsl(var(--primary))", "#3b82f6", "#10b981", "#8b5cf6", "#f97316"];
type Tab = "overview" | "invest" | "transactions" | "referrals" | "fund" | "withdraw" | "portfolio" | "assets";
declare const PaystackPop: any;

/* ─────────────────────────────────────────
   LIVE MARKET PRICE CHART
───────────────────────────────────────── */
function MarketPriceChart() {
  const [priceData, setPriceData] = useState<{ time: string; btc: number; eth: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCoin, setActiveCoin] = useState<"btc" | "eth">("btc");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily",
          { cache: "no-store" }
        );
        const ethRes = await fetch(
          "https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&interval=daily",
          { cache: "no-store" }
        );
        if (res.ok && ethRes.ok) {
          const btcJson = await res.json();
          const ethJson = await ethRes.json();
          const combined = btcJson.prices.slice(-7).map((p: number[], i: number) => ({
            time: new Date(p[0]).toLocaleDateString("en", { weekday: "short" }),
            btc: Math.round(p[1]),
            eth: Math.round((ethJson.prices[i] || [0, 0])[1]),
          }));
          setPriceData(combined);
        }
      } catch {
        const now = Date.now();
        const mock = Array.from({ length: 7 }, (_, i) => ({
          time: new Date(now - (6 - i) * 86400000).toLocaleDateString("en", { weekday: "short" }),
          btc: 65000 + Math.sin(i) * 2000 + Math.random() * 1000,
          eth: 3200 + Math.sin(i + 1) * 150 + Math.random() * 80,
        }));
        setPriceData(mock);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const latest = priceData[priceData.length - 1];
  const prev = priceData[priceData.length - 2];
  const change = latest && prev
    ? (((latest[activeCoin] - prev[activeCoin]) / prev[activeCoin]) * 100).toFixed(2)
    : "0.00";
  const isUp = parseFloat(change) >= 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm text-foreground">Market Prices</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Live crypto market data</p>
        </div>
        <div className="flex gap-1.5">
          {(["btc", "eth"] as const).map(c => (
            <button key={c} onClick={() => setActiveCoin(c)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all uppercase
                ${activeCoin === c ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[160px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-2xl font-bold text-foreground">
              ${latest?.[activeCoin]?.toLocaleString()}
            </span>
            <span className={`text-sm font-semibold flex items-center gap-0.5 ${isUp ? "text-emerald-600" : "text-red-500"}`}>
              {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isUp ? "+" : ""}{change}%
            </span>
            <span className="text-xs text-muted-foreground">7d</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="price-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(v: any) => [`$${parseFloat(v).toLocaleString()}`, activeCoin.toUpperCase()]}
                contentStyle={{ borderRadius: 10, border: "1px solid hsl(var(--border))", fontSize: 11 }} />
              <Area type="monotone" dataKey={activeCoin}
                stroke={isUp ? "#10b981" : "#ef4444"}
                fill="url(#price-grad)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
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
          { label: "Portfolio Value", value: `₦${balance.toLocaleString()}`, color: "text-foreground", bg: "bg-primary/10", icon: Wallet },
          { label: "Total Invested", value: `₦${totalInvested.toLocaleString()}`, color: "text-blue-600", bg: "bg-blue-50 border-blue-100", icon: TrendingUp },
          { label: "Total Earned", value: `₦${totalEarned.toLocaleString()}`, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100", icon: DollarSign },
          { label: "ROI", value: `+${roi}%`, color: "text-violet-600", bg: "bg-violet-50 border-violet-100", icon: BarChart3 },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className="bg-card border border-border rounded-2xl p-4">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-2.5 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
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
const ASSET_LIST = [
  { symbol: "BTC", name: "Bitcoin", color: "#f97316", bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
  { symbol: "ETH", name: "Ethereum", color: "#8b5cf6", bg: "bg-violet-50 border-violet-100", text: "text-violet-600" },
  { symbol: "BNB", name: "BNB", color: "#eab308", bg: "bg-yellow-50 border-yellow-100", text: "text-yellow-600" },
  { symbol: "SOL", name: "Solana", color: "#10b981", bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600" },
  { symbol: "USDT", name: "Tether", color: "#3b82f6", bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
];

function AssetsTab({ dashData }: { dashData: any }) {
  const [prices, setPrices] = useState<Record<string, { usd: number; usd_24h_change: number }>>({});
  const [loading, setLoading] = useState(true);
  const allocation = dashData?.allocation || [];

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,solana,tether&vs_currencies=usd&include_24hr_change=true")
      .then(r => r.json())
      .then(data => {
        setPrices({
          BTC: data.bitcoin,
          ETH: data.ethereum,
          BNB: data.binancecoin,
          SOL: data.solana,
          USDT: data.tether,
        });
      })
      .catch(() => {
        setPrices({
          BTC: { usd: 65000, usd_24h_change: 2.4 },
          ETH: { usd: 3200,  usd_24h_change: 1.8 },
          BNB: { usd: 580,   usd_24h_change: -0.5 },
          SOL: { usd: 155,   usd_24h_change: 3.2 },
          USDT: { usd: 1.0,  usd_24h_change: 0.01 },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div key="assets-tab"
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }} className="p-5 space-y-5">

      <div className="bg-gradient-to-br from-foreground to-foreground/90 rounded-3xl p-6 text-white">
        <p className="text-white/60 text-[10px] uppercase tracking-widest font-bold mb-2">Your Holdings</p>
        <h2 className="text-3xl font-bold font-display">{allocation.length} Assets</h2>
        <p className="text-white/50 text-sm mt-1">Diversified across investment packages</p>
      </div>

      {allocation.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-semibold text-sm mb-4">Portfolio Allocation</h3>
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
        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h3 className="font-semibold text-sm">Market Prices</h3>
          {loading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
        </div>
        <div className="divide-y divide-border">
          {ASSET_LIST.map(({ symbol, name, bg, text }) => {
            const p = prices[symbol];
            const change = p?.usd_24h_change ?? 0;
            const isUp = change >= 0;
            return (
              <motion.div key={symbol}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-muted/20 transition-colors">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bg}`}>
                  <span className={`text-xs font-bold ${text}`}>{symbol.slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{symbol}</p>
                </div>
                {p ? (
                  <div className="text-right">
                    <p className="text-sm font-bold">${p.usd.toLocaleString()}</p>
                    <p className={`text-xs font-semibold ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                      {isUp ? "+" : ""}{change.toFixed(2)}%
                    </p>
                  </div>
                ) : (
                  <div className="w-16 h-8 bg-muted rounded animate-pulse" />
                )}
              </motion.div>
            );
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

  const authHeaders = () => {
    const tok = localStorage.getItem('si_token');
    return { 'Content-Type': 'application/json', ...(tok ? { Authorization: `Bearer ${tok}` } : {}) };
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
        .then(r => r.json())
        .then(() => { showNotif("success", "Wallet funded!"); loadDashboard(); refreshUser(); })
        .catch(() => showNotif("error", "Payment verification failed."));
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
            onClose: () => setFundLoading(false),
            callback: async (response: any) => {
              try {
                await fetch(`/api/wallet/verify/${response.reference}`, { headers: authHeaders() });
                showNotif("success", "Wallet funded successfully!");
                await loadDashboard(); await refreshUser(); setFundAmount("");
              } catch { showNotif("error", "Verification failed."); }
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

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...withdrawForm, amount: parseFloat(withdrawForm.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotif("success", "Withdrawal initiated!");
      setWithdrawForm({ amount: "", accountName: "", accountNumber: "", bankCode: "", bankName: "" });
      await loadDashboard(); await refreshUser();
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

  const navItems = [
    { id: "overview",      icon: BarChart3,      label: "Welcome" },
    { id: "portfolio",     icon: PieChartIcon,   label: "Portfolio" },
    { id: "assets",        icon: Gem,            label: "Assets" },
    { id: "invest",        icon: Package,        label: "Invest" },
    { id: "transactions",  icon: Activity,       label: "Transactions" },
    { id: "referrals",     icon: Zap,            label: "Referrals" },
    { id: "fund",          icon: Wallet,         label: "Fund Wallet" },
    { id: "withdraw",      icon: CreditCard,     label: "Withdraw" },
  ] as const;

  const currentNav = navItems.find(n => n.id === activeTab);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">

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
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative
                ${activeTab === id
                  ? "bg-primary text-white shadow-sm"
                  : "text-white/55 hover:text-white hover:bg-white/8"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
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
                {activeTab === "overview" ? `Welcome, ${user?.username || 'investor'}` : currentNav?.label}
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
            <button onClick={loadDashboard}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
            </button>
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
                      { label: "Balance",    value: `₦${balance.toLocaleString()}`,                                                icon: Wallet,    sub: "available" },
                      { label: "Invested",   value: `₦${parseFloat(dashData?.investments?.total_invested || 0).toLocaleString()}`, icon: TrendingUp, sub: `${dashData?.investments?.active_count || 0} active` },
                      { label: "Earned",     value: `₦${parseFloat(dashData?.investments?.total_earned || 0).toLocaleString()}`,   icon: DollarSign, sub: "total returns" },
                      { label: "Referrals",  value: String(dashData?.referrals?.referred_users || 0),                              icon: Zap,        sub: `₦${parseFloat(dashData?.referrals?.earnings || 0).toLocaleString()} earned` },
                    ].map(({ label, value, icon: Icon, sub }) => (
                      <motion.div key={label} whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="bg-card border border-border rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-primary" />
                          </div>
                        </div>
                        <div className="font-bold text-foreground text-lg leading-tight">{value}</div>
                        <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>
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
                        <p className="text-[10px] text-muted-foreground text-center">5% commission on every referral investment</p>
                      </div>
                      <Button size="sm" onClick={() => setActiveTab("fund")} className="w-full bg-primary text-white rounded-xl mt-3">
                        Fund Wallet
                      </Button>
                    </div>
                  </div>

                  {/* Live market chart */}
                  <MarketPriceChart />

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
                      <div className="space-y-1">
                        {dashData.recentTransactions.slice(0, 5).map((tx: any, i: number) => {
                          const isCredit = ["deposit","daily_return","trade_gain","referral_commission"].includes(tx.type);
                          return (
                            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.04 }}
                              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                                ${isCredit ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                                {isCredit
                                  ? <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                                  : <ArrowDownLeft className="w-4 h-4 text-red-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground capitalize">
                                  {tx.type.replace(/_/g, ' ')}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`text-sm font-bold ${isCredit ? 'text-emerald-600' : 'text-red-500'}`}>
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
                    <h2 className="text-3xl font-bold font-display mb-1">Earn 5% Commission</h2>
                    <p className="text-white/60 text-sm">For every friend you refer who invests</p>
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
                        { step: "1", title: "Share your code", desc: "Send your referral code to friends" },
                        { step: "2", title: "They register", desc: "They create an account with your code" },
                        { step: "3", title: "They invest", desc: "When they invest, you earn 5% commission" },
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

                    {[
                      { key: "amount",        label: "Amount (₦)",    placeholder: "Enter amount", type: "number",  prefix: "₦" },
                      { key: "accountName",   label: "Account Name",  placeholder: "Full account holder name", type: "text" },
                      { key: "accountNumber", label: "Account Number", placeholder: "10-digit NUBAN number", type: "text" },
                      { key: "bankName",      label: "Bank Name",     placeholder: "e.g. First Bank, GTBank", type: "text" },
                      { key: "bankCode",      label: "Bank Code",     placeholder: "3-digit bank code", type: "text" },
                    ].map(({ key, label, placeholder, type, prefix }) => (
                      <div key={key}>
                        <label className="text-sm font-medium block mb-1.5">{label}</label>
                        <div className="relative">
                          {prefix && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">{prefix}</span>}
                          <input type={type} placeholder={placeholder}
                            value={(withdrawForm as any)[key]}
                            onChange={e => setWithdrawForm(f => ({ ...f, [key]: e.target.value }))}
                            className={`w-full h-11 ${prefix ? 'pl-8' : 'pl-4'} pr-4 rounded-xl border border-border bg-background text-foreground text-sm
                              focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all placeholder:text-muted-foreground`} />
                        </div>
                      </div>
                    ))}

                    <AnimatePresence>
                      {withdrawForm.amount && parseFloat(withdrawForm.amount) > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`p-3 rounded-xl text-xs border ${
                            parseFloat(withdrawForm.amount) > balance
                              ? 'bg-red-50 border-red-200 text-red-700'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                          {parseFloat(withdrawForm.amount) > balance
                            ? '⚠ Amount exceeds your available balance'
                            : `Withdrawing ₦${parseFloat(withdrawForm.amount).toLocaleString()} · Remaining: ₦${(balance - parseFloat(withdrawForm.amount)).toLocaleString()}`}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button onClick={handleWithdraw}
                      disabled={withdrawLoading || !withdrawForm.amount || !withdrawForm.accountName
                        || !withdrawForm.accountNumber || parseFloat(withdrawForm.amount) > balance || parseFloat(withdrawForm.amount) <= 0}
                      className="w-full h-12 bg-primary text-white rounded-xl font-semibold hover:brightness-110 transition-all">
                      {withdrawLoading
                        ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</span>
                        : <span className="flex items-center gap-2"><Minus className="w-4 h-4" />Withdraw Funds</span>}
                    </Button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
