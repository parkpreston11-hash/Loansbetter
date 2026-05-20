import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage, CreditScoreRange } from "@/context/MortgageContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

  if (!selectedMortgageType) {
    setLocation("/start");
    return null;
  }

  const isBuy = selectedMortgageType === "buy";
  const isReverse = selectedMortgageType === "reverse";
  const totalSteps = 5;

  const handleNext = () => {
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
                value={[Math.min(answers.income, 5000000)]}
                min={0}
                max={5000000}
                step={10000}
                onValueChange={(val) => updateAnswer("income", val[0])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$5M+</span>
              </div>
            </div>
          </div>
        );

      case 1:
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

      case 2: {
        const ranges: CreditScoreRange[] = ["Below 580", "580–619", "620–679", "680–739", "740 or above"];
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              What is your credit score range?
            </h2>
            <div className="flex flex-col gap-3 py-4">
              {ranges.map((range) => (
                <button
                  key={range}
                  onClick={() => updateAnswer("creditScore", range)}
                  className={`w-full p-4 rounded-xl border text-left text-lg transition-all ${
                    answers.creditScore === range
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        );
      }

      case 3:
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

      case 4:
        if (isBuy) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What home price range are you targeting?
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
        if (isReverse) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
                What is your approximate annual income or pension?
              </h2>
              <p className="text-muted-foreground">Include Social Security, pension, retirement distributions, or other income sources.</p>
              <div className="py-4 space-y-6">
                <div className="text-4xl font-bold text-primary text-center">{formatCurrency(answers.income)}</div>
                <CurrencyInput value={answers.income} onChange={(v) => updateAnswer("income", v)} />
                <Slider
                  value={[Math.min(answers.income, 5000000)]}
                  min={0}
                  max={5000000}
                  step={10000}
                  onValueChange={(val) => updateAnswer("income", val[0])}
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
    }
  };

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
      <div className="container mx-auto px-4 py-8 max-w-2xl flex items-center justify-between border-t border-border/50">
        <Button variant="ghost" onClick={handleBack} className="text-muted-foreground" data-testid="button-back">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="px-8 rounded-full" data-testid="button-next">
          {step === totalSteps - 1 ? "See My Results" : "Next"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
