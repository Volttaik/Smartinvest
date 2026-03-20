import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Package, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getPortfolio, getTransactions } from "@/lib/api";

const COLORS = ["hsl(var(--primary))", "#3b82f6", "#10b981", "#8b5cf6", "#f97316"];

const AVATAR_MAP: Record<string, { bg: string; icon: string }> = {
  avatar1: { bg: "bg-red-500", icon: "💼" },
  avatar2: { bg: "bg-blue-500", icon: "🚀" },
  avatar3: { bg: "bg-green-500", icon: "📈" },
  avatar4: { bg: "bg-purple-500", icon: "💎" },
  avatar5: { bg: "bg-orange-500", icon: "⚡" },
  avatar6: { bg: "bg-teal-500", icon: "🌟" },
  avatar7: { bg: "bg-pink-500", icon: "👑" },
  avatar8: { bg: "bg-indigo-500", icon: "🛡️" },
};

export default function Portfolio() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"investments" | "trades">("investments");

  useEffect(() => {
    Promise.all([getPortfolio(), getTransactions()])
      .then(([port, txs]) => { setData(port); setTransactions(txs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const av = AVATAR_MAP[user?.profile_picture || "avatar1"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const investments = data?.investments || [];
  const trades = data?.trades || [];
  const allocation = data?.allocation || [];
  const totalInvested = investments.filter((i: any) => i.status === "active").reduce((s: number, i: any) => s + parseFloat(i.amount), 0);
  const totalEarned = investments.reduce((s: number, i: any) => s + parseFloat(i.total_earned), 0);

  return (
    <div className="min-h-screen bg-background pt-[103px]">
      <div className="container mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${av.bg} flex items-center justify-center text-2xl`}>{av.icon}</div>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{user?.username}&apos;s Portfolio</h1>
              <p className="text-muted-foreground text-sm">Overview of your investments and trades</p>
            </div>
          </div>
          <Link to="/dashboard" className="text-sm text-primary hover:underline">← Dashboard</Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Account Balance", value: `₦${parseFloat(String(data?.balance || 0)).toLocaleString()}`, color: "text-primary" },
            { label: "Total Invested", value: `₦${totalInvested.toLocaleString()}`, color: "text-blue-600" },
            { label: "Total Earned", value: `₦${totalEarned.toLocaleString()}`, color: "text-green-600" },
            { label: "Referral Earnings", value: `₦${parseFloat(String(data?.referralEarnings || 0)).toLocaleString()}`, color: "text-purple-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-card border border-border rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-1">{label}</div>
              <div className={`text-xl font-bold ${color}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-4">Investment History</h3>
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={transactions.filter(t => ["daily_return", "trade_gain"].includes(t.type)).slice(0, 20).reverse()}>
                  <defs>
                    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="created_at" tickFormatter={(v) => new Date(v).toLocaleDateString()} tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v: any) => `₦${parseFloat(v).toLocaleString()}`} labelFormatter={(l) => new Date(l).toLocaleDateString()} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="url(#p)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">No earnings data yet.</div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="font-semibold text-sm mb-4">Asset Allocation</h3>
            {allocation.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={allocation} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                      {allocation.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₦${parseFloat(v).toLocaleString()}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {allocation.map((a: any, i: number) => (
                    <div key={a.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-muted-foreground">{a.name}</span>
                      </div>
                      <span className="font-semibold">₦{parseFloat(a.value).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[160px] flex items-center justify-center text-muted-foreground text-sm">No active investments.</div>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex border-b border-border">
            {(["investments", "trades"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-all border-b-2 ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                {t === "investments" ? `Investments (${investments.length})` : `Trade Log (${trades.length})`}
              </button>
            ))}
          </div>

          {tab === "investments" && (
            investments.length > 0 ? investments.map((inv: any) => {
              const pct = Math.min(100, (inv.days_completed / inv.duration_days) * 100);
              return (
                <div key={inv.id} className="p-4 border-b border-border last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{inv.package_name}</span>
                      <Badge className="text-xs">{inv.tier}</Badge>
                      <Badge variant={inv.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{inv.status}</Badge>
                    </div>
                    <span className={`text-sm font-bold ${inv.status === "active" ? "text-green-600" : "text-muted-foreground"}`}>
                      +{inv.daily_return_pct}%/day
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                    <span>Invested: ₦{parseFloat(inv.amount).toLocaleString()}</span>
                    <span>Earned: ₦{parseFloat(inv.total_earned).toLocaleString()}</span>
                    <span>Day {inv.days_completed}/{inv.duration_days}</span>
                    <span>Started: {new Date(inv.start_date).toLocaleDateString()}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${inv.status === "completed" ? "bg-green-500" : "bg-primary"}`}
                      style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }) : (
              <div className="py-10 text-center text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No investments yet. <Link to="/dashboard" className="text-primary hover:underline">Start investing</Link></p>
              </div>
            )
          )}

          {tab === "trades" && (
            trades.length > 0 ? trades.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.trade_type === "gain" ? "bg-green-50" : "bg-red-50"}`}>
                    {t.trade_type === "gain" ? <TrendingUp className="w-4 h-4 text-green-600" /> : <TrendingDown className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.asset}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${t.trade_type === "gain" ? "text-green-600" : "text-red-600"}`}>
                  {t.trade_type === "gain" ? "+" : "-"}₦{parseFloat(t.amount).toLocaleString()}
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No trades recorded yet.</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
