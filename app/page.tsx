import TickerBar from "@/components/TickerBar";
import Navbar from "@/components/Navbar";
import PageLoader from "@/components/PageLoader";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import HowItWorks from "@/components/HowItWorks";
import Services from "@/components/Services";
import Performance from "@/components/Performance";
import AIAgents from "@/components/AIAgents";
import Pricing from "@/components/Pricing";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-[103px]">
      <TickerBar />
      <Navbar />
      <PageLoader />
      <Hero />
      <Stats />
      <HowItWorks />
      <Services />
      <Performance />
      <AIAgents />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
