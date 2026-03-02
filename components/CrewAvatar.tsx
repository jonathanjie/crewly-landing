"use client";

import { motion } from "framer-motion";

type CrewAvatarProps = {
  emoji: string;
  name: string;
  role: string;
  color: string;
  delay?: number;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { container: "w-16 h-16", emoji: "text-2xl", label: "text-xs" },
  md: { container: "w-24 h-24", emoji: "text-4xl", label: "text-sm" },
  lg: { container: "w-32 h-32", emoji: "text-5xl", label: "text-base" },
};

export default function CrewAvatar({
  emoji,
  name,
  role,
  color,
  delay = 0,
  size = "md",
}: CrewAvatarProps) {
  const s = sizes[size];

  return (
    <motion.div
      initial={{ y: 30, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="flex flex-col items-center gap-2 cursor-default"
    >
      <div
        className={`${s.container} rounded-[28%] flex items-center justify-center shadow-lg relative group`}
        style={{ backgroundColor: color }}
      >
        <span className={`${s.emoji} select-none`}>{emoji}</span>
        {/* Wave hand on hover */}
        <motion.div
          className="absolute -top-1 -right-1 text-lg origin-bottom-right"
          initial={{ opacity: 0, rotate: 0 }}
          whileHover={{ opacity: 1, rotate: [0, 14, -8, 14, 0] }}
          transition={{ duration: 0.6 }}
        >
          {""}
        </motion.div>
      </div>
      <div className="text-center">
        <p
          className={`${s.label} font-[family-name:var(--font-display)] font-semibold text-ink`}
        >
          {name}
        </p>
        <p className={`${s.label} text-ink-light`}>{role}</p>
      </div>
    </motion.div>
  );
}
