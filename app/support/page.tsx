'use client';

import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, Phone, Clock, HelpCircle } from "lucide-react";

export default function Support() {
  return (
    <>
      <TickerBar />
      <Navbar />
      <div className="min-h-screen bg-background pt-[103px]">
        <div className="container mx-auto px-6 py-16 max-w-4xl">
          <div className="mb-12">
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">Support Center</h1>
            <p className="text-muted-foreground text-lg">We are here to help. Reach out to us through any of the channels below.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: Mail, title: "Email Support", desc: "support@smartinvest.ng", sub: "Response within 24 hours" },
              { icon: MessageSquare, title: "Live Chat", desc: "Chat with our team", sub: "Available 9AM - 6PM WAT" },
              { icon: Phone, title: "Phone", desc: "+234 800 SMART INVEST", sub: "Mon-Fri 9AM - 5PM" },
            ].map(({ icon: Icon, title, desc, sub }) => (
              <div key={title} className="bg-card border border-border rounded-2xl p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                <p className="text-sm text-primary font-medium mb-1">{desc}</p>
                <p className="text-xs text-muted-foreground">{sub}</p>
              </div>
            ))}
          </div>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-primary" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                { q: "How do I get started?", a: "Create an account, fund your wallet, and choose an investment package that matches your goals." },
                { q: "When are returns credited?", a: "Daily returns are automatically credited to your wallet every 24 hours during the active investment period." },
                { q: "What is the minimum investment?", a: "Our Starter packages begin at ₦5,000, making investing accessible to everyone." },
                { q: "How does the referral program work?", a: "You earn a 5% commission on every investment made by users who signed up using your referral code." },
                { q: "How long does withdrawal take?", a: "Withdrawals are processed via Paystack and typically arrive within 1-3 business days. Minimum withdrawal is ₦10,000." },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-border pb-6 last:border-0 last:pb-0">
                  <h3 className="font-semibold text-foreground mb-2">{q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
