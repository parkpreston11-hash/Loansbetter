import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useMortgage } from "@/context/MortgageContext";
import { Slider } from "@/components/ui/slider";
import { MessageCircle, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Results() {
  const [, setLocation] = useLocation();
  const { estimateResult, answers, selectedMortgageType, scenarioAdjustments, setScenarioAdjustments, calculateEstimate } = useMortgage();
  const [adjustedEstimate, setAdjustedEstimate] = useState(estimateResult);

  useEffect(() => {
    if (!estimateResult) {
      setLocation("/start");
    }
  }, [estimateResult, setLocation]);

  useEffect(() => {
    if (!estimateResult) return;
    
    // Calculate adjusted estimate dynamically based on sliders
    const { incomeBoost, debtReduction, creditImprovement, downPaymentBoost } = scenarioAdjustments;
    
    const adjIncome = answers.income + incomeBoost;
    const adjDebt = Math.max(0, answers.monthlyDebt - debtReduction);
    const adjDownPayment = answers.downPayment + downPaymentBoost;
    
    // Base math (simplified for frontend scenario)
    let base = adjIncome * 3.5;
    
    // Very dummy credit improvement logic
    let creditMultiplier = 1.0;
    const scoreMap: Record<string, number> = {
      "Below 580": 0.7, "580–619": 0.8, "620–679": 0.9, "680–739": 1.0, "740 or above": 1.1
    };
    let currentMult = scoreMap[answers.creditScore] || 1.0;
    // Boost multiplier roughly by 0.1 per tier
    creditMultiplier = Math.min(1.1, currentMult + (creditImprovement * 0.1));

    let debtRed = adjDebt * 12 * 2;

    if (selectedMortgageType === "buy") {
      let low = Math.max(50000, (base - debtRed + adjDownPayment * 2) * creditMultiplier * 0.9);
      let high = Math.max(60000, (base - debtRed + adjDownPayment * 2) * creditMultiplier * 1.1);
      setAdjustedEstimate({ low, high, type: "Target Home Price" });
    } else {
      // Dummy logic for refi/cashout scenario updates
      let factor = 1 + (incomeBoost*0.00001) + (creditImprovement*0.05);
      setAdjustedEstimate({
        low: estimateResult.low * factor,
        high: estimateResult.high * factor,
        type: estimateResult.type
      });
    }
  }, [scenarioAdjustments, answers, estimateResult, selectedMortgageType]);

  if (!estimateResult || !adjustedEstimate) return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background pb-20">
      {/* Top Results Section */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-primary-foreground/80 font-medium tracking-wide uppercase text-sm mb-4">Estimated {adjustedEstimate.type}</p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight">
              {formatCurrency(adjustedEstimate.low)} – {formatCurrency(adjustedEstimate.high)}
            </h1>
            <p className="mt-6 text-xl text-primary-foreground/90 font-light">
              Based on what you shared, you may qualify for {selectedMortgageType === 'buy' ? 'homes' : 'options'} in this range.
            </p>
          </motion.div>
          
          <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl p-4 flex items-start gap-3 text-left text-sm max-w-2xl mx-auto mt-8">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-primary-foreground/70" />
            <p className="text-primary-foreground/80 leading-relaxed">
              This estimate is for informational purposes only. It does not represent a loan offer or financial advice. Actual results depend on lender guidelines and your complete financial profile.
            </p>
          </div>
        </div>
      </section>

      {/* Scenario Explorer */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-serif text-3xl font-semibold mb-8">What if I...</h2>
        
        <div className="grid md:grid-cols-2 gap-12 bg-card border border-border p-8 rounded-3xl shadow-sm">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-4">
                <label className="font-medium text-foreground">Increase annual income by</label>
                <span className="text-primary font-semibold">+{formatCurrency(scenarioAdjustments.incomeBoost)}</span>
              </div>
              <Slider 
                value={[scenarioAdjustments.incomeBoost]} 
                min={0} max={50000} step={5000} 
                onValueChange={(val) => setScenarioAdjustments(s => ({...s, incomeBoost: val[0]}))}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-4">
                <label className="font-medium text-foreground">Reduce monthly debt by</label>
                <span className="text-primary font-semibold">-{formatCurrency(scenarioAdjustments.debtReduction)}</span>
              </div>
              <Slider 
                value={[scenarioAdjustments.debtReduction]} 
                min={0} max={2000} step={100} 
                onValueChange={(val) => setScenarioAdjustments(s => ({...s, debtReduction: val[0]}))}
              />
            </div>

            <div>
              <div className="flex justify-between mb-4">
                <label className="font-medium text-foreground">Improve credit score by</label>
                <span className="text-primary font-semibold">{scenarioAdjustments.creditImprovement} tiers</span>
              </div>
              <Slider 
                value={[scenarioAdjustments.creditImprovement]} 
                min={0} max={2} step={1} 
                onValueChange={(val) => setScenarioAdjustments(s => ({...s, creditImprovement: val[0]}))}
              />
            </div>

            {selectedMortgageType === "buy" && (
              <div>
                <div className="flex justify-between mb-4">
                  <label className="font-medium text-foreground">Increase down payment by</label>
                  <span className="text-primary font-semibold">+{formatCurrency(scenarioAdjustments.downPaymentBoost)}</span>
                </div>
                <Slider 
                  value={[scenarioAdjustments.downPaymentBoost]} 
                  min={0} max={50000} step={5000} 
                  onValueChange={(val) => setScenarioAdjustments(s => ({...s, downPaymentBoost: val[0]}))}
                />
              </div>
            )}
          </div>
          
          <div className="bg-secondary/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center border border-border/50">
            <p className="text-muted-foreground mb-4">New Estimated Range</p>
            <motion.div 
              key={`${adjustedEstimate.low}-${adjustedEstimate.high}`}
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold text-primary"
            >
              {formatCurrency(adjustedEstimate.low)} – {formatCurrency(adjustedEstimate.high)}
            </motion.div>
            <p className="text-sm text-muted-foreground mt-4 px-4">
              Small changes in your financial picture can have a significant impact on your options.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Actions */}
      <section className="max-w-4xl mx-auto px-4 mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto">
          <Link href="/handoff">
            <FileText className="w-5 h-5 mr-2" />
            Talk to a Loan Officer
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg w-full sm:w-auto border-primary text-primary hover:bg-primary/5">
          <Link href="/chat">
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat with AI Assistant
          </Link>
        </Button>
      </section>
    </div>
  );
}