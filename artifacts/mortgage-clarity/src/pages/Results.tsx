import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage, LOAN_TERM_RATES } from "@/context/MortgageContext";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { MessageCircle, FileText, Info, Save, Home, ExternalLink, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Results() {
  const [, setLocation] = useLocation();
  const { estimateResult, answers, selectedMortgageType, scenarioAdjustments, setScenarioAdjustments, calculateEstimate } = useMortgage();
  const [adjustedEstimate, setAdjustedEstimate] = useState(estimateResult);
  const [showZillow, setShowZillow] = useState(false);
  const [zillowLocation, setZillowLocation] = useState("");
  const [intentBannerVisible, setIntentBannerVisible] = useState(false);
  const [intentDismissed, setIntentDismissed] = useState(false);

  const isBuy = selectedMortgageType === "buy";

  const openZillow = () => {
    if (!zillowLocation.trim()) return;
    const loc = zillowLocation.trim().replace(/\s+/g, "-").toLowerCase();
    const low = Math.round((estimateResult?.low ?? 0) / 10000) * 10000;
    const high = Math.round((estimateResult?.high ?? 0) / 10000) * 10000;
    const url = `https://www.zillow.com/homes/for_sale/${encodeURIComponent(loc)}/${low}-${high}_price/`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!estimateResult) {
      setLocation("/start");
    }
  }, [estimateResult, setLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setIntentBannerVisible(true), 14000);
    const handleVisibility = () => { if (document.hidden) setIntentBannerVisible(true); };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", handleVisibility); };
  }, []);

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

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="inline-flex items-center gap-1.5 mt-6 text-xs text-primary-foreground/60 bg-primary-foreground/10 rounded-full px-3 py-1.5"
          >
            <Save className="w-3 h-3" />
            Progress saved — you can close this tab and return anytime
          </motion.div>

          {/* What this means in plain terms */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 bg-primary-foreground/8 border border-primary-foreground/20 rounded-2xl p-5 max-w-2xl mx-auto text-left"
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/50 mb-2">What this means in simple terms</p>
            <p className="text-sm text-primary-foreground/80 leading-relaxed">
              {selectedMortgageType === "buy"
                ? "Your income and savings suggest real buying power in this range. Use the scenario explorer below to see how small changes — like a larger down payment or credit improvement — shift your options."
                : selectedMortgageType === "refinance"
                ? "Your current rate is meaningfully above today's market. Refinancing could reduce your monthly payment and lower total interest paid over the life of the loan — potentially by tens of thousands of dollars."
                : selectedMortgageType === "cashout"
                ? "You have meaningful equity in your home. A cash-out refinance lets you access it as a lump sum while consolidating it into a single monthly payment at today's rates."
                : "Your home equity provides real options. A reverse mortgage can convert that value into income or a line of credit — with no required monthly payments as long as you live in the home."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Decision Clarity Indicator */}
      {(() => {
        const highTypes = ["cashout", "reverse"];
        const modTypes = ["refi"];
        const lowCredit = ["Below 580", "580–619"].includes(answers.creditScore ?? "");
        const level = highTypes.includes(selectedMortgageType ?? "")
          ? 3
          : modTypes.includes(selectedMortgageType ?? "") || lowCredit
          ? 2
          : 1;
        const levels = [
          { label: "Low complexity", sub: "Simple decision", detail: "Your situation is relatively straightforward. A single lender conversation is likely all you need to move forward.", active: "bg-emerald-400", text: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
          { label: "Moderate complexity", sub: "Review options carefully", detail: "There are a few variables worth exploring before you commit. The scenario tool below can help clarify your path.", active: "bg-amber-400", text: "text-amber-700", badge: "bg-amber-50 text-amber-700 border-amber-200" },
          { label: "High-impact decision", sub: "Explore scenarios before acting", detail: "This type of decision benefits from careful planning. Take your time, compare options, and feel free to ask questions — there's no rush.", active: "bg-sky-400", text: "text-sky-700", badge: "bg-sky-50 text-sky-700 border-sky-200" },
        ];
        const current = levels[level - 1];
        return (
          <section className="max-w-4xl mx-auto px-4 pt-12 pb-4">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <BarChart2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold text-foreground">Decision Clarity Indicator</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Understand how significant this decision is so you can move forward at the right pace.</p>
                </div>
              </div>
              {/* Segmented bar */}
              <div className="flex gap-2 mb-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${n <= level ? current.active : "bg-secondary"}`} />
                ))}
              </div>
              {/* Current level label */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${current.badge}`}>
                  Level {level} of 3 — {current.label}
                </span>
              </div>
              <p className={`font-semibold mb-1 ${current.text}`}>{current.sub}</p>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{current.detail}</p>
            </motion.div>
          </section>
        );
      })()}

      {/* Smart Recommendation */}
      {(() => {
        const goodCredit = ["680–739", "740 or above"].includes(answers.creditScore ?? "");
        const fairCredit = ["620–679"].includes(answers.creditScore ?? "");
        const rec = selectedMortgageType === "buy"
          ? goodCredit
            ? { title: "A conventional loan looks like your strongest path.", detail: "Your credit and income profile aligns well with conventional financing. You have meaningful buying power — focus your search within your estimate range and ask a lender about rate locks.", action: "Talk to a Loan Officer" }
            : fairCredit
            ? { title: "An FHA loan may open more options for you.", detail: "FHA programs are designed for your credit range and require as little as 3.5% down. Your buying power is real — an FHA-backed loan may be your clearest path forward.", action: "Talk to a Loan Officer" }
            : { title: "Credit improvement may unlock significantly better terms.", detail: "Even a small improvement in your credit score can lower your rate and monthly payment substantially. Consider working with a credit advisor, then return — your estimate will improve.", action: "Chat with AI Assistant" }
          : selectedMortgageType === "refinance"
          ? { title: "Refinancing now could meaningfully reduce what you pay monthly.", detail: "Based on your rate, a refinance to current market rates could save you hundreds per month. Closing costs are typically recovered within 18–24 months for most borrowers.", action: "Talk to a Loan Officer" }
          : selectedMortgageType === "cashout"
          ? { title: "A cash-out refinance gives you the best rate plus equity access.", detail: "Your equity position supports a cash-out refi, which bundles your current mortgage and the equity you want to access into one loan — often at a better rate than a separate loan.", action: "Talk to a Loan Officer" }
          : { title: "A reverse mortgage could eliminate your required monthly payments.", detail: "Based on your equity and age, a reverse mortgage may convert your home's value into income or a credit line — with no monthly repayment required while you live in the home.", action: "Talk to a Loan Officer" };
        return (
          <section className="max-w-4xl mx-auto px-4 pt-4 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-primary/5 border border-primary/25 rounded-3xl p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-3">Based on your inputs</p>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{rec.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xl">{rec.detail}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0" />
                No obligation — exploring this is always free and pressure-free.
              </div>
            </motion.div>
          </section>
        );
      })()}

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

      {/* Comparison Mode */}
      {(() => {
        type CompOption = { title: string; pros: string[]; tradeoffs: string[] };
        const options: Record<string, CompOption[]> = {
          buy: [
            { title: "Buy now", pros: ["Lock in today's rate and price", "Start building equity immediately", "Certainty — no market guessing"], tradeoffs: ["Committed at current rates", "Requires down payment today"] },
            { title: "Wait 6–12 months", pros: ["More time to save for down payment", "Rates may shift in your favor"], tradeoffs: ["Home prices may rise", "Continued rent payments with no equity"] },
            { title: "Rent and reassess", pros: ["Maximum flexibility", "No near-term financial commitment"], tradeoffs: ["No equity building", "Rents may increase"] },
          ],
          refinance: [
            { title: "Refinance now", pros: ["Immediate monthly savings", "Lock in a lower rate today"], tradeoffs: ["Closing costs apply (typically $3K–$6K)", "Resets loan term"] },
            { title: "Wait for lower rates", pros: ["Potential for a better rate", "No closing costs yet"], tradeoffs: ["Continued higher payments in the meantime", "Rates may not drop as expected"] },
            { title: "Cash-out refinance", pros: ["Access equity + lower rate in one step", "Single loan payment"], tradeoffs: ["Larger loan balance", "Longer time to pay off"] },
          ],
          cashout: [
            { title: "Cash-out refinance", pros: ["One payment, often better rate", "Access large amounts of equity"], tradeoffs: ["Extends loan term", "Closing costs apply"] },
            { title: "HELOC", pros: ["Flexible draw — borrow as needed", "Only pay interest on what you use"], tradeoffs: ["Variable interest rate", "Separate payment from mortgage"] },
            { title: "Personal loan", pros: ["No home used as collateral", "Fast approval possible"], tradeoffs: ["Higher interest rate than mortgage", "Shorter repayment terms"] },
          ],
          reverse: [
            { title: "Reverse mortgage", pros: ["No required monthly payments", "Stay in your home", "Tax-free proceeds"], tradeoffs: ["Reduces estate value over time", "Loan balance grows"] },
            { title: "Sell and downsize", pros: ["Access full equity as cash", "Lower housing expenses"], tradeoffs: ["Must relocate", "Lifestyle change required"] },
            { title: "HELOC or second mortgage", pros: ["Keep full home value", "Flexible access"], tradeoffs: ["Requires monthly payments", "Income qualification required"] },
          ],
        };
        const key = selectedMortgageType ?? "buy";
        const opts = options[key] ?? options.buy;
        return (
          <section className="max-w-4xl mx-auto px-4 py-12">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">Side-by-side comparison</p>
              <h2 className="font-serif text-3xl font-semibold mb-2">Compare your options.</h2>
              <p className="text-muted-foreground text-sm mb-8">Humans make better decisions through comparison, not isolation. Here's how your main paths stack up.</p>
              <div className="grid md:grid-cols-3 gap-4">
                {opts.map((opt, i) => (
                  <div key={opt.title} className={`bg-card border rounded-2xl p-6 flex flex-col ${i === 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-border"}`}>
                    {i === 0 && <span className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-3">Most common path</span>}
                    {i !== 0 && <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Alternative</span>}
                    <h3 className="font-semibold text-foreground text-lg mb-4">{opt.title}</h3>
                    <div className="space-y-1.5 mb-4">
                      {opt.pros.map(p => (
                        <div key={p} className="flex gap-2 text-xs text-foreground">
                          <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                          {p}
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4 space-y-1.5 mt-auto">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">Tradeoffs</p>
                      {opt.tradeoffs.map(t => (
                        <div key={t} className="flex gap-2 text-xs text-muted-foreground">
                          <span className="shrink-0 mt-0.5">·</span>
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>
        );
      })()}

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

      {/* Buy-only: Monthly Payment Comparison by Loan Term */}
      {isBuy && answers.homeValue > 0 && (
        <section className="max-w-4xl mx-auto px-4 py-16">
          <h2 className="font-serif text-3xl font-semibold mb-2">What would your monthly payment be?</h2>
          <p className="text-muted-foreground mb-8">
            Based on your target home price of {formatCurrency(answers.homeValue)} with a {formatCurrency(answers.downPayment)} down payment.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {Object.entries(LOAN_TERM_RATES).map(([key, info]) => {
              const loanAmount = Math.max(0, answers.homeValue - answers.downPayment);
              const mr = info.rate / 100 / 12;
              const n = key.startsWith("15") ? 180 : 360;
              const payment = loanAmount > 0 && mr > 0
                ? loanAmount * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1)
                : 0;
              const isPopular = key === "30-fixed";
              return (
                <div key={key} className={`relative bg-card border rounded-2xl p-6 ${isPopular ? "border-primary ring-1 ring-primary" : "border-border"}`}>
                  {isPopular && (
                    <span className="absolute -top-3 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">Most Popular</span>
                  )}
                  <div className="flex items-center justify-between mb-4">
                    <p className="font-semibold text-foreground text-lg">{info.label}</p>
                    <span className="text-sm bg-secondary text-muted-foreground px-2.5 py-1 rounded-full font-medium">{info.rate}% APR</span>
                  </div>
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(Math.round(payment))}
                    <span className="text-base font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-3">{info.description}</p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-4">* Payment estimates include principal and interest only. Taxes, insurance, and HOA fees are not included.</p>
        </section>
      )}

      {/* Buy-only: Can't buy a home? Zillow */}
      {isBuy && (
        <section className="max-w-4xl mx-auto px-4 pb-16">
          <div className="bg-secondary/40 border border-border rounded-3xl p-8">
            <div className="flex items-center gap-3 mb-2">
              <Home className="w-5 h-5 text-primary" />
              <p className="font-semibold text-foreground text-lg">Can't find a home?</p>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Browse homes for sale near you in your estimated price range ({formatCurrency(adjustedEstimate?.low ?? 0)} – {formatCurrency(adjustedEstimate?.high ?? 0)}) and start planning your next move.
            </p>
            {!showZillow ? (
              <Button variant="outline" onClick={() => setShowZillow(true)} className="border-primary text-primary hover:bg-primary/5">
                <ExternalLink className="w-4 h-4 mr-2" />
                Browse Homes on Zillow
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Enter city, state or ZIP (e.g. Austin, TX)"
                  value={zillowLocation}
                  onChange={(e) => setZillowLocation(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && openZillow()}
                  className="flex-1 max-w-sm"
                />
                <Button onClick={openZillow} disabled={!zillowLocation.trim()}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Search Zillow
                </Button>
              </div>
            )}
          </div>
        </section>
      )}
      {/* Moment of Intent Capture — slides up after 14s or on tab switch */}
      <AnimatePresence>
        {intentBannerVisible && !intentDismissed && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-2xl px-4 py-5"
          >
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1 text-center sm:text-left">
                <p className="font-semibold text-foreground">Want to see a personalized breakdown?</p>
                <p className="text-sm text-muted-foreground mt-0.5">A loan officer who already knows your full picture is ready — no pressure to commit.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button asChild size="sm" className="rounded-full px-6">
                  <Link href="/handoff">Yes, show me</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-muted-foreground"
                  onClick={() => setIntentDismissed(true)}
                >
                  Not yet
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}