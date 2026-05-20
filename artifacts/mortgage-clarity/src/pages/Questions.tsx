import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage, CreditScoreRange } from "@/context/MortgageContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight } from "lucide-react";

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

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const renderQuestion = () => {
    switch(step) {
      case 0:
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">What's your approximate annual household income?</h2>
            <div className="py-8">
              <div className="text-4xl font-bold text-primary mb-8 text-center">{formatCurrency(answers.income)}</div>
              <Slider
                value={[answers.income]}
                min={30000}
                max={300000}
                step={5000}
                onValueChange={(val) => updateAnswer("income", val[0])}
                className="w-full"
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">What are your current monthly debt payments?</h2>
            <p className="text-muted-foreground">Include car loans, student loans, and credit card minimums.</p>
            <div className="py-8">
              <div className="text-4xl font-bold text-primary mb-8 text-center">{formatCurrency(answers.monthlyDebt)}</div>
              <Slider
                value={[answers.monthlyDebt]}
                min={0}
                max={5000}
                step={100}
                onValueChange={(val) => updateAnswer("monthlyDebt", val[0])}
                className="w-full"
              />
            </div>
          </div>
        );
      case 2:
        const ranges: CreditScoreRange[] = ["Below 580", "580–619", "620–679", "680–739", "740 or above"];
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">What is your credit score range?</h2>
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
      case 3:
        return (
          <div className="space-y-8">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">How much have you saved for a down payment?</h2>
            <div className="py-8">
              <div className="text-4xl font-bold text-primary mb-8 text-center">{formatCurrency(answers.downPayment)}</div>
              <Slider
                value={[answers.downPayment]}
                min={0}
                max={200000}
                step={5000}
                onValueChange={(val) => updateAnswer("downPayment", val[0])}
                className="w-full"
              />
            </div>
          </div>
        );
      case 4:
        if (isBuy) {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">What home price range are you targeting?</h2>
              <div className="py-8">
                <div className="text-4xl font-bold text-primary mb-8 text-center">{formatCurrency(answers.homeValue)}</div>
                <Slider
                  value={[answers.homeValue]}
                  min={100000}
                  max={1000000}
                  step={25000}
                  onValueChange={(val) => updateAnswer("homeValue", val[0])}
                  className="w-full"
                />
              </div>
            </div>
          );
        } else {
          return (
            <div className="space-y-8">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">What is your current mortgage balance?</h2>
              <div className="py-8">
                <div className="text-4xl font-bold text-primary mb-8 text-center">{formatCurrency(answers.mortgageBalance)}</div>
                <Slider
                  value={[answers.mortgageBalance]}
                  min={50000}
                  max={800000}
                  step={10000}
                  onValueChange={(val) => updateAnswer("mortgageBalance", val[0])}
                  className="w-full"
                />
              </div>
            </div>
          );
        }
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
      <div className="container mx-auto px-4 py-4 flex items-center text-sm font-medium text-muted-foreground">
        Step {step + 1} of {totalSteps}
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
        <Button variant="ghost" onClick={handleBack} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={handleNext} size="lg" className="px-8 rounded-full">
          {step === totalSteps - 1 ? "See My Results" : "Next"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}