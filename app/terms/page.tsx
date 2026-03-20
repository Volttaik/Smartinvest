'use client';

import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <>
      <TickerBar />
      <Navbar />
      <div className="min-h-screen bg-background pt-[103px]">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 2025</p>
          <div className="space-y-8 text-muted-foreground">
            {[
              { title: "Acceptance of Terms", body: "By creating an account on SmartInvest, you agree to these Terms and Conditions. If you do not agree, please do not use our platform." },
              { title: "Investment Risk Disclosure", body: "All investments carry risk. Daily returns are probabilistic and not guaranteed. You may receive less than your invested amount. Past performance does not guarantee future results. Only invest what you can afford to lose." },
              { title: "Account Responsibilities", body: "You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years old to use our platform. You agree to provide accurate and complete information." },
              { title: "Prohibited Activities", body: "You may not use our platform for money laundering, fraud, or any illegal activities. Multiple accounts per user are prohibited. Attempting to manipulate returns or exploit system vulnerabilities is strictly forbidden." },
              { title: "Withdrawal Policy", body: "Minimum withdrawal amount is ₦10,000. Withdrawals are processed via Paystack within 1-3 business days. We reserve the right to delay withdrawals pending verification." },
              { title: "Referral Program", body: "The referral program grants a 5% commission on investments made by referred users. Fraudulent referrals will result in account termination and forfeiture of earnings." },
              { title: "Limitation of Liability", body: "SmartInvest is not liable for investment losses, platform downtime, or third-party payment failures. Our maximum liability is limited to the fees paid by you in the preceding 30 days." },
              { title: "Changes to Terms", body: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms." },
            ].map(({ title, body }) => (
              <div key={title}>
                <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
                <p className="leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
