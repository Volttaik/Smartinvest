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
import { Eye, EyeOff, ArrowRight, BarChart3, Shield, Globe2 } from "lucide-react";
import { useAuth } from "@/app/providers";

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
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-1/2 bg-foreground text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/8 -translate-x-1/3 translate-y-1/3" />
          <div className="relative z-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <h2 className="font-display text-4xl font-bold mb-5 leading-tight text-white">
                Your Portfolio,<br /><span className="text-primary">Always Working</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed max-w-sm mb-10">
                Access real-time performance, manage your investments, and track your wealth growth — all in one place.
              </p>
              <div className="space-y-4">
                {[{ icon: BarChart3, label: "Real-time portfolio analytics" },
                  { icon: Shield, label: "Bank-grade security & encryption" },
                  { icon: Globe2, label: "Access from anywhere, anytime" }].map(({ icon: Icon, label }, i) => (
                  <motion.div key={label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-white/70">{label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="relative z-10 grid grid-cols-3 gap-4">
            {[["₦850K+", "Assets Managed"], ["18.4%", "Avg. Annual Return"], ["12K+", "Active Investors"]].map(([v, l]) => (
              <div key={l} className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{v}</div>
                <div className="text-xs text-white/50">{l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">Sign in</h1>
              <p className="text-muted-foreground text-sm">Access your SmartInvest dashboard</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="h-11 rounded-xl" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="h-11 rounded-xl pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:brightness-110 transition-all">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Sign In <ArrowRight className="w-4 h-4" /></span>
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-semibold hover:underline">Create one</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
