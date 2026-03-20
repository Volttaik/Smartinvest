'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, TrendingUp, ArrowLeft, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

function ProfileAvatar({ src, size = "sm" }: { src?: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-6 h-6" : "w-9 h-9";
  if (src && src.startsWith("data:image/")) {
    return <img src={src} alt="Profile" className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0`}>
      <User className={size === "sm" ? "w-3 h-3 text-primary" : "w-4 h-4 text-primary"} />
    </div>
  );
}

const links = [
  { label: "Home", href: "/" },
  { label: "Packages", href: "/#pricing" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Support", href: "/support" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isAuthPage = ["/login", "/register"].includes(pathname);
  const isLegalPage = ["/support", "/privacy", "/terms"].includes(pathname);
  const isSpecialPage = isAuthPage || isLegalPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-[38px] left-0 right-0 z-40 transition-all duration-300 ${
        scrolled || isSpecialPage
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:brightness-110 transition-all">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight font-display text-foreground">
            Smart Invest<span className="text-primary">.</span>
          </span>
        </Link>

        {isAuthPage ? (
          <div className="flex items-center gap-4">
            <Link href="/" className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <div className="flex items-center gap-2">
              {pathname === "/login" ? (
                <Button size="sm" className="bg-primary text-primary-foreground font-semibold px-5 rounded-lg hover:brightness-110" asChild>
                  <Link href="/register">Create Account</Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login" className="text-sm font-medium">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-7">
              {links.map(({ label, href }) => (
                href.startsWith("/") && !href.includes("#") ? (
                  <Link key={label} href={href}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors relative group/link">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover/link:w-full" />
                  </Link>
                ) : (
                  <a key={label} href={href}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors relative group/link">
                    {label}
                    <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-primary transition-all duration-200 group-hover/link:w-full" />
                  </a>
                )
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <ProfileAvatar src={user?.profile_picture} size="sm" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleLogout} className="rounded-lg text-sm">
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login" className="text-sm font-medium">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-primary text-primary-foreground font-semibold px-5 rounded-lg shadow-sm hover:brightness-110" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            <button className="md:hidden text-foreground p-1" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>

      <AnimatePresence>
        {menuOpen && !isAuthPage && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="md:hidden bg-background border-b border-border overflow-hidden">
            <div className="container mx-auto px-6 py-5 flex flex-col gap-4">
              {links.map(({ label, href }) => (
                href.startsWith("/") && !href.includes("#") ? (
                  <Link key={label} href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                    onClick={() => setMenuOpen(false)}>{label}</Link>
                ) : (
                  <a key={label} href={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                    onClick={() => setMenuOpen(false)}>{label}</a>
                )
              ))}
              <div className="flex gap-3 pt-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                        <ProfileAvatar src={user?.profile_picture} size="sm" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground" asChild>
                      <Link href="/register" onClick={() => setMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
