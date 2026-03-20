import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Mail, Phone, ChevronDown, ChevronUp, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/Footer";

const faqs = [
  { q: "How do I fund my wallet?", a: "Go to your dashboard, click 'Fund Wallet', enter your desired amount, and pay securely via Paystack using card, bank transfer, or USSD." },
  { q: "When are daily returns credited?", a: "Daily returns are automatically calculated and credited to your wallet every 6 hours based on your active investment packages." },
  { q: "What is the minimum withdrawal?", a: "The minimum withdrawal amount is ₦10,000. Withdrawals are processed via Paystack to your registered bank account." },
  { q: "How does the referral program work?", a: "Each user gets a unique referral code. When someone signs up with your code and purchases an investment package, you instantly earn 5% commission." },
  { q: "Can I lose money on investments?", a: "Yes. Our internal trading simulation is probabilistic — there is a 50% chance of gains and 40% chance of losses per trade cycle. Please invest responsibly." },
  { q: "How secure is my data?", a: "Your password is hashed using bcrypt, all API endpoints are authenticated with JWT tokens, and sensitive data is stored securely. We never share your information with third parties." },
  { q: "How long does a withdrawal take?", a: "Withdrawals are processed via Paystack bank transfer and typically take 1-3 business days to reflect in your account." },
  { q: "What happens when my investment completes?", a: "When your investment duration ends, the investment is marked complete. All your earned returns remain in your wallet balance." },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background pt-[103px]">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-5">
            Support
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">How Can We Help?</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Our team is here to support your investment journey. Find answers below or reach out directly.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {[
            { icon: Mail, title: "Email Support", desc: "support@smartinvest.ng", sub: "Response within 24 hours" },
            { icon: MessageCircle, title: "Live Chat", desc: "Available 9am–6pm WAT", sub: "Mon–Fri" },
            { icon: Phone, title: "Phone", desc: "+234 800 INVEST", sub: "Business hours only" },
          ].map(({ icon: Icon, title, desc, sub }) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="border border-border rounded-2xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors">
                    <span className="font-medium text-sm text-foreground pr-4">{faq.q}</span>
                    {openFaq === i ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                  </button>
                  {openFaq === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                      {faq.a}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Send a Message</h2>
            {submitted ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center p-10 rounded-2xl bg-green-50 border border-green-200">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <h3 className="font-semibold text-lg text-green-800 mb-2">Message Sent!</h3>
                <p className="text-sm text-green-700">We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-sm text-primary hover:underline">Send another message</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Name</Label>
                    <Input placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className="rounded-xl" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required className="rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Subject</Label>
                  <Input placeholder="What's this about?" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} required className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label>Message</Label>
                  <textarea placeholder="Describe your issue in detail..." value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary text-white rounded-xl font-semibold hover:brightness-110">
                  Send Message <Send className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
