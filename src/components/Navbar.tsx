'use client';

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
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

const menuVariants = {
  closed: {
    clipPath: "inset(0 0 100% 0 round 0px)",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
  open: {
    clipPath: "inset(0 0 0% 0 round 0px)",
    opacity: 1,
    transition: { duration: 0.28, ease: [0, 0, 0.2, 1] },
  },
};

const itemVariants = {
  closed: { opacity: 0, y: -6 },
  open: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.22, ease: [0, 0, 0.2, 1] },
  }),
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isAuthPage = ["/login", "/register"].includes(pathname ?? "");
  const isLegalPage = ["/support", "/privacy", "/terms"].includes(pathname ?? "");
  const isSpecialPage = isAuthPage || isLegalPage;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setMenuOpen(false)}>
      <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm group-hover:brightness-110 transition-all flex-shrink-0">
        <img src="/favicon.jpg" alt="SmartInvest" className="w-full h-full object-cover" />
      </div>
      <span className="text-lg font-bold tracking-tight font-display text-foreground">
        Smart Invest<span className="text-primary">.</span>
      </span>
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-[38px] left-0 right-0 z-40 transition-colors duration-200 ${
        scrolled || isSpecialPage || menuOpen
          ? "bg-background/97 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-3.5 flex items-center justify-between">
        <Logo />

        {isAuthPage ? (
          <div className="flex items-center gap-4">
            <Link href="/"
              className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
              ← Back to Home
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
            {/* Desktop nav */}
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

            {/* Mobile hamburger */}
            <motion.button
              className="md:hidden text-foreground p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.1 }}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                {menuOpen ? (
                  <motion.span key="close"
                    initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 45, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X className="w-5 h-5" />
                  </motion.span>
                ) : (
                  <motion.span key="open"
                    initial={{ rotate: 45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -45, opacity: 0 }} transition={{ duration: 0.15 }}>
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
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="md:hidden bg-background border-b border-border will-change-transform"
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
              {links.map(({ label, href }, i) => (
                <motion.div key={label} custom={i} variants={itemVariants}>
                  {href.startsWith("/") && !href.includes("#") ? (
                    <Link href={href}
                      className="block py-2.5 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium"
                      onClick={() => setMenuOpen(false)}>
                      {label}
                    </Link>
                  ) : (
                    <a href={href}
                      className="block py-2.5 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium"
                      onClick={() => setMenuOpen(false)}>
                      {label}
                    </a>
                  )}
                </motion.div>
              ))}

              <motion.div custom={links.length} variants={itemVariants} className="flex gap-3 pt-3 border-t border-border mt-2">
                {user ? (
                  <>
                    <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                        <ProfileAvatar src={user?.profile_picture} size="sm" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground"
                      onClick={() => { handleLogout(); setMenuOpen(false); }}>
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
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
