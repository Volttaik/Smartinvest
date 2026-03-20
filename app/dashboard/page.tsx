'use client';

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import {
  TrendingUp, Bell, LogOut, BarChart3, Wallet,
  ArrowUpRight, ArrowDownRight, Activity, Menu, X,
  CreditCard, Zap, RefreshCw, Copy, Check, Package, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

const AVATAR_COLORS = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-teal-500", "bg-pink-500", "bg-indigo-500"];
const AVATAR_ICONS = [TrendingUp, BarChart3, Activity, Zap, Wallet, CreditCard, ArrowUpRight, Bell];

function AvatarIcon({ picture }: { picture?: string }) {
  const idx = Math.abs((picture || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  const Icon = AVATAR_ICONS[idx];
  return (
    <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[idx]} flex items-center justify-center shrink-0`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
  );
}

const PIE_COLORS = ["hsl(var(--primary))", "#3b82f6", "#10b981", "#8b5cf6", "#f97316", "#06b6d4"];
type Tab = "overview" | "invest" | "transactions" | "referrals" | "fund" | "withdraw";
declare const PaystackPop: any;

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
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", accountName: "", accountNumber: "", bankCode: "", bankName: "" });
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
    if (!tok && !user) {
      router.replace('/login');
    } else {
      setAuthChecked(true);
    }
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
      if (!res.ok) { showNotif("error", data.error || "Failed to load dashboard."); return; }
      setDashData(data);
    } catch { showNotif("error", "Failed to load dashboard data."); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { if (authChecked) loadDashboard(); }, [authChecked, loadDashboard]);

  useEffect(() => {
    if (activeTab === "invest" && packages.length === 0) {
      fetch('/api/packages', { headers: authHeaders() }).then(r => r.json()).then(setPackages).catch(() => {});
    }
  }, [activeTab, packages.length]);

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const funded = params.get("funded");
    const ref = params.get("ref");
    if (funded && ref) {
      fetch(`/api/wallet/verify/${ref}`, { headers: authHeaders() })
        .then(r => r.json())
        .then(() => { showNotif("success", "Wallet funded successfully!"); loadDashboard(); refreshUser(); })
        .catch(() => showNotif("error", "Payment verification failed."));
    }
  }, []);

  const handleLogout = () => { logout(); router.push("/"); };

  const handleInvest = async (pkg: any) => {
    setPkgLoading(true);
    try {
      const res = await fetch('/api/packages/invest', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ packageId: pkg.id }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotif("success", `Successfully invested in ${pkg.name}!`);
      setSelectedPkg(null);
      await loadDashboard(); await refreshUser(); setActiveTab("overview");
    } catch (err: any) { showNotif("error", err.message || "Investment failed."); }
    finally { setPkgLoading(false); }
  };

  const handleFund = async () => {
    if (!fundAmount || parseFloat(fundAmount) < 100) { showNotif("error", "Minimum deposit is ₦100"); return; }
    setFundLoading(true);
    try {
      const res = await fetch('/api/wallet/fund', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ amount: parseFloat(fundAmount) }) });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      if (result.authorizationUrl) {
        if (typeof PaystackPop !== "undefined") {
          const handler = PaystackPop.setup({
            key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
            email: user?.email, amount: parseFloat(fundAmount) * 100, ref: result.reference,
            onClose: () => setFundLoading(false),
            callback: async (response: any) => {
              try {
                await fetch(`/api/wallet/verify/${response.reference}`, { headers: authHeaders() });
                showNotif("success", "Wallet funded successfully!");
                await loadDashboard(); await refreshUser(); setFundAmount("");
              } catch { showNotif("error", "Payment verification failed."); }
              setFundLoading(false);
            },
          });
          handler.openIframe();
        } else { window.location.href = result.authorizationUrl; }
      }
    } catch (err: any) { showNotif("error", err.message || "Payment initialization failed."); setFundLoading(false); }
  };

  const handleWithdraw = async () => {
    setWithdrawLoading(true);
    try {
      const res = await fetch('/api/wallet/withdraw', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ ...withdrawForm, amount: parseFloat(withdrawForm.amount) }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotif("success", "Withdrawal initiated successfully!");
      setWithdrawForm({ amount: "", accountName: "", accountNumber: "", bankCode: "", bankName: "" });
      await loadDashboard(); await refreshUser();
    } catch (err: any) { showNotif("error", err.message || "Withdrawal failed."); }
    finally { setWithdrawLoading(false); }
  };

  const copyReferral = () => {
    if (user?.referral_code) {
      navigator.clipboard.writeText(user.referral_code);
      setReferralCopied(true);
      setTimeout(() => setReferralCopied(false), 2000);
    }
  };

  const balance = dashData?.balance ?? 0;
  const tiers = ["All", ...Array.from(new Set(packages.map((p: any) => p.tier)))];
  const filteredPackages = tierFilter === "All" ? packages : packages.filter((p: any) => p.tier === tierFilter);

  const navItems = [
    { id: "overview", icon: BarChart3, label: "Overview" },
    { id: "invest", icon: Package, label: "Invest" },
    { id: "transactions", icon: Activity, label: "Transactions" },
    { id: "referrals", icon: Zap, label: "Referrals" },
    { id: "fund", icon: Wallet, label: "Fund Wallet" },
    { id: "withdraw", icon: CreditCard, label: "Withdraw" },
  ] as const;

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <AnimatePresence>
        {notification && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium
              ${notification.type === "success" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
            {notification.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <aside className={`fixed lg:relative z-40 flex flex-col h-full bg-foreground text-primary-foreground w-64 shrink-0 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold font-display text-lg text-white">Smart Invest<span className="text-primary">.</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${activeTab === id ? "bg-primary/20 text-primary" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-1">
            {user?.profile_picture && user.profile_picture.startsWith('data:image/') ? (
              <img src={user.profile_picture} alt="Profile" className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <AvatarIcon picture={user?.profile_picture} />
            )}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.username}</div>
              <div className="text-xs text-white/50 truncate">{user?.email}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <button className="lg:hidden text-foreground" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-50 border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-green-700">Balance: ₦{parseFloat(String(user?.balance || 0)).toLocaleString()}</span>
            </div>
            <button onClick={loadDashboard} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Account Balance", value: `₦${balance.toLocaleString()}`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
                      { label: "Total Invested", value: `₦${parseFloat(dashData?.investments?.total_invested || 0).toLocaleString()}`, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                      { label: "Total Earnings", value: `₦${parseFloat(dashData?.investments?.total_earned || 0).toLocaleString()}`, icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50" },
                      { label: "Active Investments", value: dashData?.investments?.active_count || 0, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                        className="bg-card border border-border rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-muted-foreground">{label}</span>
                          <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center`}>
                            <Icon className={`w-4 h-4 ${color}`} />
                          </div>
                        </div>
                        <div className={`text-2xl font-bold ${color}`}>{value}</div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-semibold text-sm mb-4">Earnings Chart</h3>
                      {dashData?.chartData?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={dashData.chartData}>
                            <defs>
                              <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip formatter={(v: any) => `₦${parseFloat(v).toLocaleString()}`} />
                            <Area type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" fill="url(#earn)" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
                          <BarChart3 className="w-10 h-10 mb-2 opacity-30" />
                          <p className="text-sm">Earnings data will appear here after your first investment.</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-5">
                      <h3 className="font-semibold text-sm mb-4">Referral Stats</h3>
                      <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-muted/50">
                          <div className="text-xs text-muted-foreground mb-1">Your Referral Code</div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-primary">{user?.referral_code}</span>
                            <button onClick={copyReferral} className="text-muted-foreground hover:text-primary">
                              {referralCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                          <span className="text-muted-foreground">Referred Users</span>
                          <span className="font-semibold">{dashData?.referrals?.referred_users || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Referral Earnings</span>
                          <span className="font-semibold text-green-600">₦{parseFloat(dashData?.referrals?.earnings || 0).toLocaleString()}</span>
                        </div>
                        <Button onClick={() => setActiveTab("fund")} size="sm" className="w-full bg-primary text-white rounded-xl">
                          Fund Wallet
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-sm mb-4">Active Investments</h3>
                    {dashData?.activeInvestments?.length > 0 ? (
                      <div className="space-y-3">
                        {dashData.activeInvestments.map((inv: any) => {
                          const pct = Math.min(100, (inv.days_completed / inv.duration_days) * 100);
                          return (
                            <div key={inv._id} className="p-4 rounded-xl bg-muted/30 border border-border">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <span className="text-sm font-semibold">{inv.package_name}</span>
                                  <Badge className="ml-2 text-xs">{inv.package_id?.tier || 'Active'}</Badge>
                                </div>
                                <span className="text-sm font-bold text-green-600">+{inv.daily_return_pct}%/day</span>
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                <span>Invested: ₦{parseFloat(inv.amount).toLocaleString()}</span>
                                <span>Earned: ₦{parseFloat(inv.total_earned).toLocaleString()}</span>
                                <span>Day {inv.days_completed}/{inv.duration_days}</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <motion.div className="h-full bg-primary rounded-full"
                                  initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No active investments. <button onClick={() => setActiveTab("invest")} className="text-primary hover:underline">Browse packages</button></p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "invest" && (
                <motion.div key="invest" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                  <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Investment amounts will be deducted from your wallet. Daily returns are probabilistic and may include trading gains or losses.</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {tiers.map(t => (
                      <button key={t} onClick={() => setTierFilter(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border
                          ${tierFilter === t ? "bg-primary text-white border-primary" : "bg-background text-muted-foreground border-border hover:border-primary"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPackages.map((pkg: any) => (
                      <motion.div key={pkg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-5 flex flex-col hover:border-primary/50 transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="text-xs">{pkg.tier}</Badge>
                          <span className="text-xs text-muted-foreground">{pkg.duration_days} days</span>
                        </div>
                        <h3 className="font-bold text-foreground mb-1">{pkg.name}</h3>
                        <div className="text-2xl font-bold text-primary mb-3">₦{parseFloat(pkg.price).toLocaleString()}</div>
                        <div className="space-y-1.5 mb-4 flex-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Daily Return</span>
                            <span className="font-semibold text-green-600">+{pkg.daily_return_pct}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration</span>
                            <span className="font-semibold">{pkg.duration_days} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total ROI</span>
                            <span className="font-bold text-primary">+{parseFloat(pkg.total_roi).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Expected Return</span>
                            <span className="font-semibold">₦{(parseFloat(pkg.price) * (1 + parseFloat(pkg.total_roi) / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                          </div>
                        </div>
                        <Button onClick={() => setSelectedPkg(pkg)} size="sm"
                          className="w-full bg-primary text-white rounded-xl hover:brightness-110"
                          disabled={balance < parseFloat(pkg.price)}>
                          {balance < parseFloat(pkg.price) ? "Insufficient Balance" : "Invest Now"}
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <AnimatePresence>
                    {selectedPkg && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
                          className="bg-background rounded-2xl p-6 w-full max-w-sm border border-border shadow-xl">
                          <h3 className="font-bold text-lg mb-4">Confirm Investment</h3>
                          <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Package</span>
                              <span className="font-semibold">{selectedPkg.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Cost</span>
                              <span className="font-bold text-primary">₦{parseFloat(selectedPkg.price).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Daily Return</span>
                              <span className="font-semibold text-green-600">+{selectedPkg.daily_return_pct}%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Duration</span>
                              <span className="font-semibold">{selectedPkg.duration_days} days</span>
                            </div>
                            <div className="flex justify-between text-sm border-t border-border pt-3">
                              <span className="text-muted-foreground">Wallet after</span>
                              <span className="font-bold">₦{Math.max(0, balance - parseFloat(selectedPkg.price)).toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="outline" onClick={() => setSelectedPkg(null)} className="flex-1 rounded-xl" disabled={pkgLoading}>Cancel</Button>
                            <Button onClick={() => handleInvest(selectedPkg)} className="flex-1 bg-primary text-white rounded-xl" disabled={pkgLoading}>
                              {pkgLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span> : "Confirm"}
                            </Button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === "transactions" && (
                <motion.div key="transactions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-border">
                      <h3 className="font-semibold text-sm">Transaction History</h3>
                    </div>
                    {dashData?.recentTransactions?.length > 0 ? (
                      <div className="divide-y divide-border">
                        {dashData.recentTransactions.map((tx: any) => {
                          const isPositive = ["deposit", "daily_return", "referral_bonus", "trade_gain"].includes(tx.type);
                          return (
                            <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPositive ? "bg-green-50" : "bg-red-50"}`}>
                                  {isPositive ? <ArrowUpRight className="w-4 h-4 text-green-600" /> : <ArrowDownRight className="w-4 h-4 text-red-600" />}
                                </div>
                                <div>
                                  <div className="text-sm font-medium capitalize">{tx.type.replace(/_/g, " ")}</div>
                                  <div className="text-xs text-muted-foreground">{tx.description}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-semibold text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                  {isPositive ? "+" : "-"}₦{parseFloat(tx.amount).toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No transactions yet.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "referrals" && (
                <motion.div key="referrals" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-primary mb-1">{dashData?.referrals?.referred_users || 0}</div>
                      <div className="text-sm text-muted-foreground">Users Referred</div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">₦{parseFloat(dashData?.referrals?.earnings || 0).toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Total Commission</div>
                    </div>
                    <div className="bg-card border border-border rounded-2xl p-5 text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">5%</div>
                      <div className="text-sm text-muted-foreground">Commission Rate</div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h3 className="font-semibold text-sm mb-4">Your Referral Code</h3>
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                      <span className="font-mono text-2xl font-bold text-primary flex-1">{user?.referral_code}</span>
                      <button onClick={copyReferral} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${referralCopied ? "bg-green-100 text-green-700" : "bg-primary/10 text-primary hover:bg-primary/20"}`}>
                        {referralCopied ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Share this code with friends. You earn 5% commission when they purchase any investment package.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "fund" && (
                <motion.div key="fund" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-md mx-auto space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Fund Your Wallet</h3>
                      <p className="text-sm text-muted-foreground">Deposit Naira securely via Paystack</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Current Balance</div>
                      <div className="text-2xl font-bold text-primary">₦{balance.toLocaleString()}</div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount (₦)</label>
                      <input type="number" placeholder="Enter amount (min ₦100)"
                        value={fundAmount} onChange={e => setFundAmount(e.target.value)} min={100}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <div className="flex gap-2 flex-wrap">
                        {[1000, 2000, 5000, 10000, 20000, 50000].map(amt => (
                          <button key={amt} onClick={() => setFundAmount(String(amt))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${fundAmount === String(amt) ? "bg-primary text-white border-primary" : "bg-background border-border hover:border-primary text-muted-foreground"}`}>
                            ₦{amt.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Button onClick={handleFund} disabled={fundLoading || !fundAmount} className="w-full h-11 bg-primary text-white rounded-xl font-semibold hover:brightness-110">
                      {fundLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span> : "Pay with Paystack"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">Secured by Paystack. All transactions are encrypted.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === "withdraw" && (
                <motion.div key="withdraw" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="max-w-md mx-auto">
                  <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Withdraw Funds</h3>
                      <p className="text-sm text-muted-foreground">Minimum withdrawal: ₦10,000</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50">
                      <div className="text-xs text-muted-foreground mb-1">Available Balance</div>
                      <div className="text-2xl font-bold text-primary">₦{balance.toLocaleString()}</div>
                    </div>
                    {balance < 10000 && (
                      <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm flex gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        You need at least ₦10,000 to withdraw.
                      </div>
                    )}
                    <div className="space-y-3">
                      {[
                        { label: "Amount (₦)", key: "amount", type: "number", placeholder: "Min ₦10,000" },
                        { label: "Account Holder Name", key: "accountName", type: "text", placeholder: "Full name as on account" },
                        { label: "Account Number", key: "accountNumber", type: "text", placeholder: "10-digit account number" },
                        { label: "Bank Name", key: "bankName", type: "text", placeholder: "e.g. Zenith Bank" },
                        { label: "Bank Code", key: "bankCode", type: "text", placeholder: "e.g. 057" },
                      ].map(({ label, key, type, placeholder }) => (
                        <div key={key} className="space-y-1">
                          <label className="text-sm font-medium">{label}</label>
                          <input type={type} placeholder={placeholder}
                            value={(withdrawForm as any)[key]}
                            onChange={e => setWithdrawForm(f => ({ ...f, [key]: e.target.value }))}
                            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleWithdraw} disabled={withdrawLoading || balance < 10000} className="w-full h-11 bg-primary text-white rounded-xl font-semibold hover:brightness-110">
                      {withdrawLoading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing...</span> : "Request Withdrawal"}
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
