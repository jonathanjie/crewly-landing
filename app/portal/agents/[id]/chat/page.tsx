// app/portal/agents/[id]/chat/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import type { AppInstance, InstanceHealth } from "@/lib/types";
import { statusDotColor } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: "sample-1",
    role: "agent",
    content:
      "Hello! I'm your AI assistant. I can help you with questions, tasks, and workflows. How can I help you today?",
    timestamp: new Date(Date.now() - 60_000),
  },
  {
    id: "sample-2",
    role: "user",
    content: "Can you summarize our Q4 sales report?",
    timestamp: new Date(Date.now() - 45_000),
  },
  {
    id: "sample-3",
    role: "agent",
    content:
      "Of course! Based on the Q4 data, revenue grew 12% quarter-over-quarter to S$2.4M. Key highlights:\n\n- New customer acquisitions up 18%\n- Average deal size increased from S$15K to S$19K\n- Top-performing sector: logistics (34% of revenue)\n\nWould you like me to break down any specific area?",
    timestamp: new Date(Date.now() - 30_000),
  },
];

export default function AgentChat() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [agent, setAgent] = useState<AppInstance | null>(null);
  const [health, setHealth] = useState<InstanceHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>(SAMPLE_MESSAGES);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOnline = health?.status === "online";

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [a, h] = await Promise.all([
          api.getDeployment(id),
          api.getHealth(id).catch(() => null),
        ]);
        setAgent(a);
        setHealth(h);
      } catch {
        // Agent not found — will show error state
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    if (!isOnline) {
      // Demo mode — show a placeholder response after a short delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `agent-${Date.now()}`,
            role: "agent",
            content:
              "This is a preview of the chat experience. Once your agent is deployed and running, responses will come from your live AI agent.",
            timestamp: new Date(),
          },
        ]);
        setSending(false);
      }, 1000);
      return;
    }

    try {
      const res = await api.sendChat(id, text);
      setMessages((prev) => [
        ...prev,
        {
          id: `agent-${Date.now()}`,
          role: "agent",
          content: res.response ?? res.message ?? "Agent responded.",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "agent",
          content:
            "Unable to reach the agent right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-white rounded-2xl h-96 border border-ink/5" />;
  }

  if (!agent) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-light text-sm">Agent not found.</p>
        <button
          onClick={() => router.back()}
          className="text-teal-deep text-sm mt-2 hover:underline"
        >
          &larr; Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/portal/agents/${id}`}
            className="text-ink-faint hover:text-ink text-sm"
          >
            &larr;
          </Link>
          <div className={`w-2.5 h-2.5 rounded-full ${statusDotColor(agent.status, health?.status)}`} />
          <h1 className="font-[family-name:var(--font-display)] text-lg font-bold text-ink">
            {agent.name}
          </h1>
          <span className="text-[10px] text-ink-faint bg-ink/5 px-2 py-0.5 rounded-full capitalize">
            {health?.status ?? agent.status}
          </span>
        </div>
        <Link
          href={`/portal/agents/${id}`}
          className="text-xs text-ink-light hover:text-ink transition-colors"
        >
          Agent details
        </Link>
      </div>

      {/* Coming soon banner */}
      {!isOnline && (
        <div className="bg-teal/10 border border-teal/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-teal-deep flex-shrink-0"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p className="text-xs text-teal-deep">
            <span className="font-semibold">Preview mode</span> &mdash; Chat
            will be fully active once your agent is deployed and running. Try
            sending a message to see how it works.
          </p>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-ink/5 p-4 mb-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] sm:max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "agent"
                  ? "bg-teal/10 text-ink rounded-bl-md"
                  : "bg-cream-warm text-ink rounded-br-md"
              }`}
            >
              {msg.content}
              <div
                className={`text-[10px] mt-1.5 ${
                  msg.role === "agent" ? "text-teal-deep/50" : "text-ink-faint"
                }`}
              >
                {msg.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-teal/10 text-teal-deep px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-teal-deep/40 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-teal-deep/40 rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-teal-deep/40 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="bg-white rounded-2xl border border-ink/5 p-3 flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isOnline
              ? "Type a message..."
              : "Try sending a message (preview mode)"
          }
          className="flex-1 px-4 py-2.5 rounded-xl border border-ink/10 bg-cream text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-teal/40 text-sm"
          disabled={sending}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="bg-teal-deep text-white p-2.5 rounded-xl hover:bg-teal-deep/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
