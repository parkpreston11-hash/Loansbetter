import { useState, useCallback } from "react";
import { useMortgage } from "@/context/MortgageContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, ShieldCheck, Copy, Check, BookOpen } from "lucide-react";

function generateRefCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "LB-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function Handoff() {
  const { selectedMortgageType, answers, estimateResult, scenarioAdjustments, chatHistory } = useMortgage();
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const [refCode] = useState(generateRefCode);

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

  const userQuestions = chatHistory.filter(m => m.role === "user");

  const today = new Date().toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

  // Build the plain-text brief the loan officer can paste into any system
  const buildBrief = useCallback(() => {
    const divider = "─".repeat(40);
    const lines: string[] = [
      "=== LoansBetter Client Brief ===",
      `Reference: ${refCode}   |   ${today}`,
      divider,
      `GOAL: ${getTypeLabel(selectedMortgageType)}`,
      divider,
      "PROFILE",
    ];

    if (selectedMortgageType === "reverse") {
      lines.push(`  Age:               ${answers.age} years old`);
      lines.push(`  Home Value:        ${fmt(answers.homeValue)}`);
      lines.push(`  Mortgage Balance:  ${fmt(answers.mortgageBalance)}`);
      lines.push(`  Credit Score:      ${answers.creditScore}`);
      lines.push(`  Annual Income:     ${fmt(answers.income)}`);
    } else {
      lines.push(`  Annual Income:     ${fmt(answers.income)}`);
      lines.push(`  Monthly Debt:      ${fmt(answers.monthlyDebt)}`);
      lines.push(`  Credit Score:      ${answers.creditScore}`);
      if (selectedMortgageType === "buy") {
        lines.push(`  Down Payment:      ${fmt(answers.downPayment)}`);
        lines.push(`  Target Price:      ${fmt(answers.homeValue)}`);
      } else {
        lines.push(`  Mortgage Balance:  ${fmt(answers.mortgageBalance)}`);
      }
    }

    lines.push(divider);
    lines.push(`ESTIMATE: ${estimateResult.type}`);
    lines.push(`  ${fmt(estimateResult.low)} – ${fmt(estimateResult.high)}`);

    const hasScenarios =
      scenarioAdjustments.incomeBoost > 0 ||
      scenarioAdjustments.debtReduction > 0 ||
      scenarioAdjustments.creditImprovement > 0 ||
      scenarioAdjustments.downPaymentBoost > 0;

    if (hasScenarios) {
      lines.push(divider);
      lines.push("SCENARIOS EXPLORED");
      if (scenarioAdjustments.incomeBoost > 0)
        lines.push(`  • Income increase of ${fmt(scenarioAdjustments.incomeBoost)}`);
      if (scenarioAdjustments.debtReduction > 0)
        lines.push(`  • Monthly debt reduction of ${fmt(scenarioAdjustments.debtReduction)}`);
      if (scenarioAdjustments.creditImprovement > 0)
        lines.push(`  • Credit improvement of ${scenarioAdjustments.creditImprovement} tier(s)`);
      if (scenarioAdjustments.downPaymentBoost > 0)
        lines.push(`  • Down payment increase of ${fmt(scenarioAdjustments.downPaymentBoost)}`);
    }

    if (userQuestions.length > 0) {
      lines.push(divider);
      lines.push("QUESTIONS THE CLIENT ASKED");
      userQuestions.forEach((q, i) => {
        lines.push(`  ${i + 1}. ${q.content}`);
      });
    }

    lines.push(divider);
    lines.push("LoansBetter Mortgage  |  (702) 727-9713");
    lines.push("This brief is for loan officer use and is not a loan commitment.");

    return lines.join("\n");
  }, [refCode, selectedMortgageType, answers, estimateResult, scenarioAdjustments, userQuestions, today]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildBrief());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback: select text
    }
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
            We've prepared a complete summary of your profile and questions for your loan officer.
          </p>
        </div>

        {/* Call CTA */}
        <div className="bg-primary rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
          <div>
            <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider mb-1">Speak with a Loan Officer Now</p>
            <p className="text-primary-foreground text-2xl font-bold font-serif">Call (702) 727-9713</p>
            <p className="text-primary-foreground/70 text-sm mt-1">Available Mon–Sat, 8am–7pm</p>
          </div>
          <a
            href="tel:7027279713"
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
            <span className="text-sm text-muted-foreground">{today}</span>
          </div>

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Goal</h3>
            <p className="text-2xl font-serif text-foreground">{getTypeLabel(selectedMortgageType)}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Profile</h3>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-base">
              {selectedMortgageType === "reverse" ? (
                <>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Age</span>
                    <span className="font-medium text-foreground">{answers.age} years old</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Home Value</span>
                    <span className="font-medium text-foreground">{fmt(answers.homeValue)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Credit Score</span>
                    <span className="font-medium text-foreground">{answers.creditScore}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Mortgage Balance</span>
                    <span className="font-medium text-foreground">{fmt(answers.mortgageBalance)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Annual Income</span>
                    <span className="font-medium text-foreground">{fmt(answers.income)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Annual Income</span>
                    <span className="font-medium text-foreground">{fmt(answers.income)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Monthly Debt</span>
                    <span className="font-medium text-foreground">{fmt(answers.monthlyDebt)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Credit Score</span>
                    <span className="font-medium text-foreground">{answers.creditScore}</span>
                  </div>
                  {selectedMortgageType === "buy" ? (
                    <>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Down Payment</span>
                        <span className="font-medium text-foreground">{fmt(answers.downPayment)}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/50 pb-2">
                        <span className="text-muted-foreground">Target Home Price</span>
                        <span className="font-medium text-foreground">{fmt(answers.homeValue)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground">Mortgage Balance</span>
                      <span className="font-medium text-foreground">{fmt(answers.mortgageBalance)}</span>
                    </div>
                  )}
                </>
              )}
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

          {(scenarioAdjustments.incomeBoost > 0 || scenarioAdjustments.debtReduction > 0 || scenarioAdjustments.creditImprovement > 0 || scenarioAdjustments.downPaymentBoost > 0) && (
            <section>
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Scenarios Explored</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                {scenarioAdjustments.incomeBoost > 0 && <li>Explored increasing income by {fmt(scenarioAdjustments.incomeBoost)}</li>}
                {scenarioAdjustments.debtReduction > 0 && <li>Explored reducing monthly debt by {fmt(scenarioAdjustments.debtReduction)}</li>}
                {scenarioAdjustments.creditImprovement > 0 && <li>Explored improving credit score by {scenarioAdjustments.creditImprovement} tier(s)</li>}
                {scenarioAdjustments.downPaymentBoost > 0 && <li>Explored increasing down payment by {fmt(scenarioAdjustments.downPaymentBoost)}</li>}
              </ul>
            </section>
          )}

          {/* Questions Asked */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">Questions Asked</h3>
            </div>
            {userQuestions.length > 0 ? (
              <ul className="space-y-3">
                {userQuestions.map((msg, i) => (
                  <li key={i} className="bg-secondary p-3 rounded-lg text-sm text-foreground flex gap-3">
                    <span className="text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                    <span>"{msg.content}"</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic text-sm">No questions were asked in the chat.</p>
            )}
          </section>
        </div>

        {/* Loan Officer Brief */}
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg text-foreground">Loan Officer Brief</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Copy this and paste it directly into your CRM, email, or notes. Your loan officer gets the full picture instantly.
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Reference</p>
              <p className="font-mono font-bold text-xl text-primary">{refCode}</p>
            </div>
          </div>

          {/* Formatted brief preview */}
          <pre className="bg-secondary/60 border border-border rounded-xl p-5 text-xs text-foreground font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
            {buildBrief()}
          </pre>

          <Button
            onClick={handleCopy}
            size="lg"
            className="w-full h-14 rounded-full text-base font-semibold"
            data-testid="button-copy-brief"
          >
            {copied ? (
              <><Check className="w-5 h-5 mr-2" /> Copied to Clipboard</>
            ) : (
              <><Copy className="w-5 h-5 mr-2" /> Copy Client Brief</>
            )}
          </Button>
        </div>

        <div className="flex justify-center mt-4">
          <a
            href="tel:7027279713"
            data-testid="link-call-loan-officer-footer"
            className="inline-flex items-center justify-center gap-2 h-14 px-10 rounded-full bg-primary text-primary-foreground font-medium text-base hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          >
            <Phone className="w-5 h-5" />
            Call (702) 727-9713
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4 pb-8">
          This summary is generated for your convenience and is not a loan application or financial commitment.
        </p>

      </div>
    </div>
  );
}
