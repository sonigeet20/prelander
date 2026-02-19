"use client";

import { useState, useRef, useEffect, useCallback } from "react";

/**
 * AIAssistant — Real AI-powered chat assistant using GPT-4o-mini.
 * Provides genuinely useful advice per vertical (travel tips, finance advice, etc.)
 * CTA buttons direct users to the brand for taking action.
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

const VERTICAL_STARTERS: Record<string, { title: string; subtitle: string; icon: string; gradient: string; prompts: string[] }> = {
  travel: {
    title: "AI Travel Assistant",
    subtitle: "Ask me anything about travel planning",
    icon: "🌍",
    gradient: "from-indigo-600 to-violet-600",
    prompts: [
      "When's the cheapest time to fly to Europe?",
      "How do I find hidden-city ticketing deals?",
      "What should I pack for 2 weeks in Southeast Asia?",
      "Compare direct vs. connecting flights — worth the savings?",
    ],
  },
  finance: {
    title: "AI Finance Advisor",
    subtitle: "Get personalized financial guidance",
    icon: "💰",
    gradient: "from-emerald-600 to-teal-600",
    prompts: [
      "Should I refinance my mortgage at current rates?",
      "How to build an emergency fund on a tight budget?",
      "Explain the difference between Roth and Traditional IRA",
      "What's the best debt payoff strategy for me?",
    ],
  },
  b2b_saas: {
    title: "AI Software Advisor",
    subtitle: "Get help choosing the right tools",
    icon: "⚡",
    gradient: "from-blue-600 to-cyan-600",
    prompts: [
      "How do I evaluate TCO for enterprise software?",
      "What questions should I ask in a SaaS demo?",
      "How to negotiate a better SaaS contract?",
      "Build vs buy — how to decide?",
    ],
  },
  subscription: {
    title: "AI Subscription Advisor",
    subtitle: "Optimize your subscriptions",
    icon: "📦",
    gradient: "from-purple-600 to-pink-600",
    prompts: [
      "Is this subscription worth the cost for my usage?",
      "How to audit and cut unnecessary subscriptions?",
      "Annual vs monthly billing — when does annual pay off?",
      "What features should I prioritize in this tier?",
    ],
  },
  ecommerce: {
    title: "AI Shopping Assistant",
    subtitle: "Make smarter purchase decisions",
    icon: "🛒",
    gradient: "from-orange-500 to-red-500",
    prompts: [
      "What's the best time of year to buy electronics?",
      "How to spot fake reviews on product listings?",
      "Tips for getting the best deal on a big purchase?",
      "How do I compare product quality across brands?",
    ],
  },
  d2c: {
    title: "AI Product Expert",
    subtitle: "Research products before you buy",
    icon: "🔬",
    gradient: "from-rose-500 to-pink-600",
    prompts: [
      "How do DTC brands compare to traditional retailers?",
      "What should I look for in product ingredients?",
      "Is this subscription box worth trying?",
      "How to evaluate a new brand's quality?",
    ],
  },
  health: {
    title: "AI Health Plan Guide",
    subtitle: "Navigate health insurance options",
    icon: "🏥",
    gradient: "from-rose-500 to-purple-600",
    prompts: [
      "What's the difference between HMO and PPO?",
      "How do I estimate my annual healthcare costs?",
      "Should I get an HDHP with an HSA?",
      "What to look for during open enrollment?",
    ],
  },
};

const DEFAULT_CONFIG = {
  title: "AI Research Assistant",
  subtitle: "Ask me anything to help your decision",
  icon: "🔍",
  gradient: "from-gray-700 to-gray-900",
  prompts: [
    "How do I compare options effectively?",
    "What should I look for before buying?",
    "Tips for getting the best deal?",
    "What questions should I ask before committing?",
  ],
};

export function AIAssistant({
  brandName,
  trackingHref,
  brandDomain,
  vertical,
  initialQuery,
}: {
  brandName: string;
  trackingHref: string;
  brandDomain: string;
  vertical: string;
  initialQuery?: string;
}) {
  const config = VERTICAL_STARTERS[vertical] || DEFAULT_CONFIG;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoQueried, setHasAutoQueried] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setError(null);
    setIsStreaming(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
          vertical,
          brandName,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Add empty assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantContent += chunk;
          // Update last message
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: "assistant", content: assistantContent };
            return next;
          });
        }
      }
    } catch {
      setError("Sorry, I couldn't generate a response. Please try again.");
      // Remove the empty assistant message if error
      setMessages((prev) => prev.filter((m) => m.content !== ""));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  }, [isStreaming, messages, vertical, brandName]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-submit initial query if provided
  useEffect(() => {
    if (initialQuery && !hasAutoQueried) {
      setHasAutoQueried(true);
      sendMessage(initialQuery);
    }
  }, [initialQuery, hasAutoQueried, sendMessage]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200/70 shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${config.gradient} px-6 py-4`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">{config.icon}</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{config.title}</h3>
            <p className="text-white/70 text-xs">{config.subtitle}</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-[10px]">Powered by AI</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Chat area */}
        {messages.length === 0 ? (
          /* Starter prompts */
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-3">Try asking:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {config.prompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left px-3.5 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs text-gray-700 transition-colors border border-gray-100 hover:border-gray-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Message list */
          <div className="max-h-80 overflow-y-auto space-y-3 mb-4 pr-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" && msg.content === "" ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {error && (
          <div className="mb-3 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask a question..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            className={`px-4 py-2.5 bg-gradient-to-r ${config.gradient} text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isStreaming ? "..." : "Send"}
          </button>
        </div>

        {/* CTA */}
        {messages.length >= 2 && (
          <a
            href={trackingHref}
            className={`block w-full text-center py-3 mt-4 bg-gradient-to-r ${config.gradient} text-white rounded-xl font-bold text-sm hover:shadow-xl hover:-translate-y-0.5 transition-all`}
            rel="nofollow sponsored"
          >
            <span className="flex items-center justify-center gap-2">
              Take Action on {brandName}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </a>
        )}

        <p className="text-[10px] text-gray-400 text-center mt-2">
          AI-generated advice • Always verify on {brandDomain}
        </p>
      </div>
    </div>
  );
}
