import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage, CreditScoreRange, EmploymentType, LoanType, RefiGoal, PropertyType, LoanPurpose, CURRENT_MARKET_RATE } from "@/context/MortgageContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight, Briefcase, Building2, Sunset, XCircle } from "lucide-react";
import { QUESTION_COUNT } from "@/lib/constants";

function CurrencyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [raw, setRaw] = useState("");
  const [focused, setFocused] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const handleFocus = () => {
    setFocused(true);
    setRaw(value === 0 ? "" : String(value));
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseInt(raw.replace(/\D/g, ""), 10);
    if (!isNaN(parsed)) onChange(parsed);
    setRaw("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setRaw(digits);
    const parsed = parseInt(digits, 10);
    if (!isNaN(parsed)) onChange(parsed);
  };

  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">$</span>
      <Input
        value={focused ? raw : formatCurrency(value).replace("$", "")}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputMode="numeric"
        className="pl-8 h-14 text-lg font-semibold text-center rounded-xl border-border bg-card focus:border-primary"
      />
    </div>
  );
}

export default function Questions() {
  const [, setLocation] = useLocation();
  const { selectedMortgageType, answers, updateAnswer, calculateEstimate } = useMortgage();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [shake, setShake] = useState(false);

  if (!selectedMortgageType) {
    setLocation("/start");
    return null;
  }

  const [disqualReason, setDisqualReason] = useState<string | null>(null);

  const isBuy = selectedMortgageType === "buy";
  const isReverse = selectedMortgageType === "reverse";
  const isCashout = selectedMortgageType === "cashout";
  const isRefi = selectedMortgageType === "refinance";
  const totalSteps = isRefi || isReverse ? 9 : isCashout ? 8 : 7;

  const isStepComplete = (s: number): boolean => {
    switch (s) {
      case 0:
        return (answers.fullName ?? "").trim().length > 0;
      case 1:
        if (isReverse) return true; // age slider min 62, always valid
        return answers.income > 0;
      case 2:
        if (isReverse) return answers.homeValue > 0;
        return true; // monthly debt $0 is a valid real answer
      case 3:
        return !!answers.creditScore;
      case 4:
        if (isReverse) return true; // $0 balance is explicitly valid
        if (isCashout) return !!answers.loanType; // loan type required
        if (isRefi) return answers.mortgageBalance > 0;
        return answers.downPayment > 0;
      case 5:
        if (isBuy || isCashout) return answers.homeValue > 0;
        if (isReverse) return answers.income > 0;
        if (isRefi) return answers.currentInterestRate > 0;
        return answers.mortgageBalance > 0;
      case 6:
        if (isCashout) return answers.mortgageBalance > 0;
        if (isRefi) return answers.homeValue > 0;
        if (isReverse) return !!answers.propertyType;
        return !!answers.employmentType; // buy ends here
      case 7:
        if (isCashout) return !!answers.employmentType;
        if (isRefi) return !!answers.refiGoal;
        if (isReverse) return !!answers.loanPurpose;
        return true;
      case 8:
        return !!answers.employmentType; // refi and reverse only
      default:
        return true;
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleNext = () => {
    if (!isStepComplete(step)) {
      triggerShake();
      return;
    }

    // Credit score gate (all loan types EXCEPT reverse mortgage)
    if (step === 3 && answers.creditScore === "500 or below" && !isReverse) {
      setDisqualReason(
        "Unfortunately we're unable to assist with a credit score of 500 or below. Most loan programs require a minimum score of 501. Consider working with a credit counselor to improve your score, then come back — we'd love to help."
      );
      return;
    }

    // Refi interest rate gate (step 5)
    if (step === 5 && isRefi) {
      const r = answers.currentInterestRate;
      const fmt = (n: number) => n.toFixed(3).replace(/\.?0+$/, "") + "%";
      if (r <= CURRENT_MARKET_RATE + 0.249) {
        if (r < CURRENT_MARKET_RATE) {
          setDisqualReason(
            `Your current rate of ${fmt(r)} is already below today's market rate of ~${fmt(CURRENT_MARKET_RATE)}. You have a great rate — refinancing wouldn't make financial sense and we wouldn't be able to lower it further. Come back if rates drop significantly!`
          );
        } else {
          setDisqualReason(
            `Your current rate of ${fmt(r)} is right at today's market rate of ~${fmt(CURRENT_MARKET_RATE)}. Refinancing wouldn't make a meaningful difference in your monthly payment.`
          );
        }
        return;
      }
    }

    // Cash-out equity gate: after mortgage balance is entered (step 6 for cashout)
    if (step === 6 && isCashout) {
      const ltvMultiplier = answers.loanType === "va" ? 0.9 : 0.8;
      const maxCashOut = answers.homeValue * ltvMultiplier - answers.mortgageBalance;
      if (maxCashOut < 25000) {
        const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        const pct = answers.loanType === "va" ? "90%" : "80%";
        setDisqualReason(
          `Based on your home value (${fmt.format(answers.homeValue)}) and mortgage balance (${fmt.format(answers.mortgageBalance)}), your maximum cash-out would be ${fmt.format(Math.max(0, maxCashOut))} (${pct} LTV) — below our $25,000 minimum. Unfortunately we can't help with this scenario.`
        );
        return;
      }
    }

    // Reverse mortgage equity gate: after mortgage balance is entered (step 4)
    if (step === 4 && isReverse) {
      const maxCashOut = answers.homeValue * 0.5 - answers.mortgageBalance;
      if (maxCashOut < 25000) {
        const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
        setDisqualReason(
          `Based on your home value (${fmt.format(answers.homeValue)}) and mortgage balance (${fmt.format(answers.mortgageBalance)}), your estimated reverse mortgage proceeds would be ${fmt.format(Math.max(0, maxCashOut))} — below our $25,000 minimum. Unfortunately we can't help with this scenario.`
        );
        return;
      }
    }

    if (step < totalSteps - 1) {
      setDirection(1);
      setStep(s => s + 1);
    } else {
      calculateEstimate();
      setLocation("/results");
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(s => s - 1);
    } else {
      setLocation("/start");
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);

  const renderQuestion = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What's your full name?
            </h2>
            <p className="text-muted-foreground">We'll include this on your loan officer brief.</p>
            <div className="py-4">
              <Input
                value={answers.fullName}
                onChange={(e) => updateAnswer("fullName", e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (answers.fullName ?? "").trim()) handleNext(); }}
                placeholder="e.g. Jane Smith"
                autoFocus
                className="h-16 text-xl font-semibold text-center rounded-2xl border-border bg-card focus:border-primary"
              />
            </div>
          </div>
        );

      case 1:
        if (isReverse) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is your current age?
              </h2>
              <p className="text-muted-foreground">Reverse mortgages are available to homeowners 62 and older.</p>
              <div className="py-8">
                <div className="text-5xl font-bold text-primary mb-8 text-center">{answers.age} yrs</div>
                <Slider
                  value={[answers.age]}
                  min={62}
                  max={95}
                  step={1}
                  onValueChange={(val) => updateAnswer("age", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-3">
                  <span>62</span>
                  <span>95+</span>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What's your approximate annual household income?
            </h2>
            <div className="py-4 space-y-6">
              <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.income)}</div>
              <CurrencyInput value={answers.income} onChange={(v) => updateAnswer("income", v)} />
              <Slider
                value={[Math.min(answers.income, 15000000)]}
                min={0}
                max={15000000}
                step={50000}
                onValueChange={(val) => updateAnswer("income", val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$15M+</span>
              </div>
            </div>
          </div>
        );

      case 2:
        if (isReverse) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is the estimated value of your home?
              </h2>
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.homeValue)}</div>
                <CurrencyInput value={answers.homeValue} onChange={(v) => updateAnswer("homeValue", v)} />
                <Slider
                  value={[Math.min(answers.homeValue, 30000000)]}
                  min={0}
                  max={30000000}
                  step={100000}
                  onValueChange={(val) => updateAnswer("homeValue", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>$30M+</span>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What are your current monthly debt payments?
            </h2>
            <p className="text-muted-foreground">Include car loans, student loans, and credit card minimums.</p>
            <div className="py-4 space-y-6">
              <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.monthlyDebt)}</div>
              <CurrencyInput value={answers.monthlyDebt} onChange={(v) => updateAnswer("monthlyDebt", v)} />
              <Slider
                value={[Math.min(answers.monthlyDebt, 500000)]}
                min={0}
                max={500000}
                step={500}
                onValueChange={(val) => updateAnswer("monthlyDebt", val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$500k+</span>
              </div>
            </div>
          </div>
        );

      case 3: {
        const ranges: CreditScoreRange[] = ["500 or below", "501–579", "580–619", "620–679", "680–739", "740 or above"];
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What is your credit score range?
            </h2>
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 rounded-full px-4 py-2">
              <svg className="w-3.5 h-3.5 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 01.75 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.461-.741-4.748-2.01-6.647" /></svg>
              No credit check happens here — ever. This is for estimation only.
            </div>
            <div className="flex flex-col gap-3 py-4">
              {ranges.map((range) => (
                <button
                  key={range}
                  onClick={() => updateAnswer("creditScore", range)}
                  className={`w-full p-4 rounded-xl border text-left text-lg transition-all ${
                    answers.creditScore === range
                      ? range === "500 or below"
                        ? "border-destructive bg-destructive/5 ring-1 ring-destructive"
                        : "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {range}
                  {range === "500 or below" && (
                    <span className="ml-2 text-sm text-destructive font-normal">(minimum not met)</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 4:
        if (isReverse) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is your current mortgage balance?
              </h2>
              <p className="text-muted-foreground">Enter $0 if your home is paid off.</p>
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.mortgageBalance)}</div>
                <CurrencyInput value={answers.mortgageBalance} onChange={(v) => updateAnswer("mortgageBalance", v)} />
                <Slider
                  value={[Math.min(answers.mortgageBalance, 5000000)]}
                  min={0}
                  max={5000000}
                  step={10000}
                  onValueChange={(val) => updateAnswer("mortgageBalance", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>$5M+</span>
                </div>
              </div>
            </div>
          );
        }
        if (isCashout) {
          const loanOptions: { value: LoanType; label: string; sub: string }[] = [
            { value: "conventional", label: "Conventional", sub: "Standard loan not backed by the government." },
            { value: "fha",         label: "FHA",          sub: "Insured by the Federal Housing Administration." },
            { value: "va",          label: "VA",           sub: "Guaranteed by the Dept. of Veterans Affairs — up to 90% LTV." },
          ];
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What type of loan do you currently have?
              </h2>
              <p className="text-muted-foreground">This affects your maximum cash-out percentage.</p>
              <div className="flex flex-col gap-3 py-4">
                {loanOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer("loanType", opt.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      answers.loanType === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <p className="text-lg font-semibold text-foreground">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        }
        if (isRefi) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is your current mortgage balance?
              </h2>
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.mortgageBalance)}</div>
                <CurrencyInput value={answers.mortgageBalance} onChange={(v) => updateAnswer("mortgageBalance", v)} />
                <Slider
                  value={[Math.min(answers.mortgageBalance, 5000000)]}
                  min={0} max={5000000} step={10000}
                  onValueChange={(val) => updateAnswer("mortgageBalance", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span><span>$5M+</span>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              How much have you saved for a down payment?
            </h2>
            <div className="py-4 space-y-6">
              <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.downPayment)}</div>
              <CurrencyInput value={answers.downPayment} onChange={(v) => updateAnswer("downPayment", v)} />
              <Slider
                value={[Math.min(answers.downPayment, 5000000)]}
                min={0}
                max={5000000}
                step={10000}
                onValueChange={(val) => updateAnswer("downPayment", val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$5M+</span>
              </div>
            </div>
          </div>
        );

      case 5:
        if (isBuy || isCashout) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                {isCashout ? "What is your home currently worth?" : "What home price range are you targeting?"}
              </h2>
              {isCashout && <p className="text-muted-foreground">Use your best estimate — a recent appraisal or online estimate works great.</p>}
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.homeValue)}</div>
                <CurrencyInput value={answers.homeValue} onChange={(v) => updateAnswer("homeValue", v)} />
                <Slider
                  value={[Math.min(answers.homeValue, 30000000)]}
                  min={0}
                  max={30000000}
                  step={100000}
                  onValueChange={(val) => updateAnswer("homeValue", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>$30M+</span>
                </div>
              </div>
            </div>
          );
        }
        if (isReverse) {
          return (
            <div className="space-y-10">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Tell us about your income
              </h2>

              {/* Other annual income */}
              <div className="space-y-3">
                <label className="font-medium text-foreground">Other annual income</label>
                <p className="text-sm text-muted-foreground">Wages, Social Security, rental income, investments, or distributions.</p>
                <div className="py-2 space-y-4">
                  <div className="text-3xl font-bold text-primary text-center">{formatCurrency(answers.income)}</div>
                  <CurrencyInput value={answers.income} onChange={(v) => updateAnswer("income", v)} />
                  <Slider
                    value={[Math.min(answers.income, 15000000)]}
                    min={0}
                    max={15000000}
                    step={50000}
                    onValueChange={(val) => updateAnswer("income", val[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$15M+</span>
                  </div>
                </div>
              </div>

              {/* Pension income */}
              <div className="space-y-3">
                <label className="font-medium text-foreground">Monthly pension income</label>
                <p className="text-sm text-muted-foreground">Regular payments from a pension, annuity, or structured retirement plan.</p>
                <div className="py-2 space-y-4">
                  <div className="text-3xl font-bold text-primary text-center">
                    {formatCurrency(answers.pensionIncome)}
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </div>
                  <CurrencyInput value={answers.pensionIncome} onChange={(v) => updateAnswer("pensionIncome", v)} />
                  <Slider
                    value={[Math.min(answers.pensionIncome, 50000)]}
                    min={0}
                    max={50000}
                    step={250}
                    onValueChange={(val) => updateAnswer("pensionIncome", val[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>$50,000/mo</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        if (isRefi) {
          const r = answers.currentInterestRate;
          const rateVerdict = r === 0 ? null
            : r < CURRENT_MARKET_RATE
              ? { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", text: `Your rate of ${r.toFixed(3).replace(/\.?0+$/, "")}% is below today's market rate — you already have a great rate.` }
              : r <= CURRENT_MARKET_RATE + 0.249
                ? { color: "text-amber-600", bg: "bg-amber-50 border-amber-200", text: `Your rate of ${r.toFixed(3).replace(/\.?0+$/, "")}% is right at today's market rate — refinancing wouldn't make a meaningful difference.` }
                : { color: "text-green-700", bg: "bg-green-50 border-green-200", text: `Your rate of ${r.toFixed(3).replace(/\.?0+$/, "")}% is above today's market rate of ~${CURRENT_MARKET_RATE}% — we can definitely lower it!` };
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is your current interest rate?
              </h2>
              <p className="text-muted-foreground">Today's market rate is approximately <strong>{CURRENT_MARKET_RATE}%</strong>.</p>
              <div className="py-4 space-y-6">
                <div className="text-5xl font-bold text-primary text-center">
                  {r === 0 ? <span className="text-3xl text-muted-foreground">Move slider to set rate</span> : `${r.toFixed(3).replace(/\.?0+$/, "")}%`}
                </div>
                <Slider
                  value={[r === 0 ? 2 : r]}
                  min={2} max={15} step={0.125}
                  onValueChange={(val) => updateAnswer("currentInterestRate", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>2%</span><span>15%</span>
                </div>
                {rateVerdict && (
                  <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${rateVerdict.bg}`}>
                    <p className={`text-sm font-medium ${rateVerdict.color}`}>{rateVerdict.text}</p>
                  </div>
                )}
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What is your current mortgage balance?
            </h2>
            <div className="py-4 space-y-6">
              <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.mortgageBalance)}</div>
              <CurrencyInput value={answers.mortgageBalance} onChange={(v) => updateAnswer("mortgageBalance", v)} />
              <Slider
                value={[Math.min(answers.mortgageBalance, 5000000)]}
                min={0}
                max={5000000}
                step={10000}
                onValueChange={(val) => updateAnswer("mortgageBalance", val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$5M+</span>
              </div>
            </div>
          </div>
        );

      case 6: {
        // Cashout: mortgage balance; Refi: home value; Reverse: property type; Buy: employment (final)
        if (isCashout) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                How much do you still owe on your mortgage?
              </h2>
              <p className="text-muted-foreground">Enter your current outstanding balance.</p>
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.mortgageBalance)}</div>
                <CurrencyInput value={answers.mortgageBalance} onChange={(v) => updateAnswer("mortgageBalance", v)} />
                <Slider
                  value={[Math.min(answers.mortgageBalance, 5000000)]}
                  min={0}
                  max={5000000}
                  step={10000}
                  onValueChange={(val) => updateAnswer("mortgageBalance", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>$5M+</span>
                </div>
              </div>
            </div>
          );
        }
        if (isRefi) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is your home currently worth?
              </h2>
              <p className="text-muted-foreground">Your best estimate is fine — we use this to assess your equity position.</p>
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.homeValue)}</div>
                <CurrencyInput value={answers.homeValue} onChange={(v) => updateAnswer("homeValue", v)} />
                <Slider
                  value={[Math.min(answers.homeValue, 5000000)]}
                  min={0}
                  max={5000000}
                  step={10000}
                  onValueChange={(val) => updateAnswer("homeValue", val[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>$0</span>
                  <span>$5M+</span>
                </div>
              </div>
            </div>
          );
        }
        if (isReverse) {
          const propTypes: { value: PropertyType; label: string; sub: string }[] = [
            { value: "single-family", label: "Single Family Home", sub: "A standalone house on its own lot." },
            { value: "condo",         label: "Condominium",         sub: "A unit in a shared building or complex." },
            { value: "townhouse",     label: "Townhouse",           sub: "A multi-story home sharing walls with neighbors." },
            { value: "multi-family",  label: "Multi-Family (2–4 units)", sub: "A duplex, triplex, or fourplex." },
          ];
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What type of property is this?
              </h2>
              <p className="text-muted-foreground">Property type affects reverse mortgage eligibility and limits.</p>
              <div className="flex flex-col gap-3 py-4">
                {propTypes.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer("propertyType", opt.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      answers.propertyType === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        }
        // refi/reverse now have their own case 6 — this else handles employment for any remaining flow
        const employmentOptions: { value: EmploymentType; label: string; sub: string; icon: React.ReactNode }[] = [
          { value: "employed",      label: "Employed",      sub: "I receive a W-2 from an employer.",                   icon: <Briefcase className="w-6 h-6" /> },
          { value: "self-employed", label: "Self-Employed", sub: "I own a business, freelance, or receive 1099 income.", icon: <Building2 className="w-6 h-6" /> },
        ];
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Are you employed or self-employed?
            </h2>
            <p className="text-muted-foreground">This helps us tailor your document checklist.</p>
            <div className="flex flex-col gap-4 py-4">
              {employmentOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateAnswer("employmentType", opt.value)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-5 ${
                    answers.employmentType === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    answers.employmentType === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 7: {
        // Buy/Cashout: employment; Refi: refi goal; Reverse: loan purpose
        if (isCashout) {
          const empOpts: { value: EmploymentType; label: string; sub: string; icon: React.ReactNode }[] = [
            { value: "employed",      label: "Employed",      sub: "I receive a W-2 from an employer.",                   icon: <Briefcase className="w-6 h-6" /> },
            { value: "self-employed", label: "Self-Employed", sub: "I own a business, freelance, or receive 1099 income.", icon: <Building2 className="w-6 h-6" /> },
          ];
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                Are you employed or self-employed?
              </h2>
              <p className="text-muted-foreground">This helps us tailor your document checklist.</p>
              <div className="flex flex-col gap-4 py-4">
                {empOpts.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer("employmentType", opt.value)}
                    className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-5 ${
                      answers.employmentType === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      answers.employmentType === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>
                      {opt.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">{opt.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        }
        if (isRefi) {
          const refiGoals: { value: RefiGoal; label: string; sub: string }[] = [
            { value: "lower-rate",     label: "Get a lower interest rate",  sub: "Reduce what I pay the bank each month." },
            { value: "lower-payment",  label: "Lower my monthly payment",   sub: "Free up cash flow each month." },
            { value: "pay-off-faster", label: "Pay off my home faster",     sub: "Switch to a shorter term and build equity quicker." },
            { value: "consolidate-debt", label: "Consolidate debt",         sub: "Roll high-interest debt into my mortgage." },
          ];
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What's your primary goal with refinancing?
              </h2>
              <p className="text-muted-foreground">This helps us recommend the right loan structure for you.</p>
              <div className="flex flex-col gap-3 py-4">
                {refiGoals.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateAnswer("refiGoal", opt.value)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      answers.refiGoal === opt.value
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-foreground">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        }
        // isReverse
        const loanPurposes: { value: LoanPurpose; label: string; sub: string }[] = [
          { value: "supplement-income",  label: "Supplement retirement income", sub: "Use equity to cover everyday living expenses." },
          { value: "medical",            label: "Cover medical costs",           sub: "Healthcare, prescriptions, or long-term care." },
          { value: "home-improvements",  label: "Fund home improvements",        sub: "Updates, repairs, or accessibility modifications." },
          { value: "debt-payoff",        label: "Pay off existing debt",         sub: "Eliminate a mortgage balance or other obligations." },
        ];
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What would you use the funds for?
            </h2>
            <p className="text-muted-foreground">Helps us tailor your loan structure and next steps.</p>
            <div className="flex flex-col gap-3 py-4">
              {loanPurposes.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateAnswer("loanPurpose", opt.value)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    answers.loanPurpose === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <p className="font-semibold text-foreground">{opt.label}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 8: {
        // Refi and Reverse: employment (final step)
        const empOpts8: { value: EmploymentType; label: string; sub: string; icon: React.ReactNode }[] = [
          { value: "employed",      label: "Employed",      sub: "I receive a W-2 from an employer.",                   icon: <Briefcase className="w-6 h-6" /> },
          { value: "self-employed", label: "Self-Employed", sub: "I own a business, freelance, or receive 1099 income.", icon: <Building2 className="w-6 h-6" /> },
          ...(isReverse ? [{ value: "retired" as EmploymentType, label: "Retired", sub: "I no longer work and live on retirement income, pension, or savings.", icon: <Sunset className="w-6 h-6" /> }] : []),
        ];
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              {isReverse ? "What is your employment status?" : "Are you employed or self-employed?"}
            </h2>
            <p className="text-muted-foreground">This helps us tailor your document checklist.</p>
            <div className="flex flex-col gap-4 py-4">
              {empOpts8.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateAnswer("employmentType", opt.value)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all flex items-center gap-5 ${
                    answers.employmentType === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    answers.employmentType === opt.value ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                  }`}>
                    {opt.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-lg">{opt.label}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{opt.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (disqualReason) {
    return (
      <div className="min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center bg-background px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-lg w-full bg-card border border-border rounded-3xl p-10 flex flex-col items-center gap-6 text-center shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-9 h-9 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">We're sorry — we can't help with this</h2>
            <p className="text-muted-foreground leading-relaxed">{disqualReason}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={() => { setDisqualReason(null); setDirection(-1); setStep(step); }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <a
              href="tel:7144944172"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full px-6 h-10 font-semibold text-sm hover:bg-primary/90 transition-all"
            >
              Call 714-494-4172
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-5rem)] flex flex-col bg-background">
      {/* Progress Header */}
      <div className="w-full h-2 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Step {step + 1} of {totalSteps}</span>
        <span className="capitalize text-xs bg-secondary px-3 py-1 rounded-full">
          {selectedMortgageType === "buy" ? "Buy a Home" : selectedMortgageType === "refinance" ? "Refinance" : selectedMortgageType === "cashout" ? "Cash-Out" : "Reverse Mortgage"}
        </span>
      </div>

      {/* Question Content */}
      <div className="flex-1 container mx-auto px-4 py-12 flex flex-col justify-center max-w-2xl relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-full"
          >
            {renderQuestion()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="container mx-auto px-4 py-8 max-w-2xl border-t border-border/50">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack} className="text-muted-foreground" data-testid="button-back">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex flex-col items-end gap-1.5">
            {!isStepComplete(step) && (
              <p className="text-xs text-muted-foreground animate-in fade-in">
                {step === 0
                  ? "Please enter your full name to continue."
                  : (step === 3 || step === 7 || (step === 4 && isCashout) || (step === 6 && !isCashout))
                    ? "Please select an option to continue."
                    : "Please enter a value greater than $0 to continue."}
              </p>
            )}
            <motion.div
              animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            >
              <Button
                onClick={handleNext}
                size="lg"
                className={`px-8 rounded-full transition-opacity ${!isStepComplete(step) ? "opacity-50 cursor-not-allowed" : ""}`}
                data-testid="button-next"
              >
                {step === totalSteps - 1 ? "See My Results" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
