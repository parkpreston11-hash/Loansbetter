import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage } from "@/context/MortgageContext";
import { useMortgageRates } from "@/hooks/useMortgageRates";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  MessageCircle, FileText, Info, Save, ChevronDown,
  CheckCircle2, ExternalLink, Home, BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

/* ─── per-type copy ────────────────────────────────────────────── */
const TYPE_COPY = {
  buy: {
    headline: "Here's your estimated home buying power",
    explanation:
      "Based on your income, savings, and credit profile — this is the home price range you may comfortably qualify for.",
    insights: [
      "Your down payment and credit score are the two biggest levers for your approval odds.",
      "Getting pre-approved is a free, no-commitment step that shows sellers you're serious.",
    ],
    decisionLevel: 1,
  },
  refinance: {
    headline: "Refinancing could lower your monthly payment",
    explanation:
      "Your current rate is above today's market average. Refinancing could reduce your monthly payment and lower total interest paid over the life of your loan.",
    insights: [
      "Closing costs (typically $3K–$6K) are usually recovered within 18–24 months of monthly savings.",
      "Even a 0.5% rate reduction can save tens of thousands of dollars over a 30-year loan.",
    ],
    decisionLevel: 2,
  },
  cashout: {
    headline: "Here's your estimated cash-out potential",
    explanation:
      "Based on your home equity and credit profile — this is how much you may be able to access while combining it into a single monthly payment.",
    insights: [
      "Closing costs are typically rolled into the loan — no out-of-pocket cash required at closing.",
      "A cash-out refinance usually offers a lower rate than a HELOC or personal loan.",
    ],
    decisionLevel: 3,
  },
  reverse: {
    headline: "Here's your estimated reverse mortgage range",
    explanation:
      "Based on your home value, mortgage balance, and age — this is the range your reverse mortgage could provide with no required monthly payments.",
    insights: [
      "No monthly mortgage payments are required as long as you live in the home as your primary residence.",
      "Proceeds are generally tax-free and can be received as a lump sum, line of credit, or monthly payments.",
    ],
    decisionLevel: 3,
  },
  second: {
    headline: "Here's your estimated equity access",
    explanation:
      "Based on your available home equity and credit profile — this is the range you may access through a HELOAN or HELOC, without touching your first mortgage.",
    insights: [
      "Your first mortgage rate stays completely unchanged — this is a separate second lien.",
      "A HELOAN gives you a fixed rate on a lump sum; a HELOC is a flexible revolving credit line.",
    ],
    decisionLevel: 2,
  },
} as const;

/* ─── comparison options ────────────────────────────────────────── */
type CompOption = { title: string; pros: string[]; tradeoffs: string[] };

const COMPARISONS: Record<string, CompOption[]> = {
  buy: [
    { title: "Buy now", pros: ["Lock in today's rate and price", "Start building equity immediately", "Certainty — no market guessing"], tradeoffs: ["Committed at current rates", "Requires down payment today"] },
    { title: "Wait 6–12 months", pros: ["More time to save", "Rates may shift in your favor"], tradeoffs: ["Home prices may rise", "Continued rent with no equity"] },
    { title: "Rent and reassess", pros: ["Maximum flexibility", "No near-term commitment"], tradeoffs: ["No equity building", "Rents may increase"] },
  ],
  refinance: [
    { title: "Refinance now", pros: ["Immediate monthly savings", "Lock in a lower rate today"], tradeoffs: ["Closing costs apply ($3K–$6K)", "Resets loan term"] },
    { title: "Wait for lower rates", pros: ["Potential for a better rate", "No closing costs yet"], tradeoffs: ["Higher payments continue", "Rates may not drop as expected"] },
    { title: "Cash-out refinance", pros: ["Access equity + lower rate in one step", "Single combined payment"], tradeoffs: ["Larger loan balance", "Longer time to pay off"] },
  ],
  cashout: [
    { title: "Cash-out refinance", pros: ["One payment, often better rate", "Access large equity amounts"], tradeoffs: ["Extends loan term", "Closing costs apply"] },
    { title: "HELOC", pros: ["Flexible draw — borrow as needed", "Only pay interest on what you use"], tradeoffs: ["Variable interest rate", "Separate payment from mortgage"] },
    { title: "Personal loan", pros: ["No home used as collateral", "Fast approval possible"], tradeoffs: ["Higher interest rate", "Shorter repayment terms"] },
  ],
  reverse: [
    { title: "Reverse mortgage", pros: ["No required monthly payments", "Stay in your home", "Tax-free proceeds"], tradeoffs: ["Reduces estate value over time", "Loan balance grows"] },
    { title: "Sell and downsize", pros: ["Access full equity as cash", "Lower housing expenses"], tradeoffs: ["Must relocate", "Lifestyle change required"] },
    { title: "HELOC or second mortgage", pros: ["Keep full home value", "Flexible access"], tradeoffs: ["Requires monthly payments", "Income qualification needed"] },
  ],
  second: [
    { title: "HELOAN (fixed lump sum)", pros: ["Fixed rate — predictable payments", "Best for one-time large expenses", "Simple, single disbursement"], tradeoffs: ["Full interest accrues from day one", "Less flexible than HELOC"] },
    { title: "HELOC (revolving line)", pros: ["Only borrow what you need", "Reusable as you repay", "Draw period flexibility"], tradeoffs: ["Variable rate risk", "Payment increases after draw period"] },
    { title: "Cash-out refinance", pros: ["May get a better rate if rates dropped", "Single combined loan payment"], tradeoffs: ["Replaces your first mortgage", "Closing costs apply"] },
  ],
};

/* ─── decision level config ─────────────────────────────────────── */
const DECISION_LEVELS = [
  { label: "Low Complexity", sub: "Relatively straightforward", detail: "A single lender conversation is likely all you need to move forward confidently.", activeClass: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Moderate Complexity", sub: "A few variables worth exploring", detail: "Take a moment to compare your options before committing. The comparison tool below can help.", activeClass: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "High-Impact Decision", sub: "Explore before you act", detail: "This decision benefits from careful planning. Take your time — there's no rush.", activeClass: "bg-sky-400", badge: "bg-sky-50 text-sky-700 border-sky-200" },
];

export default function Results() {
  const [, setLocation] = useLocation();
  const {
    estimateResult, answers, selectedMortgageType,
    scenarioAdjustments, setScenarioAdjustments,
  } = useMortgage();

  const { rates: liveRates, updatedAt: ratesUpdatedAt, loading: ratesLoading } = useMortgageRates();
  const [adjustedEstimate, setAdjustedEstimate] = useState(estimateResult);
  const [showComparison, setShowComparison] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [showZillow, setShowZillow] = useState(false);
  const [zillowLocation, setZillowLocation] = useState("");
  const [intentBannerVisible, setIntentBannerVisible] = useState(false);
  const [intentDismissed, setIntentDismissed] = useState(false);

  const type = (selectedMortgageType ?? "buy") as keyof typeof TYPE_COPY;
  const copy = TYPE_COPY[type] ?? TYPE_COPY.buy;
  const compOpts = COMPARISONS[type] ?? COMPARISONS.buy;
  const level = DECISION_LEVELS[copy.decisionLevel - 1];
  const isBuy = type === "buy";

  const openZillow = () => {
    if (!zillowLocation.trim()) return;
    const loc = zillowLocation.trim().replace(/\s+/g, "-").toLowerCase();
    const low = Math.round((estimateResult?.low ?? 0) / 10000) * 10000;
    const high = Math.round((estimateResult?.high ?? 0) / 10000) * 10000;
    window.open(`https://www.zillow.com/homes/for_sale/${encodeURIComponent(loc)}/${low}-${high}_price/`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (!estimateResult) setLocation("/start");
  }, [estimateResult, setLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setIntentBannerVisible(true), 18000);
    const onHide = () => { if (document.hidden) setIntentBannerVisible(true); };
    document.addEventListener("visibilitychange", onHide);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", onHide); };
  }, []);

  /* ── scenario slider logic ──────────────────────────── */
  useEffect(() => {
    if (!estimateResult) return;
    const { incomeBoost, debtReduction, creditImprovement, downPaymentBoost } = scenarioAdjustments;
    const scoreMap: Record<string, number> = {
      "Below 580": 0.7, "580–619": 0.8, "620–679": 0.9, "680–739": 1.0, "740 or above": 1.1,
    };
    const currentMult = scoreMap[answers.creditScore ?? ""] ?? 1.0;
    const creditMultiplier = Math.min(1.1, currentMult + creditImprovement * 0.1);
    const adjIncome = answers.income + incomeBoost;
    const adjDebt = Math.max(0, answers.monthlyDebt - debtReduction);
    const adjDown = answers.downPayment + downPaymentBoost;
    const base = adjIncome * 3.5;
    const debtRed = adjDebt * 12 * 2;
    if (type === "buy") {
      setAdjustedEstimate({ low: Math.max(50000, (base - debtRed + adjDown * 2) * creditMultiplier * 0.9), high: Math.max(60000, (base - debtRed + adjDown * 2) * creditMultiplier * 1.1), type: "Target Home Price" });
    } else {
      const factor = 1 + incomeBoost * 0.00001 + creditImprovement * 0.05;
      setAdjustedEstimate({ low: estimateResult.low * factor, high: estimateResult.high * factor, type: estimateResult.type });
    }
  }, [scenarioAdjustments, answers, estimateResult, type]);

  if (!estimateResult || !adjustedEstimate) return null;

  const fmt = (v: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background pb-28">

      {/* ── 1. MAIN RESULT CARD ─────────────────────────────── */}
      <section className="bg-primary text-primary-foreground py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-primary-foreground/70 text-xs font-semibold uppercase tracking-widest mb-4">
              Estimated {adjustedEstimate.type}
            </p>
            <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight leading-none">
              {fmt(adjustedEstimate.low)}&nbsp;–&nbsp;{fmt(adjustedEstimate.high)}
            </h1>
            <p className="mt-5 text-lg text-primary-foreground/85 leading-relaxed font-light max-w-lg mx-auto">
              {copy.headline}
            </p>
            <p className="mt-3 text-sm text-primary-foreground/65 leading-relaxed max-w-md mx-auto">
              {copy.explanation}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="inline-flex items-center gap-1.5 text-xs text-primary-foreground/50 bg-primary-foreground/10 rounded-full px-3 py-1.5"
          >
            <Save className="w-3 h-3" />
            Progress saved — you can close and return anytime
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-primary-foreground/8 border border-primary-foreground/15 rounded-2xl p-4 text-left text-xs text-primary-foreground/60 flex items-start gap-2.5 max-w-lg mx-auto"
          >
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary-foreground/50" />
            This estimate is for informational purposes only. It is not a loan offer or financial advice. Actual results depend on lender guidelines and your full financial profile.
          </motion.div>
        </div>
      </section>

      {/* ── 2. DECISION CLARITY + KEY INSIGHTS ──────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-2 space-y-4">

        {/* Decision level badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-3"
        >
          <BarChart2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${level.badge}`}>
            Decision Level: {level.label} ({copy.decisionLevel}/3)
          </span>
          <span className="text-xs text-muted-foreground">{level.sub}</span>
        </motion.div>

        {/* Key insights */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-card border border-border rounded-2xl p-6 space-y-3"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Key insights</p>
          {copy.insights.map((insight, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground leading-relaxed">{insight}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── 3. EXPANDABLE: COMPARISON ───────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl text-left hover:border-primary/40 transition-all group"
          >
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">See detailed comparison</p>
              <p className="text-xs text-muted-foreground mt-0.5">Compare your main paths side by side</p>
            </div>
            <motion.div animate={{ rotate: showComparison ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showComparison && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {compOpts.map((opt, i) => (
                    <div
                      key={opt.title}
                      className={`bg-card border rounded-2xl p-5 ${i === 0 ? "border-primary/40 ring-1 ring-primary/15" : "border-border"}`}
                    >
                      {i === 0 && <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-2">Most common path</p>}
                      <h3 className="font-semibold text-foreground mb-3">{opt.title}</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          {opt.pros.map((p) => (
                            <div key={p} className="flex gap-2 text-xs text-foreground">
                              <span className="text-emerald-500 shrink-0">✓</span>{p}
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Tradeoffs</p>
                          {opt.tradeoffs.map((t) => (
                            <div key={t} className="flex gap-2 text-xs text-muted-foreground">
                              <span className="shrink-0">·</span>{t}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Buy-only: Zillow link */}
                  {isBuy && (
                    <div className="bg-secondary/30 border border-border rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-1">
                        <Home className="w-4 h-4 text-primary" />
                        <p className="font-semibold text-sm text-foreground">Browse homes in your range</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-4">{fmt(adjustedEstimate.low)} – {fmt(adjustedEstimate.high)} on Zillow</p>
                      {!showZillow ? (
                        <Button variant="outline" size="sm" onClick={() => setShowZillow(true)} className="border-primary text-primary hover:bg-primary/5 rounded-full">
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Browse on Zillow
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Input placeholder="City, state or ZIP" value={zillowLocation} onChange={(e) => setZillowLocation(e.target.value)} onKeyDown={(e) => e.key === "Enter" && openZillow()} className="flex-1 h-9 text-sm" />
                          <Button size="sm" onClick={openZillow} disabled={!zillowLocation.trim()} className="rounded-full">Search</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── 4. EXPANDABLE: SCENARIO EXPLORER ────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-3">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <button
            onClick={() => setShowScenario(!showScenario)}
            className="w-full flex items-center justify-between p-5 bg-card border border-border rounded-2xl text-left hover:border-primary/40 transition-all group"
          >
            <div>
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors">What if I change my situation?</p>
              <p className="text-xs text-muted-foreground mt-0.5">See how adjustments shift your estimate</p>
            </div>
            <motion.div animate={{ rotate: showScenario ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showScenario && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-3 bg-card border border-border rounded-2xl p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Income */}
                      <div>
                        <div className="flex justify-between mb-3 text-sm">
                          <label className="font-medium text-foreground">Increase annual income by</label>
                          <span className="text-primary font-semibold">+{fmt(scenarioAdjustments.incomeBoost)}</span>
                        </div>
                        <Slider value={[scenarioAdjustments.incomeBoost]} min={0} max={50000} step={5000} onValueChange={(v) => setScenarioAdjustments((s) => ({ ...s, incomeBoost: v[0] }))} />
                      </div>
                      {/* Debt */}
                      <div>
                        <div className="flex justify-between mb-3 text-sm">
                          <label className="font-medium text-foreground">Reduce monthly debt by</label>
                          <span className="text-primary font-semibold">−{fmt(scenarioAdjustments.debtReduction)}</span>
                        </div>
                        <Slider value={[scenarioAdjustments.debtReduction]} min={0} max={2000} step={100} onValueChange={(v) => setScenarioAdjustments((s) => ({ ...s, debtReduction: v[0] }))} />
                      </div>
                      {/* Credit */}
                      <div>
                        <div className="flex justify-between mb-3 text-sm">
                          <label className="font-medium text-foreground">Improve credit score by</label>
                          <span className="text-primary font-semibold">{scenarioAdjustments.creditImprovement} {scenarioAdjustments.creditImprovement === 1 ? "tier" : "tiers"}</span>
                        </div>
                        <Slider value={[scenarioAdjustments.creditImprovement]} min={0} max={2} step={1} onValueChange={(v) => setScenarioAdjustments((s) => ({ ...s, creditImprovement: v[0] }))} />
                      </div>
                      {/* Down payment — buy only */}
                      {isBuy && (
                        <div>
                          <div className="flex justify-between mb-3 text-sm">
                            <label className="font-medium text-foreground">Increase down payment by</label>
                            <span className="text-primary font-semibold">+{fmt(scenarioAdjustments.downPaymentBoost)}</span>
                          </div>
                          <Slider value={[scenarioAdjustments.downPaymentBoost]} min={0} max={50000} step={5000} onValueChange={(v) => setScenarioAdjustments((s) => ({ ...s, downPaymentBoost: v[0] }))} />
                        </div>
                      )}
                    </div>

                    {/* Live result */}
                    <div className="bg-secondary/50 border border-border/50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                      <p className="text-xs text-muted-foreground mb-3 uppercase tracking-widest font-semibold">Adjusted estimate</p>
                      <motion.div
                        key={`${adjustedEstimate.low}-${adjustedEstimate.high}`}
                        initial={{ scale: 0.92, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-2xl font-bold text-primary leading-tight"
                      >
                        {fmt(adjustedEstimate.low)}<br />– {fmt(adjustedEstimate.high)}
                      </motion.div>
                      <p className="text-xs text-muted-foreground mt-4 max-w-[180px] leading-relaxed">
                        Small changes in your financial picture can significantly shift your options.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ── 5. BOTTOM CTAs ──────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="grid sm:grid-cols-2 gap-4"
        >
          {/* Talk to LO */}
          <Link href="/handoff">
            <div className="group bg-card border border-border hover:border-primary/50 hover:shadow-lg rounded-2xl p-7 flex flex-col gap-4 cursor-pointer transition-all hover:-translate-y-0.5 h-full">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                <FileText className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg mb-1">Talk to a Loan Officer</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Get a personalized breakdown from a licensed professional who already knows your picture.</p>
              </div>
              <Button className="rounded-full mt-auto w-full">Talk to a Loan Officer</Button>
            </div>
          </Link>

          {/* Chat with AI */}
          <Link href="/chat">
            <div className="group bg-card border border-border hover:border-primary/50 hover:shadow-lg rounded-2xl p-7 flex flex-col gap-4 cursor-pointer transition-all hover:-translate-y-0.5 h-full">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                <MessageCircle className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-lg mb-1">Chat with AI Assistant</p>
                <p className="text-sm text-muted-foreground leading-relaxed">Ask questions and explore your options instantly — no pressure, no commitment required.</p>
              </div>
              <Button variant="outline" className="rounded-full mt-auto w-full border-primary text-primary hover:bg-primary/5">Chat with AI Assistant</Button>
            </div>
          </Link>
        </motion.div>

        {/* Buy-only: monthly payment by loan term */}
        {isBuy && answers.homeValue > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 bg-secondary/30 border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Monthly payment by loan term</p>
              {!ratesLoading && ratesUpdatedAt && ratesUpdatedAt !== "fallback" && (
                <p className="text-[10px] text-muted-foreground">Rates as of {ratesUpdatedAt}</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">Based on {fmt(answers.homeValue)} home price with {fmt(answers.downPayment)} down.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(liveRates).filter(([key]) => key.endsWith("-fixed")).map(([key, info]) => {
                const loan = Math.max(0, answers.homeValue - answers.downPayment);
                const mr = info.rate / 100 / 12;
                const n = key.startsWith("15") ? 180 : 360;
                const pmt = loan > 0 && mr > 0 ? loan * mr * Math.pow(1 + mr, n) / (Math.pow(1 + mr, n) - 1) : 0;
                const popular = key === "30-fixed";
                return (
                  <div key={key} className={`relative bg-card border rounded-xl p-4 ${popular ? "border-primary ring-1 ring-primary/20" : "border-border"}`}>
                    {popular && <span className="absolute -top-2.5 left-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2.5 py-0.5 rounded-full">Most Popular</span>}
                    <p className="font-semibold text-sm text-foreground mb-1">{info.label}</p>
                    <p className="text-2xl font-bold text-primary">{fmt(Math.round(pmt))}<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
                    <p className="text-xs text-muted-foreground mt-1">{info.rate}% APR</p>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">* Principal and interest only. Taxes, insurance, and HOA not included. Rates sourced from Freddie Mac via FRED.</p>
          </motion.div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground mt-6"
        >
          No obligation — exploring is always free and pressure-free.
        </motion.p>
      </section>

      {/* ── ZILLOW (Buy only) ────────────────────────────────── */}
      {isBuy && (
        <section className="max-w-2xl mx-auto px-4 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95 }}
            className="bg-secondary/40 border border-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-2.5 mb-1">
              <Home className="w-4 h-4 text-primary" />
              <p className="font-semibold text-foreground">Browse homes in your price range</p>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Explore homes for sale in the {fmt(adjustedEstimate.low)} – {fmt(adjustedEstimate.high)} range on Zillow.
            </p>
            {!showZillow ? (
              <Button variant="outline" onClick={() => setShowZillow(true)} className="border-primary text-primary hover:bg-primary/5 rounded-full">
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
                <Button onClick={openZillow} disabled={!zillowLocation.trim()} className="rounded-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Search Zillow
                </Button>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* ── INTENT BANNER ───────────────────────────────────── */}
      <AnimatePresence>
        {intentBannerVisible && !intentDismissed && (
          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-t border-border shadow-2xl px-4 py-5"
          >
            <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-5">
              <div className="flex-1 text-center sm:text-left">
                <p className="font-semibold text-foreground">Want a personalized breakdown?</p>
                <p className="text-sm text-muted-foreground mt-0.5">A loan officer who already knows your picture is ready — no pressure to commit.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Button asChild size="sm" className="rounded-full px-6">
                  <Link href="/handoff">Yes, show me</Link>
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={() => setIntentDismissed(true)}>
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
