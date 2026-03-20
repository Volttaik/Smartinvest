'use client';

import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <TickerBar />
      <Navbar />
      <div className="min-h-screen bg-background pt-[103px]">
        <div className="container mx-auto px-6 py-16 max-w-3xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-10">Last updated: January 2025</p>
          <div className="prose prose-sm max-w-none space-y-8 text-muted-foreground">
            {[
              { title: "Information We Collect", body: "We collect information you provide directly to us, including name, email address, username, and financial transaction data. We also collect usage information automatically when you use our platform." },
              { title: "How We Use Your Information", body: "We use your information to provide and improve our services, process transactions, send notifications about your investments, and comply with legal obligations." },
              { title: "Information Sharing", body: "We do not sell your personal information. We share information only with payment processors (Paystack) to process transactions and with legal authorities when required by law." },
              { title: "Data Security", body: "We implement industry-standard security measures including encryption, secure servers, and regular security audits to protect your personal information." },
              { title: "Your Rights", body: "You have the right to access, correct, or delete your personal information. Contact our support team to exercise these rights." },
              { title: "Contact Us", body: "For privacy-related questions, contact us at privacy@smartinvest.ng." },
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
