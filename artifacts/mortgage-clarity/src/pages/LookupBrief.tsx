import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Phone, ShieldCheck, BookOpen,
  AlertCircle, User, Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentChecklist } from "@/components/DocumentChecklist";

const BRIEF_KEY_PREFIX = "lb_brief_";

interface StoredBrief {
  code: string;
  date: string;
  goal: string;
  creditScore: string;
  employmentType: string;
  profile: Record<string, string>;
  estimate: { label: string; low: string; high: string };
  scenarios: string[];
  questions: string[];
}

function getTypeLabel(type: string) {
  if (type === "buy") return "Buy a Home";
  if (type === "refinance") return "Refinance";
  if (type === "cashout") return "Cash-Out Refinance";
  if (type === "reverse") return "Reverse Mortgage";
  return type;
}

export default function LookupBrief() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<StoredBrief | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"officer" | "client">("officer");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInput = (raw: string) => {
    const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
    let formatted = "";
    for (let i = 0; i < clean.length; i++) {
      if (i === 0) formatted += "-";
      formatted += clean[i];
      if (i === 3 || i === 7) formatted += "-";
    }
    setInput(formatted);
    setError("");
    setSearched(false);
    setResult(null);
  };

  const handleLookup = () => {
    const stripped = input.replace(/-/g, "");
    if (stripped.length < 12) {
      setError("Please enter a complete 12-character client code.");
      return;
    }
    const stored = localStorage.getItem(BRIEF_KEY_PREFIX + input);
    setSearched(true);
    if (!stored) {
      setResult(null);
      setError("No brief found for that code. Double-check the code and try again.");
    } else {
      try {
        setResult(JSON.parse(stored));
        setError("");
      } catch {
        setError("The brief data appears to be corrupted. Ask the client to generate a new code.");
      }
    }
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-secondary/30 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            Loan Lookup
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground">Client Code Lookup</h1>
          <p className="text-muted-foreground text-lg">
            Enter a client code to view the profile brief or continue uploading documents.
          </p>
        </div>

        {/* Code Input */}
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Client Reference Code</label>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="-XAFG-3328-KFKA"
              spellCheck={false}
              maxLength={15}
              className="w-full h-16 rounded-2xl border border-border bg-secondary/50 px-6 text-2xl font-mono font-semibold tracking-widest text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-center"
              data-testid="input-code"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Format: -XXXX-0000-XXXX (auto-formatted as you type)
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-destructive/8 border border-destructive/20 rounded-xl p-4 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleLookup}
            size="lg"
            className="w-full h-14 rounded-full text-base font-semibold"
            disabled={input.replace(/-/g, "").length < 12}
            data-testid="button-lookup"
          >
            <Search className="w-5 h-5 mr-2" />
            Look Up Code
          </Button>
        </div>

        {/* Results area */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Tab switcher */}
              <div className="flex gap-2 bg-secondary rounded-2xl p-1.5">
                <button
                  onClick={() => setActiveTab("officer")}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "officer"
                      ? "bg-card shadow-sm text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  Loan Officer View
                </button>
                <button
                  onClick={() => setActiveTab("client")}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "client"
                      ? "bg-card shadow-sm text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Upload Documents
                </button>
              </div>

              {/* Loan Officer Brief */}
              <AnimatePresence mode="wait">
                {activeTab === "officer" && (
                  <motion.div
                    key="officer"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-3xl p-8 md:p-10 space-y-10 shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <div className="flex items-center gap-2 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-semibold text-lg">LoansBetter Client Brief</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-primary">{result.code}</p>
                        <p className="text-xs text-muted-foreground">{result.date}</p>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Goal</h3>
                      <p className="text-2xl font-serif text-foreground">{getTypeLabel(result.goal)}</p>
                    </section>

                    {(result.employmentType) && (
                      <section>
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Employment</h3>
                        <p className="text-foreground capitalize">{result.employmentType}</p>
                      </section>
                    )}

                    <section>
                      <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">Client Profile</h3>
                      <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
                        {Object.entries(result.profile).map(([label, value]) => (
                          <div key={label} className="flex justify-between border-b border-border/40 pb-2">
                            <span className="text-muted-foreground text-sm">{label}</span>
                            <span className="font-medium text-foreground text-sm">{value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                      <h3 className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Estimate</h3>
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <span className="text-muted-foreground text-sm">{result.estimate.label}</span>
                        <span className="text-3xl font-bold text-primary">
                          {result.estimate.low} – {result.estimate.high}
                        </span>
                      </div>
                    </section>

                    {result.scenarios.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">Scenarios Explored</h3>
                        <ul className="space-y-2">
                          {result.scenarios.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-0.5">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Questions the Client Asked</h3>
                      </div>
                      {result.questions.length > 0 ? (
                        <ul className="space-y-3">
                          {result.questions.map((q, i) => (
                            <li key={i} className="bg-secondary rounded-xl p-4 text-sm text-foreground flex gap-3">
                              <span className="text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                              <span>"{q}"</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic text-sm">Client did not use the AI chat.</p>
                      )}
                    </section>

                    <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">Ready to follow up with this client?</p>
                      <a
                        href="tel:7144944172"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 h-11 font-medium text-sm hover:bg-primary/90 transition-all"
                      >
                        <Phone className="w-4 h-4" />
                        714-494-4172
                      </a>
                    </div>
                  </motion.div>
                )}

                {/* Client document upload */}
                {activeTab === "client" && (
                  <motion.div
                    key="client"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-secondary/60 rounded-2xl p-5 mb-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        Didn't finish uploading your documents? No problem — your checklist progress is saved to your code. Upload or add more files below, then hit <strong>Submit to Loan Officer</strong> when you're ready.
                      </p>
                    </div>
                    <DocumentChecklist
                      mortgageType={result.goal}
                      creditScore={result.creditScore ?? ""}
                      employmentType={result.employmentType ?? ""}
                      code={result.code}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {searched && !result && !error && (
          <p className="text-center text-muted-foreground text-sm">Searching…</p>
        )}

        <p className="text-center text-xs text-muted-foreground pb-8">
          Client briefs are stored locally on the device where the session was completed.
        </p>
      </div>
    </div>
  );
}
