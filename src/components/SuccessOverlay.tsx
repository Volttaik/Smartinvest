'use client';

import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  message?: string;
  subMessage?: string;
  onDone: () => void;
  delay?: number;
}

export default function SuccessOverlay({
  message = "You're in!",
  subMessage = "Redirecting to your dashboard...",
  onDone,
  delay = 2500,
}: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, delay);
    return () => clearTimeout(t);
  }, [onDone, delay]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[500] bg-background flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5" />
        {[...Array(6)].map((_, i) => (
          <motion.div key={i} initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5 + i * 0.4], opacity: [0.4, 0] }}
            transition={{ duration: 1.5, delay: i * 0.15, ease: [0.22, 1, 0.36, 1], repeat: Infinity, repeatDelay: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
            style={{ width: 80 + i * 60, height: 80 + i * 60 }} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 text-center px-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }} className="relative">
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }} className="absolute -inset-3 rounded-full bg-primary/10" />
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg relative">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <motion.path d="M10 20 L17 27 L30 13" stroke="white" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35, ease: [0.22, 1, 0.36, 1] }} />
            </svg>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">{message}</h2>
          <p className="text-muted-foreground text-base">{subMessage}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-primary" />
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
