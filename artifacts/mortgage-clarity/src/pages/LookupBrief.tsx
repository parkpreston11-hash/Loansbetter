import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Phone, ShieldCheck, BookOpen,
  AlertCircle, User, Briefcase, Mail, Lock, Unlock,
  Activity, CheckCircle2, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentChecklist } from "@/components/DocumentChecklist";
import { LoanProgressTracker, LOAN_STAGES } from "@/components/LoanProgressTracker";

// ── Constants ─────────────────────────────────────────────────────────────────

const BRIEF_KEY_PREFIX   = "lb_brief_";
const CONTACT_KEY_PREFIX = "lb_contact_";
const STAGE_KEY_PREFIX   = "lb_stage_";

const LO_OVERRIDE_CODE = "LBLO2025";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredBrief {
  code: string;
  date: string;
  goal: string;
  fullName?: string;
  creditScore: string;
  employmentType: string;
  profile: Record<string, string>;
  estimate: { label: string; low: string; high: string };
  scenarios: string[];
  questions: string[];
}

interface StoredContact {
  name?: string;
  email?: string;
  phone?: string;
}

interface StoredStage {
  stage: number;
  updatedAt: string;
}

function getTypeLabel(type: string) {
  if (type === "buy") return "Buy a Home";
  if (type === "refinance") return "Refinance";
  if (type === "cashout") return "Cash-Out Refinance";
  if (type === "reverse") return "Reverse Mortgage";
  return type;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LookupBrief() {
  const [input, setInput]       = useState("");
  const [result, setResult]     = useState<StoredBrief | null>(null);
  const [contact, setContact]   = useState<StoredContact | null>(null);
  const [error, setError]       = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"officer" | "progress" | "client">("officer");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Stage state ────────────────────────────────────────────────────────────
  const [currentStage, setCurrentStage]   = useState(0);
  const [stageUpdatedAt, setStageUpdatedAt] = useState("");

  // ── LO override state ──────────────────────────────────────────────────────
  const [loCodeInput, setLoCodeInput]   = useState("");
  const [loUnlocked, setLoUnlocked]     = useState(false);
  const [loError, setLoError]           = useState("");
  const [pendingStage, setPendingStage] = useState(0);
  const [stageSaved, setStageSaved]     = useState(false);

  // ── Code input ─────────────────────────────────────────────────────────────
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
    setCurrentStage(0);
    setStageUpdatedAt("");
    setLoUnlocked(false);
    setLoCodeInput("");
    setLoError("");
    setStageSaved(false);
    setPendingStage(0);
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
      setContact(null);
      setError("No brief found for that code. Double-check the code and try again.");
    } else {
      try {
        setResult(JSON.parse(stored) as StoredBrief);
        setError("");
        try {
          const raw = localStorage.getItem(CONTACT_KEY_PREFIX + input);
          setContact(raw ? (JSON.parse(raw) as StoredContact) : null);
        } catch { setContact(null); }
        try {
          const rawStage = localStorage.getItem(STAGE_KEY_PREFIX + input);
          if (rawStage) {
            const s = JSON.parse(rawStage) as StoredStage;
            setCurrentStage(s.stage ?? 0);
            setStageUpdatedAt(s.updatedAt ?? "");
            setPendingStage(s.stage ?? 0);
          } else {
            setCurrentStage(0);
            setStageUpdatedAt("");
            setPendingStage(0);
          }
        } catch { setCurrentStage(0); }
      } catch {
        setError("The brief data appears to be corrupted. Ask the client to generate a new code.");
      }
    }
  };

  // ── LO override unlock ─────────────────────────────────────────────────────
  const handleLoUnlock = () => {
    if (loCodeInput.trim().toUpperCase().replace(/-/g, "") === LO_OVERRIDE_CODE) {
      setLoUnlocked(true);
      setLoError("");
      setPendingStage(currentStage > 0 ? currentStage : 1);
    } else {
      setLoError("Incorrect override code. Please try again.");
    }
  };

  // ── LO save stage ──────────────────────────────────────────────────────────
  const handleSaveStage = () => {
    if (!result || pendingStage < 1 || pendingStage > 7) return;
    const updatedAt = new Date().toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
    const payload: StoredStage = { stage: pendingStage, updatedAt };
    try {
      localStorage.setItem(STAGE_KEY_PREFIX + result.code, JSON.stringify(payload));
      setCurrentStage(pendingStage);
      setStageUpdatedAt(updatedAt);
      setStageSaved(true);
      setTimeout(() => setStageSaved(false), 3000);
    } catch {}
  };

  // ── Render ─────────────────────────────────────────────────────────────────

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
            Enter a client code to view the profile brief, track loan progress, or upload documents.
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

        {/* Results */}
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
                  <span className="hidden sm:inline">Loan Officer</span>
                  <span className="sm:hidden">Officer</span>
                </button>
                <button
                  onClick={() => setActiveTab("progress")}
                  className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === "progress"
                      ? "bg-card shadow-sm text-foreground border border-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Activity className="w-4 h-4" />
                  Progress
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
                  Documents
                </button>
              </div>

              <AnimatePresence mode="wait">

                {/* ── Loan Officer Brief ───────────────────────────────────── */}
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

                    {(contact?.name || result.fullName) && (
                      <section>
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Client Name</h3>
                        <p className="text-2xl font-serif text-foreground">{contact?.name || result.fullName}</p>
                      </section>
                    )}

                    {result.employmentType && (
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

                    {/* Contact info */}
                    <div className="pt-4 border-t border-border space-y-4">
                      {(contact?.name || contact?.email || contact?.phone) && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Client Contact Info</p>
                          <div className="flex flex-col gap-2">
                            {contact?.name && (
                              <div className="inline-flex items-center gap-2 text-sm text-foreground font-medium">
                                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                {contact.name}
                              </div>
                            )}
                            {contact?.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="inline-flex items-center gap-2 text-sm text-foreground font-medium hover:text-primary transition-colors"
                              >
                                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                {contact.email}
                              </a>
                            )}
                            {contact?.phone && (
                              <a
                                href={`tel:${contact.phone.replace(/\D/g, "")}`}
                                className="inline-flex items-center gap-2 text-sm text-foreground font-medium hover:text-primary transition-colors"
                              >
                                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">Get a hold of your loan officer</p>
                        <a
                          href="tel:7144944172"
                          className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 h-11 font-medium text-sm hover:bg-primary/90 transition-all"
                        >
                          <Phone className="w-4 h-4" />
                          714-494-4172
                        </a>
                      </div>
                    </div>

                    {/* ── LO: Update Loan Stage ─────────────────────────── */}
                    <div className="border-t border-border pt-8 space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          {loUnlocked
                            ? <Unlock className="w-4 h-4 text-amber-700" />
                            : <Lock className="w-4 h-4 text-amber-700" />
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">Loan Officer Controls</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {loUnlocked
                              ? "Override verified — select and save the current loan stage below."
                              : "Enter your override code to update this client's loan stage."}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {!loUnlocked ? (
                          <motion.div
                            key="locked"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-3"
                          >
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={loCodeInput}
                                onChange={(e) => { setLoCodeInput(e.target.value); setLoError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && handleLoUnlock()}
                                placeholder="Override code"
                                className="flex-1 h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                              />
                              <Button
                                onClick={handleLoUnlock}
                                disabled={!loCodeInput.trim()}
                                className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Unlock
                              </Button>
                            </div>
                            {loError && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-xs text-destructive flex items-center gap-1.5"
                              >
                                <AlertCircle className="w-3.5 h-3.5" /> {loError}
                              </motion.p>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="unlocked"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <div className="grid grid-cols-1 gap-2">
                              {LOAN_STAGES.map((stage) => (
                                <button
                                  key={stage.n}
                                  onClick={() => setPendingStage(stage.n)}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${
                                    pendingStage === stage.n
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-border bg-secondary/40 hover:border-primary/40 hover:bg-secondary/80"
                                  }`}
                                >
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                    pendingStage === stage.n
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-border text-muted-foreground"
                                  }`}>
                                    <stage.Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium ${pendingStage === stage.n ? "text-primary" : "text-foreground"}`}>
                                      {stage.n}. {stage.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{stage.timeline}</p>
                                  </div>
                                  {pendingStage === stage.n && (
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                  )}
                                </button>
                              ))}
                            </div>

                            <AnimatePresence mode="wait">
                              {stageSaved ? (
                                <motion.div
                                  key="saved"
                                  initial={{ opacity: 0, scale: 0.96 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3.5"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-emerald-800">Stage updated</p>
                                    <p className="text-xs text-emerald-700 mt-0.5">
                                      Stage {pendingStage} — {LOAN_STAGES.find(s => s.n === pendingStage)?.label}. Client will see this the next time they look up their code.
                                    </p>
                                  </div>
                                </motion.div>
                              ) : (
                                <motion.button
                                  key="save-btn"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  onClick={handleSaveStage}
                                  disabled={pendingStage === currentStage && currentStage > 0}
                                  className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                  <Save className="w-4 h-4" />
                                  {pendingStage === currentStage && currentStage > 0
                                    ? "Already at this stage"
                                    : `Save — Set Stage to "${LOAN_STAGES.find(s => s.n === pendingStage)?.label ?? ""}"`}
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* ── Loan Progress Tracker ─────────────────────────────── */}
                {activeTab === "progress" && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-md space-y-6"
                  >
                    <div className="border-b border-border pb-6">
                      <h2 className="font-serif text-2xl font-semibold text-foreground">
                        Track your mortgage progress with clarity.
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1.5">
                        Understand where you are in the process, what's happening now, and what to expect next.
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/8 rounded-full px-3 py-1">
                          {result.code}
                        </span>
                        {contact?.name && (
                          <span className="text-xs text-muted-foreground">· {contact.name}</span>
                        )}
                      </div>
                    </div>

                    <LoanProgressTracker
                      currentStage={currentStage}
                      updatedAt={stageUpdatedAt || undefined}
                    />
                  </motion.div>
                )}

                {/* ── Client document upload ────────────────────────────── */}
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
                      fullName={result.fullName ?? ""}
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
