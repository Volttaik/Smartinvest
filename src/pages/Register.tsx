import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import SuccessOverlay from "@/components/SuccessOverlay";
import { Eye, EyeOff, ArrowRight, Check, Camera, TrendingUp, Shield, Zap, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { register as apiRegister } from "@/lib/api";

const steps = ["Account Info", "Security", "Photo", "Confirm"];

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

export default function Register() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    username: "", email: "", password: "", confirmPassword: "",
    referralCode: "", profilePicture: "",
  });
  const navigate = useNavigate();
  const auth = useAuth();

  const goNext = () => {
    setError("");
    setDir(1);
    setStep(s => s + 1);
  };
  const goBack = () => {
    setError("");
    setDir(-1);
    setStep(s => s - 1);
  };

  const nextStep = () => {
    setError("");
    if (step === 0) {
      if (!form.username || !form.email) { setError("Username and email are required."); return; }
      if (form.username.length < 3) { setError("Username must be at least 3 characters."); return; }
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(form.email)) { setError("Please enter a valid email address."); return; }
    }
    if (step === 1) {
      if (!form.password) { setError("Password is required."); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match."); return; }
    }
    goNext();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { setError("Photo must be under 3MB."); return; }
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPhotoPreview(result);
      setForm(f => ({ ...f, profilePicture: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!agreed) { setError("Please accept the Terms & Conditions to continue."); return; }
    setLoading(true);
    try {
      const data = await apiRegister({
        username: form.username,
        email: form.email,
        password: form.password,
        profilePicture: form.profilePicture || "default",
        referralCode: form.referralCode || undefined,
      });
      auth.login(data.token, data.user);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {success && (
          <SuccessOverlay message="Account Created!" subMessage="Welcome to SmartInvest. Taking you to your dashboard…"
            onDone={() => navigate("/dashboard")} />
        )}
      </AnimatePresence>

      <div className="min-h-screen flex pt-[103px]">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/6 -translate-x-1/3 translate-y-1/3" />
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
                  transition={{ delay: 0.4 + i * 0.1, ease: [0.22, 1, 0.36, 1] }} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm text-white/70">{label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">5% Referral Commission</div>
                <div className="text-xs text-white/50">Earn when friends invest</div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-background">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold text-foreground mb-1">Create Account</h1>
              <p className="text-muted-foreground text-sm">Step {step + 1} of {steps.length}: {steps[step]}</p>
            </div>

            <div className="flex gap-1.5 mb-8">
              {steps.map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: i <= step ? "100%" : "0%" }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm overflow-hidden"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={dir}>
              {step === 0 && (
                <motion.div key="step0" custom={dir} variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
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
                <motion.div key="step1" custom={dir} variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters"
                        value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                        className="h-11 rounded-xl pr-10" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
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
                  <AnimatePresence>
                    {form.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-1.5 overflow-hidden"
                      >
                        {[["At least 6 characters", form.password.length >= 6],
                          ["Passwords match", form.password === form.confirmPassword && form.confirmPassword.length > 0]].map(([label, ok]) => (
                          <div key={String(label)} className="flex items-center gap-2 text-xs">
                            <motion.div
                              animate={{ backgroundColor: ok ? "#22c55e" : "#e5e7eb" }}
                              transition={{ duration: 0.25 }}
                              className="w-4 h-4 rounded-full flex items-center justify-center"
                            >
                              {ok && <Check className="w-2.5 h-2.5 text-white" />}
                            </motion.div>
                            <span className={ok ? 'text-green-600' : 'text-muted-foreground'}>{String(label)}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <Button onClick={nextStep} className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <button onClick={goBack} className="w-full text-sm text-muted-foreground hover:text-foreground text-center transition-colors">← Back</button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" custom={dir} variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  <div>
                    <p className="text-sm text-muted-foreground mb-5">Upload a profile photo (optional — you can skip this step):</p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />

                    <div className="flex flex-col items-center gap-5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-32 h-32 rounded-full border-2 border-dashed border-border hover:border-primary transition-colors overflow-hidden bg-muted/40 flex items-center justify-center cursor-pointer group"
                      >
                        {photoPreview ? (
                          <>
                            <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                            <Camera className="w-8 h-8" />
                            <span className="text-xs font-medium">Upload photo</span>
                          </div>
                        )}
                      </motion.button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {photoPreview ? "Change photo" : "Choose from device"}
                        </button>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or WEBP · Max 3MB</p>
                      </div>

                      {photoPreview && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                        >
                          <img src={photoPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium">{form.username || "Your Name"}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-500" /> Photo ready
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setPhotoPreview(null); setForm(f => ({ ...f, profilePicture: "" })); }}
                            className="ml-auto text-xs text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            Remove
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <Button onClick={goNext} className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-xl">
                    {photoPreview ? "Continue" : "Skip for now"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <button onClick={goBack} className="w-full text-sm text-muted-foreground hover:text-foreground text-center transition-colors">← Back</button>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" custom={dir} variants={stepVariants}
                  initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                      <div className="text-sm font-semibold text-foreground mb-3">Account Summary</div>
                      <div className="flex items-center gap-3">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Profile" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-sm">{form.username}</div>
                          <div className="text-xs text-muted-foreground">{form.email}</div>
                        </div>
                      </div>
                      <div className="border-t border-border pt-3 space-y-1.5">
                        {[["Referral Code", form.referralCode || "None"],
                          ["Profile Photo", photoPreview ? "Uploaded" : "No photo (default)"]].map(([l, v]) => (
                          <div key={l} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{l}</span>
                            <span className={`font-medium ${v === "Uploaded" ? "text-green-600" : "text-foreground"}`}>{v}</span>
                          </div>
                        ))}
                      </div>
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
                    <button type="button" onClick={goBack}
                      className="w-full text-sm text-muted-foreground hover:text-foreground text-center transition-colors">← Back</button>
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
