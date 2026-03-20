'use client';

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SuccessOverlay from "@/components/SuccessOverlay";
import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import { Eye, EyeOff, ArrowRight, BarChart3, Shield, Globe2, TrendingUp } from "lucide-react";
import { useAuth } from "@/app/providers";

const features = [
  { icon: BarChart3, label: "Real-time portfolio analytics" },
  { icon: Shield,    label: "Bank-grade security & encryption" },
  { icon: Globe2,    label: "Access from anywhere, anytime" },
];

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });
  const router = useRouter();
  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      auth.login(data.token, data.user);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {success && (
          <SuccessOverlay message="Welcome back!" subMessage="Taking you to your dashboard…"
            onDone={() => router.push("/dashboard")} />
        )}
      </AnimatePresence>

      <TickerBar />
      <Navbar />

      <div className="min-h-screen flex pt-[103px]">

        {/* Left panel — brand */}
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden">

          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary/8 translate-x-1/3 -translate-y-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/6 -translate-x-1/3 translate-y-1/3 blur-2xl" />

          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}>
              <h2 className="font-display text-4xl font-bold mb-4 leading-tight text-white">
                Your Portfolio,<br /><span className="text-primary">Always Working</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-sm mb-8">
                Real-time analytics, AI-driven insights, and institutional-grade strategies — all in one dashboard.
              </p>
              <div className="space-y-3.5 mb-8">
                {features.map(({ icon: Icon, label }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-white/70">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Financial illustration */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.7 }}>
              <img src="/hero-finance.png" alt="Investment analytics"
                className="w-full max-w-xs mx-auto drop-shadow-2xl opacity-90" />
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }} className="relative z-10 grid grid-cols-3 gap-4 pt-8 border-t border-white/10">
            {[["₦850K+", "Assets Managed"], ["18.4%", "Avg. Return"], ["12K+", "Investors"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-xl font-bold text-white mb-0.5">{v}</div>
                <div className="text-[11px] text-white/40">{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right panel — form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md">

            {/* Mobile brand header */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Smart<span className="text-primary">Invest</span>
              </span>
            </div>

            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted-foreground text-sm">Sign in to access your investment dashboard</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                  <Shield className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="h-11 rounded-xl border-border focus-visible:ring-primary/30 transition-all" required />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="h-11 rounded-xl pr-11 border-border focus-visible:ring-primary/30 transition-all" required />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">Create one free</Link>
            </p>

            <p className="text-center text-[11px] text-muted-foreground/60 mt-8">
              Protected by 256-bit SSL encryption
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
