'use client';

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp } from "lucide-react";

export default function PageLoader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== "undefined") {
      return !sessionStorage.getItem("si-loaded");
    }
    return true;
  });

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("si-loaded", "1");
    }, 2200);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] } }}
          className="fixed inset-0 z-[999] bg-background flex flex-col items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.2, 0.64, 1] }}
            className="flex flex-col items-center gap-6"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>

            <div className="text-center">
              <div className="font-display text-2xl font-bold text-foreground tracking-tight">SmartInvest</div>
              <div className="text-xs text-muted-foreground mt-1 tracking-widest uppercase">Your wealth, growing</div>
            </div>

            <div className="w-40 h-0.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.6, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
