import { useMortgage } from "@/context/MortgageContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, CalendarCheck, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Handoff() {
  const { selectedMortgageType, answers, estimateResult, scenarioAdjustments, chatHistory } = useMortgage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  if (!selectedMortgageType || !estimateResult) {
    setLocation("/start");
    return null;
  }

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  const getTypeLabel = (type: string | null) => {
    if (type === "buy") return "Buy a Home";
    if (type === "refinance") return "Refinance";
    if (type === "cashout") return "Cash-Out Refinance";
    return "Unknown";
  };

  const handleDownload = () => {
    toast({
      title: "Feature coming soon",
      description: "In a real app, this would generate a PDF to share with your loan officer.",
    });
  };

  const handleSchedule = () => {
    toast({
      title: "Feature coming soon",
      description: "This would connect you with a licensed loan officer in your area.",
    });
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-secondary/30 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/results">
            <Button variant="ghost" className="text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
        </div>

        <div className="text-center space-y-4">
          <h1 className="font-serif text-4xl md:text-5xl font-semibold text-foreground">You're Ready to Talk</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            We've prepared a summary of everything you've explored so you don't have to repeat yourself when speaking with a lender.
          </p>
        </div>

        <div className="bg-card border border-border shadow-md rounded-3xl p-8 md:p-12 space-y-10">
          <div className="flex items-center justify-between border-b border-border pb-6">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-6 h-6" />
              <span className="font-semibold text-lg">ClearPath Summary</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Prepared {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Your Goal</h3>
            <p className="text-2xl font-serif text-foreground">{getTypeLabel(selectedMortgageType)}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Your Profile</h3>
            <div className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-base">
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Annual Income</span>
                <span className="font-medium text-foreground">{formatCurrency(answers.income)}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Monthly Debt</span>
                <span className="font-medium text-foreground">{formatCurrency(answers.monthlyDebt)}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Credit Score</span>
                <span className="font-medium text-foreground">{answers.creditScore}</span>
              </div>
              
              {selectedMortgageType === "buy" ? (
                <>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-medium text-foreground">{formatCurrency(answers.downPayment)}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-muted-foreground">Target Home Price</span>
                    <span className="font-medium text-foreground">{formatCurrency(answers.homeValue)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-muted-foreground">Mortgage Balance</span>
                  <span className="font-medium text-foreground">{formatCurrency(answers.mortgageBalance)}</span>
                </div>
              )}
            </div>
          </section>

          <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
            <h3 className="text-sm font-semibold tracking-wider text-primary uppercase mb-2">Base Estimate</h3>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <span className="text-muted-foreground">{estimateResult.type}</span>
              <span className="text-3xl font-bold text-primary">
                {formatCurrency(estimateResult.low)} – {formatCurrency(estimateResult.high)}
              </span>
            </div>
          </section>

          {(scenarioAdjustments.incomeBoost > 0 || scenarioAdjustments.debtReduction > 0 || scenarioAdjustments.creditImprovement > 0 || scenarioAdjustments.downPaymentBoost > 0) && (
            <section>
              <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Scenarios Explored</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                {scenarioAdjustments.incomeBoost > 0 && <li>Explored increasing income by {formatCurrency(scenarioAdjustments.incomeBoost)}</li>}
                {scenarioAdjustments.debtReduction > 0 && <li>Explored reducing monthly debt by {formatCurrency(scenarioAdjustments.debtReduction)}</li>}
                {scenarioAdjustments.creditImprovement > 0 && <li>Explored improving credit score by {scenarioAdjustments.creditImprovement} tier(s)</li>}
                {scenarioAdjustments.downPaymentBoost > 0 && <li>Explored increasing down payment by {formatCurrency(scenarioAdjustments.downPaymentBoost)}</li>}
              </ul>
            </section>
          )}

          <section>
            <h3 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase mb-4">Questions Asked</h3>
            {chatHistory.filter(m => m.role === 'user').length > 0 ? (
              <ul className="space-y-3">
                {chatHistory.filter(m => m.role === 'user').map((msg, i) => (
                  <li key={i} className="bg-secondary p-3 rounded-lg text-sm text-foreground">
                    "{msg.content}"
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground italic">No questions asked yet.</p>
            )}
          </section>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button onClick={handleDownload} variant="outline" size="lg" className="h-14 px-8 rounded-full bg-card">
            <Download className="w-5 h-5 mr-2" /> Download Summary
          </Button>
          <Button onClick={handleSchedule} size="lg" className="h-14 px-8 rounded-full">
            <CalendarCheck className="w-5 h-5 mr-2" /> Schedule a Consultation
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          This summary is generated for your convenience and is not a loan application or financial commitment.
        </p>

      </div>
    </div>
  );
}