import { useState, useEffect } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, ShieldCheck, Copy, Check, BookOpen, KeyRound } from "lucide-react";
import { motion } from "framer-motion";

const BRIEF_KEY_PREFIX = "lb_brief_";

function generateCode(): string {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const digits = "0123456789";
  const rand = (pool: string, n: number) =>
    Array.from({ length: n }, () => pool[Math.floor(Math.random() * pool.length)]).join("");
  return `-${rand(letters, 4)}-${rand(digits, 4)}-${rand(letters, 4)}`;
}

export default function Handoff() {
  const { selectedMortgageType, answers, estimateResult, scenarioAdjustments, chatHistory } = useMortgage();
  const [, setLocation] = useLocation();
  const [codeCopied, setCodeCopied] = useState(false);
  const [code] = useState(generateCode);

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

  const profile = buildProfile();
  const scenarios = buildScenarios();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2500);
    } catch {}
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
        </div>

        <p className="text-center text-xs text-muted-foreground pb-8">
          This summary is generated for your convenience and is not a loan application or financial commitment.
        </p>

      </div>
    </div>
  );
}
