'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function PageLoader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      const shown = sessionStorage.getItem("si-loaded");
      if (shown) return false;
    }
    return true;
  });

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("si-loaded", "1");
    }, 2400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center overflow-hidden">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 0.6, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/6 blur-3xl pointer-events-none" />

          <motion.div initial={{ scale: 0.75, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.34, 1.3, 0.64, 1] }} className="flex flex-col items-center gap-5 relative z-10">
            <div className="relative">
              <motion.div animate={{ scale: [1, 1.7, 1], opacity: [0.25, 0, 0.25] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: [0.4, 0, 0.6, 1] }}
                className="absolute inset-0 rounded-2xl bg-primary/20" />
              <motion.div animate={{ scale: [1, 1.35, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: [0.4, 0, 0.6, 1], delay: 0.4 }}
                className="absolute inset-0 rounded-2xl bg-primary/15" />
              <div className="relative w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="text-center">
              <div className="font-display text-3xl font-bold text-foreground tracking-tight">
                Smart Invest<span className="text-primary">.</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1 tracking-widest uppercase">Your wealth, perfected</div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-48 h-0.5 bg-muted rounded-full overflow-hidden mt-1" style={{ transformOrigin: "left" }}>
              <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }}
                transition={{ duration: 1.7, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-primary rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
