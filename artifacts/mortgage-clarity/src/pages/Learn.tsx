import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Topic category chips ────────────────────────────────────────────────────

const TOPICS = [
  { label: "Basics", chips: ["How does a mortgage work?", "What is amortization?", "What is PMI?", "What is escrow?"] },
  { label: "Rates", chips: ["How do interest rates work?", "What is APR vs rate?", "What are mortgage points?", "What is a rate lock?"] },
  { label: "Loan Types", chips: ["What is an FHA loan?", "What is a VA loan?", "15 vs 30 year — which is better?", "What is a USDA loan?"] },
  { label: "Qualifying", chips: ["What is debt-to-income ratio?", "How does credit score affect my rate?", "What do I need for pre-approval?", "How much can I afford?"] },
  { label: "Costs", chips: ["What are closing costs?", "How much should I put down?", "What are property taxes?", "What does homeowner's insurance cost?"] },
  { label: "Process", chips: ["What is the home buying process?", "What is earnest money?", "What is a home appraisal?", "What is an HOA?"] },
];

// ─── Message type ────────────────────────────────────────────────────────────

interface Message {
  role: "ai" | "user";
  text: string;
  question?: string;
  loading?: boolean;
  deepLoading?: boolean;
  deepText?: string;
  showingDeep?: boolean;
}

// ─── Simple markdown renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      return <p key={i} className="font-semibold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
    if (line.startsWith("• ") || line.startsWith("- ")) {
      const content = line.slice(2);
      const contentParts = content.split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
        p.startsWith("**") && p.endsWith("**")
          ? <strong key={j}>{p.slice(2, -2)}</strong>
          : <span key={j}>{p}</span>
      );
      return <li key={i} className="ml-4 list-none flex gap-2"><span className="text-primary mt-0.5 shrink-0">•</span><span>{contentParts}</span></li>;
    }
    if (line === "") return <div key={i} className="h-2" />;
    return <p key={i}>{rendered}</p>;
  });
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Learn() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Ask me anything about mortgages — in plain English, no jargon.\n\nI'll give you a simple answer first. If you want more detail, just tap \"Tell me more\" and I'll go deeper.\n\nWhat would you like to understand?",
    },
  ]);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const askAI = useCallback(async (question: string, mode: "simple" | "deep"): Promise<string> => {
    const resp = await fetch("/api/learn/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode }),
    });
    if (!resp.ok) throw new Error("AI request failed");
    const data = await resp.json() as { answer: string };
    return data.answer;
  }, []);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: Message = { role: "user", text: trimmed };
    const loadingMsg: Message = { role: "ai", text: "", question: trimmed, loading: true };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput("");
    inputRef.current?.focus();

    try {
      const answer = await askAI(trimmed, "simple");
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, text: answer, loading: false }
            : m
        )
      );
    } catch {
      setMessages(prev =>
        prev.map((m, i) =>
          i === prev.length - 1
            ? { ...m, text: "Sorry, I had trouble answering that. Please try again.", loading: false }
            : m
        )
      );
    }
  }, [askAI]);

  const goDeeper = useCallback(async (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg.question) return;

    // If we already have the deep text, just toggle it
    if (msg.deepText) {
      setMessages(prev =>
        prev.map((m, i) => i === msgIndex ? { ...m, showingDeep: !m.showingDeep } : m)
      );
      return;
    }

    // Fetch deep answer
    setMessages(prev =>
      prev.map((m, i) => i === msgIndex ? { ...m, deepLoading: true } : m)
    );

    try {
      const deepAnswer = await askAI(msg.question, "deep");
      setMessages(prev =>
        prev.map((m, i) =>
          i === msgIndex
            ? { ...m, deepLoading: false, deepText: deepAnswer, showingDeep: true }
            : m
        )
      );
    } catch {
      setMessages(prev =>
        prev.map((m, i) =>
          i === msgIndex
            ? { ...m, deepLoading: false }
            : m
        )
      );
    }
  }, [messages, askAI]);

  return (
    <div className="h-[calc(100dvh-5rem)] bg-background flex flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border bg-secondary/30 px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-xl text-foreground leading-tight">Mortgage Learning Center</h1>
            <p className="text-muted-foreground text-sm">Simple answers — with more depth available anytime.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
        {/* Topic chips */}
        <div className="py-4 border-b border-border/50">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TOPICS.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(i)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {TOPICS[activeCategory].chips.map(chip => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="text-sm bg-background border border-border rounded-full px-4 py-1.5 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={messagesRef} className="flex-1 py-6 space-y-5 overflow-y-auto min-h-0">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}

                <div className="max-w-[85%] flex flex-col gap-2">
                  {/* Main bubble */}
                  <div
                    className={`rounded-2xl px-5 py-4 text-sm leading-relaxed space-y-0.5 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm"
                    }`}
                  >
                    {msg.loading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : msg.role === "ai" ? (
                      renderMarkdown(msg.text)
                    ) : (
                      <p>{msg.text}</p>
                    )}
                  </div>

                  {/* Deep dive section */}
                  {msg.role === "ai" && !msg.loading && msg.question && (
                    <div className="pl-1">
                      {!msg.showingDeep ? (
                        <button
                          onClick={() => goDeeper(i)}
                          disabled={msg.deepLoading}
                          className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                          {msg.deepLoading ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Loading deeper explanation...
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Tell me more
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <AnimatePresence>
                            {msg.showingDeep && msg.deepText && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm leading-relaxed space-y-0.5">
                                  <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-3">Full explanation</p>
                                  {renderMarkdown(msg.deepText)}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <button
                            onClick={() => goDeeper(i)}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium hover:text-foreground transition-colors"
                          >
                            <ChevronUp className="w-3 h-3" />
                            Show less
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="py-4 border-t border-border">
          <div className="flex gap-3 items-center bg-secondary/60 rounded-full border border-border px-5 py-2 focus-within:border-primary transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask anything about mortgages..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              size="icon"
              className="w-8 h-8 rounded-full shrink-0"
              disabled={!input.trim()}
              onClick={() => send(input)}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Educational information only — not financial or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
