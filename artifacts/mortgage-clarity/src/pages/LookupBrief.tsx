import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Phone, ShieldCheck, BookOpen, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const BRIEF_KEY_PREFIX = "lb_brief_";

interface StoredBrief {
  code: string;
  date: string;
  goal: string;
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-format input as user types: -XXXX-0000-XXXX
  const handleInput = (raw: string) => {
    // Strip everything non-alphanumeric
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
      setError("No brief found for that code. Check the code and try again.");
    } else {
      try {
        setResult(JSON.parse(stored));
        setError("");
      } catch {
        setError("The brief data appears to be corrupted. Ask the client for a new code.");
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
            Loan Officer Portal
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground">Client Brief Lookup</h1>
          <p className="text-muted-foreground text-lg">
            Enter the code your client shared with you to instantly pull up their profile, estimates, and questions.
          </p>
        </div>

        {/* Code Input Card */}
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
            Retrieve Client Brief
          </Button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-3xl p-8 md:p-10 space-y-10 shadow-md"
            >
              {/* Header */}
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

              {/* Goal */}
              <section>
                <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Goal</h3>
                <p className="text-2xl font-serif text-foreground">{getTypeLabel(result.goal)}</p>
              </section>

              {/* Profile */}
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

              {/* Estimate */}
              <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <h3 className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Estimate</h3>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <span className="text-muted-foreground text-sm">{result.estimate.label}</span>
                  <span className="text-3xl font-bold text-primary">
                    {result.estimate.low} – {result.estimate.high}
                  </span>
                </div>
              </section>

              {/* Scenarios */}
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

              {/* Questions */}
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

              {/* Call CTA */}
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
        </AnimatePresence>

        {searched && !result && !error && (
          <p className="text-center text-muted-foreground text-sm">Searching...</p>
        )}

        <p className="text-center text-xs text-muted-foreground pb-8">
          Client briefs are stored locally on the device where the session was completed.
          This lookup portal is for authorized loan officer use only.
        </p>
      </div>
    </div>
  );
}
