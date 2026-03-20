import { motion } from "framer-motion";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Information We Collect",
      content: `We collect information you provide directly to us when creating an account, including your username, email address, and password. We also collect profile preferences such as your chosen avatar. When you fund your wallet or withdraw funds, we collect transaction data, bank account details, and payment information processed through Paystack. We automatically collect usage data, IP addresses, browser type, and device information when you access our platform.`,
    },
    {
      title: "2. How We Use Your Information",
      content: `Your information is used to: provide and maintain your SmartInvest account; process investment transactions and calculate daily returns; process deposits and withdrawals via Paystack; send important account notifications; track and credit referral commissions; comply with legal obligations; and improve our platform. We do not sell, trade, or rent your personal information to third parties.`,
    },
    {
      title: "3. Data Security",
      content: `Your password is hashed using bcrypt encryption and is never stored in plain text. All API requests are authenticated using JSON Web Tokens (JWT). Sensitive payment data is handled by Paystack and is not stored on our servers. We use HTTPS encryption for all data in transit. Our database is secured with restricted access controls and regular security audits.`,
    },
    {
      title: "4. Paystack Integration",
      content: `We use Paystack to process all financial transactions. When you make a deposit or withdrawal, your payment information is processed directly by Paystack and is subject to their privacy policy (paystack.com/privacy). SmartInvest only stores transaction references and amounts — your card details or bank account numbers are handled securely by Paystack.`,
    },
    {
      title: "5. Referral Data",
      content: `If you use a referral code during registration, we track the relationship between you and the referring user to credit referral commissions. Referral commission records are stored in our database and visible to both parties. Referred users' investment activities that trigger commissions are logged for transparency.`,
    },
    {
      title: "6. Data Retention",
      content: `We retain your account data for as long as your account is active. Transaction records and investment history are retained indefinitely for audit and compliance purposes. If you request account deletion, we will delete your personal profile data but retain anonymized transaction records as required by financial regulations.`,
    },
    {
      title: "7. Cookies",
      content: `SmartInvest uses browser local storage to maintain your login session via JWT tokens. We do not use third-party tracking cookies. Your session token expires after 7 days and you must log in again.`,
    },
    {
      title: "8. Your Rights",
      content: `You have the right to: access your personal data at any time through your dashboard; request correction of inaccurate information; request deletion of your account and personal data; withdraw consent for data processing; and lodge a complaint with relevant data protection authorities.`,
    },
    {
      title: "9. Changes to This Policy",
      content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on our platform. Your continued use of SmartInvest after changes constitutes acceptance of the updated policy.`,
    },
    {
      title: "10. Contact Us",
      content: `If you have questions about this Privacy Policy or how we handle your data, please contact us at privacy@smartinvest.ng or through our Support page.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-[103px]">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-widest mb-6">
            Legal
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground mb-2">Effective Date: January 1, 2025</p>
          <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
            This Privacy Policy describes how SmartInvest (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Platform&rdquo;) collects, uses, and protects your personal information when you use our services.
          </p>

          <div className="space-y-8">
            {sections.map(({ title, content }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
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
