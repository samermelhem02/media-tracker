"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValueEvent } from "framer-motion";

export function StatCard({
  label,
  value,
  delay = 0,
  decimals = 0,
}: {
  label: string;
  value: number;
  delay?: number;
  decimals?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const spring = useSpring(0, { stiffness: 50, damping: 25 });

  useMotionValueEvent(spring, "change", (v) => {
    if (decimals > 0) {
      setDisplayValue(Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals));
    } else {
      setDisplayValue(Math.round(v));
    }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      spring.set(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay, spring]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-2 py-2 shadow-lg backdrop-blur-xl sm:px-5 sm:py-3.5"
    >
      <p className="truncate text-[10px] font-medium text-zinc-400 sm:text-sm">{label}</p>
      <p className="mt-0.5 truncate text-base font-semibold text-white sm:text-2xl">
        {decimals > 0 ? displayValue.toFixed(decimals) : displayValue}
      </p>
    </motion.div>
  );
}
