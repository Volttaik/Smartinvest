import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SuccessOverlay from "@/components/SuccessOverlay";
import { Eye, EyeOff, ArrowRight, Check, RefreshCw, User, TrendingUp, Shield, Zap } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { register as apiRegister, getCaptcha } from "@/lib/api";

const AVATARS = [
  { id: "avatar1", bg: "bg-red-500", label: "R" },
  { id: "avatar2", bg: "bg-blue-500", label: "B" },
  { id: "avatar3", bg: "bg-green-500", label: "G" },
  { id: "avatar4", bg: "bg-purple-500", label: "P" },
  { id: "avatar5", bg: "bg-orange-500", label: "O" },
  { id: "avatar6", bg: "bg-teal-500", label: "T" },
  { id: "avatar7", bg: "bg-pink-500", label: "K" },
  { id: "avatar8", bg: "bg-indigo-500", label: "I" },
];

const AVATARS_ICONS = ["💼", "🚀", "📈", "💎", "⚡", "🌟", "👑", "🛡️"];

const steps = ["Account Info", "Security", "Avatar", "Confirm"];

export default function Register() {
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [captcha, setCaptcha] = useState<{ sessionKey: string; code: string } | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    referralCode: "", profilePicture: "avatar1", captchaInput: "",
  });
  const navigate = useNavigate();
  const auth = useAuth();

  const fetchCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      const data = await getCaptcha();
      setCaptcha(data);
      setForm(f => ({ ...f, captchaInput: "" }));
    } catch {
      setError("Failed to load verification code.");
    } finally {
      setCaptchaLoading(false);
    }
  };

  useEffect(() => { fetchCaptcha(); }, []);

  const nextStep = () => {
    setError("");
    if (step === 0) {
      if (!form.username || !form.email) { setError("Username and email are required."); return; }
      if (form.username.length < 3) { setError("Username must be at least 3 characters."); return; }
    }
    if (step === 1) {
      if (!form.password) { setError("Password is required."); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    }
    if (step === 2) {
      if (!form.profilePicture) { setError("Please choose an avatar."); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreed) { setError("Please accept the Terms & Conditions to continue."); return; }
    if (!captcha) { setError("Please wait for the verification code."); return; }
    setLoading(true);
    try {
      const data = await apiRegister({
        username: form.username,
        email: form.email,
        password: form.password,
        profilePicture: form.profilePicture,
        referralCode: form.referralCode || undefined,
        captchaKey: captcha.sessionKey,
        captchaCode: form.captchaInput,
      });
      auth.login(data.token, data.user);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const selectedAvatar = AVATARS.find(a => a.id === form.profilePicture)!;

  return (
    <>
      <AnimatePresence>
        {success && (
          <SuccessOverlay message="Account Created!" subMessage="Welcome to SmartInvest. Taking you to your dashboard…"
            onDone={() => navigate("/dashboard")} />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex pt-[103px]">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 translate-x-1/3 -translate-y-1/3" />
          <div className="relative z-10 pt-4">
            <h2 className="font-display text-4xl font-bold mb-5 leading-tight text-white">
              Start Building<br /><span className="text-primary">Real Wealth</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed max-w-sm mb-10">
              Join thousands of smart investors growing their wealth with AI-driven investment strategies.
            </p>
            <div className="space-y-4">
              {[{ icon: TrendingUp, label: "30 investment packages from ₦5,000" },
                { icon: Shield, label: "Secure & insured investments" },
                { icon: Zap, label: "Daily returns credited automatically" }].map(({ icon: Icon, label }, i) => (
                <motion.div key={label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-white/70">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="relative z-10">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-primary/30 flex items-center justify-center text-xl">📈</div>
              <div>
                <div className="text-sm font-semibold text-white">5% Referral Commission</div>
                <div className="text-xs text-white/50">Earn when friends invest</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="w-full max-w-md">

            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">Create Account</h1>
              <p className="text-muted-foreground text-sm">Step {step + 1} of {steps.length}: {steps[step]}</p>
            </div>

            <div className="flex gap-1.5 mb-8">
              {steps.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Username</Label>
                    <Input placeholder="johndoe" value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g, '') }))}
                      className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Email address</Label>
                    <Input type="email" placeholder="you@example.com" value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Referral Code <span className="text-muted-foreground font-normal">(optional)</span></Label>
                    <Input placeholder="Enter referral code if you have one" value={form.referralCode}
                      onChange={e => setForm(f => ({ ...f, referralCode: e.target.value.toUpperCase() }))}
                      className="h-11 rounded-xl" />
                  </div>
                  <Button onClick={nextStep} className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="h-11 rounded-xl pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Confirm Password</Label>
                    <Input type="password" placeholder="Re-enter your password"
                      value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      className="h-11 rounded-xl" />
                  </div>
                  {form.password && (
                    <div className="space-y-1.5">
                      {[["At least 6 characters", form.password.length >= 6],
                        ["Passwords match", form.password === form.confirmPassword && form.confirmPassword.length > 0]].map(([label, ok]) => (
                        <div key={String(label)} className="flex items-center gap-2 text-xs">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? 'bg-green-500' : 'bg-muted'}`}>
                            {ok && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <span className={ok ? 'text-green-600' : 'text-muted-foreground'}>{String(label)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <Button onClick={nextStep} className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <button onClick={() => setStep(0)} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">← Back</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <p className="text-sm text-muted-foreground mb-4">Choose a profile avatar that represents you:</p>
                    <div className="grid grid-cols-4 gap-3">
                      {AVATARS.map((av, idx) => (
                        <button key={av.id} type="button" onClick={() => setForm(f => ({ ...f, profilePicture: av.id }))}
                          className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${form.profilePicture === av.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                          <div className={`w-12 h-12 rounded-full ${av.bg} flex items-center justify-center text-2xl`}>
                            {AVATARS_ICONS[idx]}
                          </div>
                          {form.profilePicture === av.id && (
                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  {form.profilePicture && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <div className={`w-10 h-10 rounded-full ${selectedAvatar?.bg} flex items-center justify-center text-xl`}>
                        {AVATARS_ICONS[AVATARS.findIndex(a => a.id === form.profilePicture)]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{form.username || 'Your Name'}</div>
                        <div className="text-xs text-muted-foreground">This is how you'll appear</div>
                      </div>
                    </div>
                  )}
                  <Button onClick={nextStep} className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <button onClick={() => setStep(1)} className="w-full text-sm text-muted-foreground hover:text-foreground text-center">← Back</button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
                      <div className="text-sm font-semibold text-foreground mb-2">Account Summary</div>
                      {[["Username", form.username], ["Email", form.email],
                        ["Avatar", `${AVATARS_ICONS[AVATARS.findIndex(a => a.id === form.profilePicture)]} ${form.profilePicture}`],
                        ["Referral Code", form.referralCode || "None"]].map(([l, v]) => (
                        <div key={l} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{l}</span>
                          <span className="font-medium text-foreground">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Security Verification</Label>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border">
                        <div className="flex-1">
                          {captchaLoading ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                              Loading...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Enter code:</span>
                              <span className="font-mono text-2xl font-bold tracking-[0.4em] text-primary select-none">{captcha?.code}</span>
                            </div>
                          )}
                        </div>
                        <button type="button" onClick={fetchCaptcha} disabled={captchaLoading}
                          className="text-muted-foreground hover:text-primary transition-colors">
                          <RefreshCw className={`w-4 h-4 ${captchaLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>
                      <Input placeholder="Type the 4-digit code shown above"
                        value={form.captchaInput}
                        onChange={e => setForm(f => ({ ...f, captchaInput: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                        maxLength={4} className="h-11 rounded-xl font-mono text-center text-lg tracking-[0.5em]" required />
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox id="terms" checked={agreed} onCheckedChange={v => setAgreed(!!v)} className="mt-0.5" />
                      <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <Link to="/terms" className="text-primary hover:underline" target="_blank">Terms & Conditions</Link> and{" "}
                        <Link to="/privacy" className="text-primary hover:underline" target="_blank">Privacy Policy</Link>.
                        I understand investments carry risk and returns are probabilistic.
                      </Label>
                    </div>

                    <Button type="submit" disabled={loading || !agreed}
                      className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:brightness-110 transition-all">
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></span>
                      )}
                    </Button>
                    <button type="button" onClick={() => setStep(2)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground text-center">← Back</button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
