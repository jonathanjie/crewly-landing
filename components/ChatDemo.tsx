"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface ChatDemoProps {
  messages: Message[];
  agentName: string;
  agentEmoji: string;
  isActive: boolean;
}

export default function ChatDemo({
  messages,
  agentName,
  agentEmoji,
  isActive,
}: ChatDemoProps) {
  const [visibleMessages, setVisibleMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) {
      setVisibleMessages([]);
      setTyping(false);
      return;
    }

    setVisibleMessages([]);
    setTyping(false);

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const playMessages = async () => {
      for (let i = 0; i < messages.length; i++) {
        if (cancelled) return;

        const msg = messages[i];

        if (msg.role === "agent") {
          setTyping(true);
          await new Promise((r) => {
            timeout = setTimeout(r, 800 + Math.random() * 600);
          });
          if (cancelled) return;
          setTyping(false);
        } else {
          await new Promise((r) => {
            timeout = setTimeout(r, 400);
          });
          if (cancelled) return;
        }

        setVisibleMessages((prev) => [...prev, msg]);
        await new Promise((r) => {
          timeout = setTimeout(r, 600);
        });
      }
    };

    const startTimeout = setTimeout(() => playMessages(), 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [isActive, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [visibleMessages, typing]);

  return (
    <div className="bg-ink/[0.03] rounded-2xl border border-ink/5 overflow-hidden h-[320px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-ink/5 bg-white/60">
        <span className="text-lg">{agentEmoji}</span>
        <div>
          <p className="text-sm font-[family-name:var(--font-display)] font-semibold text-ink">
            {agentName}
          </p>
          <p className="text-[11px] text-teal-deep flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-deep" />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
        <AnimatePresence mode="popLayout">
          {visibleMessages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-3.5 py-2 text-[13px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-ink text-cream rounded-xl rounded-br-sm"
                    : "bg-white text-ink/80 rounded-xl rounded-bl-sm border border-ink/5"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-ink/5 rounded-xl rounded-bl-sm px-4 py-2.5 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-ink/20"
                    animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input (decorative) */}
      <div className="px-4 py-3 border-t border-ink/5 bg-white/40">
        <div className="flex items-center gap-2 bg-white rounded-lg border border-ink/8 px-3 py-2">
          <span className="text-sm text-ink-faint flex-1">Type a message...</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-ink-faint"
          >
            <path
              d="M14 2L7.5 8.5M14 2l-4.5 12-2-5.5L2 6.5 14 2z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
