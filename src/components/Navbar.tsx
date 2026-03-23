'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, User, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";

function ProfileAvatar({ src, size = "sm" }: { src?: string; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "w-6 h-6" : "w-9 h-9";
  if (src && src.startsWith("data:image/")) {
    return <img src={src} alt="Profile" className={`${dim} rounded-full object-cover flex-shrink-0`} />;
  }
  return (
    <div className={`${dim} rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0`}>
      <User className={size === "sm" ? "w-3 h-3 text-primary" : "w-4 h-4 text-primary"} />
    </div>
  );
}

const links = [
  { label: "Home",        href: "/" },
  { label: "Packages",    href: "/#pricing" },
  { label: "How It Works",href: "/#about" },
  { label: "Support",     href: "/support" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isAuthPage  = ["/login", "/register"].includes(pathname ?? "");
  const isLegalPage = ["/support", "/privacy", "/terms"].includes(pathname ?? "");
  const isSpecialPage = isAuthPage || isLegalPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => { logout(); router.push("/"); };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
      <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm group-hover:bg-primary/90 transition-colors flex-shrink-0">
        <TrendingUp className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-base font-bold tracking-tight font-display text-foreground">
        SmartInvest
      </span>
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-[38px] left-0 right-0 z-40 transition-all duration-200 ${
        scrolled || isSpecialPage || menuOpen
          ? "bg-background/98 backdrop-blur-lg border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 h-14 flex items-center justify-between">
        <Logo />

        {isAuthPage ? (
          <div className="flex items-center gap-4">
            <Link href="/"
              className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Home
            </Link>
            {pathname === "/login" ? (
              <Button size="sm" className="bg-primary text-white font-medium px-4 h-8 text-xs rounded-lg hover:bg-primary/90" asChild>
                <Link href="/register">Create Account</Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop links */}
            <nav className="hidden md:flex items-center gap-6">
              {links.map(({ label, href }) => (
                href.startsWith("/") && !href.includes("#") ? (
                  <Link key={label} href={href}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors">
                    {label}
                  </a>
                )
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="h-8 text-xs gap-2" asChild>
                    <Link href="/dashboard">
                      <ProfileAvatar src={user?.profile_picture} size="sm" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleLogout} className="h-8 text-xs rounded-lg border-border">
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="h-8 text-xs bg-primary text-white font-medium px-4 rounded-lg hover:bg-primary/90" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              whileTap={{ scale: 0.93 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span key="close"
                    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.12 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="open"
                    initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.12 }}>
                    <Menu className="w-5 h-5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && !isAuthPage && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-0.5">
              {links.map(({ label, href }) => (
                href.startsWith("/") && !href.includes("#") ? (
                  <Link key={label} href={href}
                    className="block py-2.5 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    onClick={() => setMenuOpen(false)}>
                    {label}
                  </Link>
                ) : (
                  <a key={label} href={href}
                    className="block py-2.5 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    onClick={() => setMenuOpen(false)}>
                    {label}
                  </a>
                )
              ))}

              <div className="flex gap-2.5 pt-3 mt-2 border-t border-border">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 gap-2 h-9 text-xs" asChild>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                        <ProfileAvatar src={user?.profile_picture} size="sm" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 h-9 text-xs bg-primary text-white"
                      onClick={() => { handleLogout(); setMenuOpen(false); }}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 h-9 text-xs" asChild>
                      <Link href="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button size="sm" className="flex-1 h-9 text-xs bg-primary text-white" asChild>
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
