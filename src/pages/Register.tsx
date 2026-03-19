import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SuccessOverlay from "@/components/SuccessOverlay";
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = ["Personal Info", "Security", "Confirm"];

const perks = [
  "No minimum investment to start",
  "Dedicated portfolio advisor",
  "Real-time performance dashboard",
  "Bank-level security",
];

export default function Register() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "",
    password: "", confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) { setStep(step + 1); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  return (
    <>
      <AnimatePresence>
        {success && (
          <SuccessOverlay
            message="Account created!"
            subMessage="Welcome to Smart Invest. Setting up your portfolio…"
            onDone={() => navigate("/dashboard")}
            delay={2800}
          />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex pt-[103px]">
        {/* Left Panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex lg:w-5/12 bg-foreground text-primary-foreground flex-col justify-between p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary/10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-primary/8 -translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-display text-4xl font-bold mb-5 leading-tight text-white">
                Start Building<br />
                <span className="text-primary">Real Wealth</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed max-w-sm mb-8">
                Join thousands of investors who've taken control of their financial future with professional-grade tools.
              </p>
              <div className="space-y-3">
                {perks.map((perk, i) => (
                  <motion.div
                    key={perk}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-white/70">{perk}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-primary/30 flex items-center justify-center text-sm font-bold text-white">JM</div>
              <div>
                <div className="text-sm font-semibold text-white">Jessica Martin</div>
                <div className="text-xs text-white/50">Joined 3 months ago</div>
              </div>
            </div>
            <p className="text-xs text-white/60 leading-relaxed italic">
              "Signing up took under 2 minutes. Within a week I had a fully managed portfolio earning returns I'd never seen before."
            </p>
          </motion.div>
        </motion.div>

        {/* Right Panel */}
        <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md py-8"
            >
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <motion.div
                      animate={i === step ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all duration-300 ${
                        i < step
                          ? "bg-primary text-primary-foreground"
                          : i === step
                          ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {i < step ? "✓" : i + 1}
                    </motion.div>
                    <span className={`text-xs font-medium hidden sm:block transition-colors ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                    {i < steps.length - 1 && (
                      <div className={`h-px w-6 sm:w-10 transition-colors duration-500 ${i < step ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                ))}
              </div>

              <div className="mb-7">
                <h1 className="font-display text-3xl font-bold text-foreground mb-1.5">
                  {step === 0 ? "Create your account" : step === 1 ? "Secure your account" : "You're almost in"}
                </h1>
                <p className="text-muted-foreground text-sm">
                  {step === 0 ? "Tell us a bit about yourself" : step === 1 ? "Choose a strong password" : "Review and confirm your details"}
                </p>
              </div>

              <form onSubmit={handleNext} className="space-y-5">
                {step === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-sm font-medium">First name</Label>
                        <Input id="firstName" placeholder="John" value={form.firstName}
                          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                          className="h-11 rounded-xl focus-visible:ring-primary" required />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last name</Label>
                        <Input id="lastName" placeholder="Doe" value={form.lastName}
                          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                          className="h-11 rounded-xl focus-visible:ring-primary" required />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                      <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="h-11 rounded-xl focus-visible:ring-primary" required />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min. 8 characters"
                          value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                          className="h-11 rounded-xl focus-visible:ring-primary pr-11" required />
                        <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map(i => (
                          <motion.div key={i}
                            animate={{ backgroundColor: form.password.length >= i * 2 ? "hsl(var(--primary))" : "hsl(var(--muted))" }}
                            transition={{ duration: 0.3 }}
                            className="h-1 flex-1 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirm" className="text-sm font-medium">Confirm password</Label>
                      <Input id="confirm" type="password" placeholder="Repeat your password"
                        value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                        className="h-11 rounded-xl focus-visible:ring-primary" required />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="bg-muted/50 border border-border rounded-xl p-5 space-y-3">
                      {[
                        { label: "Full Name", value: `${form.firstName} ${form.lastName}` },
                        { label: "Email", value: form.email || "—" },
                        { label: "Password", value: "••••••••" },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{label}</span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </Label>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={loading || (step === 2 && !agreed)}
                  className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:brightness-110 transition-all mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </span>
                  ) : step < 2 ? (
                    <span className="flex items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></span>
                  ) : (
                    <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                  )}
                </Button>
              </form>

              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center">
                  ← Back
                </button>
              )}

              <p className="text-center text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
