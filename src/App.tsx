import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import TickerBar from "@/components/TickerBar";
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
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";

// Shared header shown on landing + auth pages (not dashboard)
function PublicHeader() {
  return (
    <>
      <TickerBar />
      <Navbar />
    </>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground pt-[103px]">
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

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <PublicHeader />
              <HomePage />
            </>
          }
        />
        <Route
          path="/login"
          element={
            <>
              <PublicHeader />
              <Login />
            </>
          }
        />
        <Route
          path="/register"
          element={
            <>
              <PublicHeader />
              <Register />
            </>
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
