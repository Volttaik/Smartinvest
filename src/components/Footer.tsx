'use client';

import { TrendingUp } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  Company: [
    { label: "About Us",  href: "#about" },
    { label: "Support",   href: "/support" },
    { label: "FAQ",       href: "/support" },
  ],
  Services: [
    { label: "Investment Packages", href: "/#pricing" },
    { label: "Referral Program",    href: "/dashboard" },
    { label: "Fund Wallet",         href: "/dashboard" },
    { label: "Withdrawals",         href: "/dashboard" },
  ],
  Account: [
    { label: "Sign Up",    href: "/register" },
    { label: "Sign In",    href: "/login" },
    { label: "Dashboard",  href: "/dashboard" },
  ],
  Legal: [
    { label: "Privacy Policy",    href: "/privacy" },
    { label: "Terms & Conditions",href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold font-display text-base text-foreground">SmartInvest</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[190px]">
              AI-powered investment platform operating in Naira. All transactions secured by Paystack.
            </p>
          </div>

          {Object.entries(footerLinks).map(([cat, links]) => (
            <div key={cat}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/60 mb-4">{cat}</div>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SmartInvest. All rights reserved.</p>
          <p className="text-xs text-muted-foreground text-center">
            Investment involves risk. Returns are probabilistic and not guaranteed.
          </p>
        </div>
      </div>
    </footer>
  );
}
