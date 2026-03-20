import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function Terms() {
  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By creating an account or using SmartInvest, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use our platform. These terms are effective from January 1, 2025.`,
    },
    {
      title: "2. Investment Risk Disclosure",
      content: `IMPORTANT: All investments on SmartInvest carry risk. Our internal trading simulation is probabilistic in nature — there is approximately a 50% chance of gains and 40% chance of losses in each trading cycle. You may lose some or all of your invested capital. Daily returns are not guaranteed. Past performance does not guarantee future results. Invest only what you can afford to lose. SmartInvest is not liable for any financial losses incurred through our platform.`,
    },
    {
      title: "3. Investment Packages",
      content: `SmartInvest offers 30 investment packages ranging from ₦5,000 to ₦25,000. When you purchase a package, the amount is deducted from your wallet immediately. Daily returns are credited automatically based on the package's stated return percentage. Returns may be affected by internal trade outcomes (gains or losses). Packages run for a fixed duration after which they are marked complete.`,
    },
    {
      title: "4. Internal Trading Simulation",
      content: `SmartInvest operates an internal trading simulation to generate investment returns. Trades are conducted using platform-owned assets and strategies. Trade outcomes are probabilistic: approximately 50% of trade cycles result in gains, 40% result in losses, and 10% are neutral. Users' balances may fluctuate based on trade results in addition to regular daily returns. All trade records are logged and visible in your dashboard.`,
    },
    {
      title: "5. Wallet Funding",
      content: `Users may fund their wallets via Paystack using supported payment methods. Minimum deposit is ₦100. All deposits are processed by Paystack and subject to their terms. Fraudulent or unauthorized transactions must be reported immediately. SmartInvest reserves the right to freeze accounts suspected of fraudulent activity.`,
    },
    {
      title: "6. Withdrawal Policy",
      content: `Users may request withdrawals once their account balance reaches ₦10,000 (minimum). Withdrawals are processed via Paystack bank transfer to your registered bank account. Processing may take 1-3 business days. Users are responsible for providing accurate bank account information. SmartInvest is not liable for delays caused by incorrect bank details. Withdrawal fees, if any, will be disclosed at the time of request.`,
    },
    {
      title: "7. Referral Program",
      content: `SmartInvest offers a referral program where registered users earn 5% commission when a referred user purchases an investment package. Referral commissions are credited to the referrer's wallet automatically. Referral codes may not be used for self-referrals. Fraudulent referral activity will result in account suspension and forfeiture of commissions. SmartInvest reserves the right to modify or terminate the referral program at any time.`,
    },
    {
      title: "8. Account Registration & Security",
      content: `You must provide accurate and complete information during registration. You are responsible for maintaining the security of your account password. Do not share your login credentials. CAPTCHA verification is required for login and registration to prevent automated attacks. SmartInvest will never ask for your password via email or chat.`,
    },
    {
      title: "9. Prohibited Activities",
      content: `Users are prohibited from: creating multiple accounts for fraudulent purposes; attempting to manipulate the platform's trading system; using automated bots for any platform interaction; money laundering or any illegal financial activities; harassing other users or SmartInvest staff; attempting to hack or breach platform security. Violations will result in immediate account suspension.`,
    },
    {
      title: "10. Limitation of Liability",
      content: `SmartInvest, its directors, employees, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from: investment losses; technical issues or downtime; unauthorized account access; changes to investment package terms; or any other platform-related matters. Our total liability shall not exceed the amount deposited in your wallet in the 30 days prior to the claim.`,
    },
    {
      title: "11. Termination",
      content: `SmartInvest reserves the right to suspend or terminate your account at any time for violation of these terms, suspicious activity, or at our sole discretion. You may request account closure at any time by contacting support. Upon termination, you may request withdrawal of your remaining balance subject to our withdrawal policy.`,
    },
    {
      title: "12. Modifications",
      content: `SmartInvest reserves the right to modify these Terms at any time. Changes will be communicated via email and platform notifications. Continued use after changes constitutes acceptance of new terms.`,
    },
    {
      title: "13. Governing Law",
      content: `These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through arbitration in Lagos, Nigeria.`,
    },
    {
      title: "14. Contact",
      content: `For questions about these Terms, contact us at legal@smartinvest.ng or through our Support page.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-[103px]">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
            Legal
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Terms & Conditions</h1>
          <p className="text-muted-foreground mb-2">Effective Date: January 1, 2025</p>
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm mb-10 leading-relaxed">
            <strong>Risk Warning:</strong> Investing on SmartInvest carries significant risk. You may lose some or all of your capital. Returns are probabilistic and not guaranteed. Only invest what you can afford to lose.
          </div>

          <div className="space-y-8">
            {sections.map(({ title, content }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <h2 className="font-display text-lg font-bold text-foreground mb-3">{title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{content}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
