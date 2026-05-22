import { useState, useEffect, useMemo } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, ShieldCheck, Copy, Check, BookOpen, KeyRound, Mail, Send, PartyPopper, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentChecklist } from "@/components/DocumentChecklist";
import { sendNotification } from "@/lib/notify";

const CONTACT_KEY_PREFIX = "lb_contact_";

const BRIEF_KEY_PREFIX = "lb_brief_";

// ── Deterministic code generation ─────────────────────────────────────────
// Same answers + loan type + scenario = same code every time.
// Any difference in inputs (different person, different scenario) = different code.

function sortedStringify(obj: Record<string, unknown>): string {
  return JSON.stringify(Object.fromEntries(Object.entries(obj).sort()));
}

function generateDeterministicCode(seed: string): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits  = "0123456789";
  // djb2 hash over seed
  let h = 5381;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h, 33) ^ seed.charCodeAt(i);
  }
  h = h >>> 0;
  // LCG to derive more values
  const next = () => { h = (Math.imul(h, 1664525) + 1013904223) >>> 0; return h; };
  const pick = (pool: string) => pool[next() % pool.length];
  const p1 = Array.from({ length: 4 }, () => pick(letters)).join("");
  const p2 = Array.from({ length: 4 }, () => pick(digits)).join("");
  const p3 = Array.from({ length: 4 }, () => pick(letters)).join("");
  return `-${p1}-${p2}-${p3}`;
}

export default function Handoff() {
  const { selectedMortgageType, answers, estimateResult, scenarioAdjustments, chatHistory } = useMortgage();
  const [, setLocation] = useLocation();
  const [codeCopied, setCodeCopied] = useState(false);

  // Derived deterministically — same questionnaire answers + loan type + scenario = same code.
  const code = useMemo(() => {
    const seed = [
      selectedMortgageType ?? "",
      sortedStringify(answers as unknown as Record<string, unknown>),
      sortedStringify(scenarioAdjustments as unknown as Record<string, unknown>),
    ].join("|");
    return generateDeterministicCode(seed);
  }, [selectedMortgageType, answers, scenarioAdjustments]);
  const [clientName, setClientName] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY_PREFIX + code) ?? "{}").name ?? "";
      if (saved) return saved;
      return JSON.parse(localStorage.getItem("lb_pending_contact") ?? "{}").name ?? "";
    } catch { return ""; }
  });
  const [clientEmail, setClientEmail] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY_PREFIX + code) ?? "{}").email ?? "";
      if (saved) return saved;
      return JSON.parse(localStorage.getItem("lb_pending_contact") ?? "{}").email ?? "";
    } catch { return ""; }
  });
  const [clientPhone, setClientPhone] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CONTACT_KEY_PREFIX + code) ?? "{}").phone ?? "";
      if (saved) return saved;
      return JSON.parse(localStorage.getItem("lb_pending_contact") ?? "{}").phone ?? "";
    } catch { return ""; }
  });
  const [summarySubmitted, setSummarySubmitted] = useState(false);
  const [consentChecked, setConsentChecked]     = useState(false);

  const DISCLOSURE_VERSION = "1.0";
  const CONSENT_KEY_PREFIX = "lb_consent_";

  if (!selectedMortgageType || !estimateResult) {
    setLocation("/start");
    return null;
  }

  const fmt = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const getTypeLabel = (type: string | null) => {
    if (type === "buy") return "Buy a Home";
    if (type === "refinance") return "Refinance";
    if (type === "cashout") return "Cash-Out Refinance";
    if (type === "reverse") return "Reverse Mortgage";
    return "Unknown";
  };

  const userQuestions = chatHistory.filter(m => m.role === "user").map(m => m.content);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Build profile object for storage and display
  const buildProfile = (): Record<string, string> => {
    if (selectedMortgageType === "reverse") {
      return {
        "Age": `${answers.age} years old`,
        "Home Value": fmt(answers.homeValue),
        "Mortgage Balance": fmt(answers.mortgageBalance),
        "Credit Score": answers.creditScore,
        "Annual Income": fmt(answers.income),
      };
    }
    const base: Record<string, string> = {
      "Annual Income": fmt(answers.income),
      "Monthly Debt": fmt(answers.monthlyDebt),
      "Credit Score": answers.creditScore,
    };
    if (selectedMortgageType === "buy") {
      base["Down Payment"] = fmt(answers.downPayment);
      base["Target Home Price"] = fmt(answers.homeValue);
    } else {
      base["Mortgage Balance"] = fmt(answers.mortgageBalance);
    }
    return base;
  };

  const buildScenarios = (): string[] => {
    const s: string[] = [];
    if (scenarioAdjustments.incomeBoost > 0) s.push(`Explored increasing income by ${fmt(scenarioAdjustments.incomeBoost)}`);
    if (scenarioAdjustments.debtReduction > 0) s.push(`Explored reducing monthly debt by ${fmt(scenarioAdjustments.debtReduction)}`);
    if (scenarioAdjustments.creditImprovement > 0) s.push(`Explored improving credit score by ${scenarioAdjustments.creditImprovement} tier(s)`);
    if (scenarioAdjustments.downPaymentBoost > 0) s.push(`Explored increasing down payment by ${fmt(scenarioAdjustments.downPaymentBoost)}`);
    return s;
  };

  // Save brief to localStorage under the code key on mount
  useEffect(() => {
    const brief = {
      code,
      date: today,
      goal: selectedMortgageType,
      fullName: answers.fullName,
      creditScore: answers.creditScore,
      employmentType: answers.employmentType,
      profile: buildProfile(),
      estimate: {
        label: estimateResult.type,
        low: fmt(estimateResult.low),
        high: fmt(estimateResult.high),
      },
      scenarios: buildScenarios(),
      questions: userQuestions,
    };
    try {
      localStorage.setItem(BRIEF_KEY_PREFIX + code, JSON.stringify(brief));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CONTACT_KEY_PREFIX + code, JSON.stringify({ name: clientName, email: clientEmail, phone: clientPhone }));
    } catch {}
  }, [clientName, clientEmail, clientPhone, code]);

  const profile = buildProfile();
  const scenarios = buildScenarios();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {}
  };

  const handleSummarySubmit = () => {
    // Store consent audit record
    const consentRecord = {
      timestamp: new Date().toISOString(),
      consentGiven: true,
      disclosureVersion: DISCLOSURE_VERSION,
      sourcePage: "/handoff",
      userAgent: navigator.userAgent,
    };
    try {
      localStorage.setItem(CONSENT_KEY_PREFIX + code, JSON.stringify(consentRecord));
    } catch {}

    void sendNotification({
      type: "profile",
      name: clientName.trim() || answers.fullName || "Client",
      email: clientEmail.trim() || undefined,
      phone: clientPhone.trim() || undefined,
      code,
      goal: getTypeLabel(selectedMortgageType),
      profileItems: Object.entries(profile).map(([k, v]) => `${k} — ${v}`),
      estimate: `${estimateResult.type}: ${fmt(estimateResult.low)} – ${fmt(estimateResult.high)}`,
      employment: answers.employmentType || "Not specified",
      scenarios,
    });
    setSummarySubmitted(true);
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-secondary/30 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">

        <div className="flex items-center justify-between">
          <Link href="/results">
            <Button variant="ghost" className="text-muted-foreground" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground">You're Ready to Talk</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Your profile and questions have been saved. Share your code with your loan officer — they'll have everything instantly.
          </p>
        </div>

        {/* Client Code — the main feature */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border-2 border-primary/20 rounded-3xl p-8 text-center space-y-5 shadow-lg"
        >
          <div className="flex items-center justify-center gap-2 text-primary">
            <KeyRound className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">Your Client Code</span>
          </div>
          <p className="font-mono text-5xl md:text-6xl font-bold text-foreground tracking-widest leading-none">
            {code}
          </p>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Give this code to your loan officer. They can enter it at <strong>loansbetter.com/lookup</strong> to see your full profile and every question you asked.
          </p>
          <Button
            onClick={handleCopyCode}
            variant="outline"
            size="lg"
            className="h-12 px-8 rounded-full font-semibold"
            data-testid="button-copy-code"
          >
            {codeCopied
              ? <><Check className="w-4 h-4 mr-2 text-primary" /> Code Copied!</>
              : <><Copy className="w-4 h-4 mr-2" /> Copy Code</>
            }
          </Button>
        </motion.div>

        {/* Call CTA */}
        <div className="bg-primary rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider mb-1">Speak with a Loan Officer Now</p>
            <p className="text-primary-foreground text-2xl font-bold font-serif">Call 714-494-4172</p>
            <p className="text-primary-foreground/70 text-sm mt-1">Available Mon–Sat, 8am–7pm</p>
          </div>
          <a
            href="tel:7144944172"
            data-testid="link-call-now"
            className="inline-flex items-center gap-2 bg-white text-primary rounded-full px-8 h-12 font-semibold text-base hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Phone className="w-4 h-4" />
            Call Now
          </a>
        </div>

        {/* Summary Ticket */}
        <div className="bg-card border border-border shadow-md rounded-3xl p-8 md:p-12 space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-6 h-6" />
              <span className="font-semibold text-lg">LoansBetter Summary</span>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-bold text-primary">{code}</p>
              <p className="text-xs text-muted-foreground">{today}</p>
            </div>
          </div>

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Goal</h3>
            <p className="text-2xl font-serif text-foreground">{getTypeLabel(selectedMortgageType)}</p>
          </section>

          {answers.fullName && (
            <section>
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Client</h3>
              <p className="text-2xl font-serif text-foreground">{answers.fullName}</p>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Profile</h3>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-base">
              {Object.entries(profile).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="text-sm font-semibold tracking-wider text-primary uppercase mb-2">Estimate</h3>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <span className="text-muted-foreground">{estimateResult.type}</span>
              <span className="text-3xl font-bold text-primary">
                {fmt(estimateResult.low)} – {fmt(estimateResult.high)}
              </span>
            </div>
          </section>

          {scenarios.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Scenarios Explored</h3>
              <ul className="space-y-2 ml-4">
                {scenarios.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground text-sm">
                    <span className="text-primary mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Questions Asked</h3>
            </div>
            {userQuestions.length > 0 ? (
              <ul className="space-y-3">
                {userQuestions.map((q, i) => (
                  <li key={i} className="bg-secondary p-4 rounded-xl text-sm text-foreground flex gap-3">
                    <span className="text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                    <span>"{q}"</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-sm">No questions were asked in the chat.</p>
            )}
          </section>

          {/* ── Send Summary ─────────────────────────────────────────── */}
          <div className="border-t border-border pt-8 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Send className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">Send This Summary to Your Loan Officer</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  So your loan officer can reach you, provide your contact info below. At least one of email or phone is required — both is recommended.
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Your name (required)"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              {clientEmail.trim() && clientPhone.trim() ? null : (
                <p className="text-xs text-muted-foreground">
                  {!clientEmail.trim() && !clientPhone.trim()
                    ? "At least one is required — providing both is recommended so your loan officer can reach you your way."
                    : "Adding both email and phone is recommended so your loan officer can reach you your way."}
                </p>
              )}
            </div>

            {/* TCPA Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-xs text-amber-900 leading-relaxed">
                  By submitting this form, I agree that LoansBetter and its approved lending or marketing partners may contact me by phone, text message, or email regarding mortgage-related products and services using the information I provided.{" "}
                  <strong>Consent is not a condition of purchase.</strong>{" "}
                  See our{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>
                  {" "}and{" "}
                  <Link href="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link>.
                </span>
              </label>
              <p className="text-[10px] text-amber-700 pl-7">You may opt out at any time by contacting us at info@loansbetter.com or 714-494-4172.</p>
            </div>

            <AnimatePresence mode="wait">
              {summarySubmitted ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4"
                >
                  <PartyPopper className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">Summary sent!</p>
                    <p className="text-xs text-green-700 mt-0.5">Your loan officer has your profile and code. They'll follow up with next steps.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleSummarySubmit}
                  disabled={!clientName.trim() || (!clientEmail.trim() && !clientPhone.trim()) || !consentChecked}
                  className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Send className="w-4 h-4" />
                  {!clientName.trim()
                    ? "Enter your name to continue"
                    : (!clientEmail.trim() && !clientPhone.trim())
                      ? "Add email or phone to submit"
                      : !consentChecked
                        ? "Please accept the consent above"
                        : "Submit Summary to Loan Officer"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Document Checklist */}
        <DocumentChecklist
          mortgageType={selectedMortgageType}
          creditScore={answers.creditScore}
          employmentType={answers.employmentType}
          code={code}
          fullName={answers.fullName}
        />

        <p className="text-center text-xs text-muted-foreground pb-8">
          This summary is generated for your convenience and is not a loan application or financial commitment.
        </p>

      </div>
    </div>
  );
}
