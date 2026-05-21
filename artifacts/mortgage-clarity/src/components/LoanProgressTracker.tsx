import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, FileCheck, Search, BadgeCheck, CheckCircle2,
  KeyRound, Sparkles, Clock, ChevronDown, ChevronUp, ArrowRight,
} from "lucide-react";

// ── Stage data ────────────────────────────────────────────────────────────────

export const LOAN_STAGES = [
  {
    n: 1,
    label: "Application Submitted",
    Icon: ClipboardList,
    description:
      "Your mortgage application has been received and is being prepared for initial review by the processing team.",
    timeline: "1–2 business days",
    action:
      "Ensure your application details are accurate. Watch your email for any initial requests from your loan team.",
    reassurance:
      "A great first step — your file is in the system and moving forward.",
    next: "Your documents will be collected and organized by the processing team.",
    confidence: "Early Stage",
  },
  {
    n: 2,
    label: "Documents Received",
    Icon: FileCheck,
    description:
      "Your supporting documents have been received and are being organized and verified in preparation for underwriting review.",
    timeline: "1–3 business days",
    action:
      "Check your document checklist for anything missing. Upload any outstanding items as quickly as possible.",
    reassurance:
      "You're well on your way — document collection is a critical and important milestone.",
    next: "Once all documents are verified, your file moves to underwriting for a comprehensive review.",
    confidence: "Early Stage",
  },
  {
    n: 3,
    label: "Underwriting Review",
    Icon: Search,
    description:
      "Your financial information and documents are currently being reviewed by an underwriter to verify eligibility and finalize loan details.",
    timeline: "2–5 business days",
    action:
      "Keep all requested documents accessible in case additional information is needed. Respond to any requests promptly.",
    reassurance:
      "This is a normal and thorough part of the mortgage process. Most borrowers move through this stage without issue.",
    next: "Once review is complete, your application will move to conditional or final approval.",
    confidence: "Mid Process",
  },
  {
    n: 4,
    label: "Conditional Approval",
    Icon: BadgeCheck,
    description:
      "Your loan has been approved pending a few remaining conditions. These must be satisfied before moving to final approval.",
    timeline: "2–4 business days",
    action:
      "Review and satisfy all listed conditions as quickly as possible. Your loan officer will guide you through each one.",
    reassurance:
      "Conditional approval is a very positive milestone — the hard part is done.",
    next: "Once all conditions are cleared, your file advances to final approval.",
    confidence: "Mid Process",
  },
  {
    n: 5,
    label: "Final Approval",
    Icon: CheckCircle2,
    description:
      "All conditions have been cleared and your loan has received final approval from the lender. You are clear to close.",
    timeline: "1–2 business days",
    action:
      "Begin preparing for closing. Coordinate with your real estate agent and settlement company on the closing date.",
    reassurance: "Final approval is a major milestone. The finish line is in sight.",
    next: "Your file is now being prepared for closing and escrow.",
    confidence: "Near Completion",
  },
  {
    n: 6,
    label: "Escrow / Closing",
    Icon: KeyRound,
    description:
      "Your loan is in the closing phase. All final documents are being prepared and closing figures are being confirmed.",
    timeline: "1–3 business days",
    action:
      "Review your Closing Disclosure carefully. Prepare your certified funds for any closing costs due at signing.",
    reassurance:
      "You're at the final stage. Closing is a guided process — your team will walk you through every step.",
    next: "After signing your closing documents, your loan will be submitted for funding.",
    confidence: "Near Completion",
  },
  {
    n: 7,
    label: "Funding Complete",
    Icon: Sparkles,
    description:
      "Congratulations — your loan has been fully funded and the transaction is complete.",
    timeline: "Complete ✓",
    action:
      "Save your loan documents securely and set up your first payment with your loan servicer.",
    reassurance:
      "You did it! Welcome to your next chapter. We're proud to have been part of your journey.",
    next: "Your first mortgage payment is typically due ~30 days after closing. A welcome letter from your servicer will arrive shortly.",
    confidence: "Complete",
  },
];

const CONFIDENCE: Record<string, { color: string; bg: string; bar: number }> = {
  "Early Stage":     { color: "text-sky-600",      bg: "bg-sky-50 border-sky-100",      bar: 20  },
  "Mid Process":     { color: "text-amber-600",     bg: "bg-amber-50 border-amber-100",  bar: 55  },
  "Near Completion": { color: "text-emerald-600",   bg: "bg-emerald-50 border-emerald-100", bar: 82 },
  "Complete":        { color: "text-emerald-600",   bg: "bg-emerald-50 border-emerald-100", bar: 100 },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface LoanProgressTrackerProps {
  currentStage: number; // 1–7, or 0 = not yet updated by LO
  updatedAt?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LoanProgressTracker({ currentStage, updatedAt }: LoanProgressTrackerProps) {
  const [expanded, setExpanded] = useState<number | null>(
    currentStage > 0 ? currentStage : null
  );

  const activeStageData = LOAN_STAGES.find((s) => s.n === currentStage);
  const conf = activeStageData ? CONFIDENCE[activeStageData.confidence] : null;

  if (currentStage === 0) {
    return (
      <div className="bg-secondary/40 border border-border rounded-2xl p-10 text-center space-y-3">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="font-semibold text-foreground">Progress not yet updated</p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Your loan officer will update your progress as your file moves through each stage of the process.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Confidence / progress bar */}
      {conf && activeStageData && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 ${conf.bg}`}
        >
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${conf.color}`}>
                {activeStageData.confidence}
              </span>
              <span className="text-xs text-muted-foreground">
                · Stage {currentStage} of {LOAN_STAGES.length}
              </span>
            </div>
            <div className="w-full bg-black/8 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf.bar}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-[190px] sm:text-right leading-relaxed">
            You are progressing normally through the mortgage process.
          </p>
        </motion.div>
      )}

      {/* Timeline */}
      <div>
        {LOAN_STAGES.map((stage, idx) => {
          const isCompleted = stage.n < currentStage;
          const isActive    = stage.n === currentStage;
          const isUpcoming  = stage.n > currentStage;
          const isExpanded  = expanded === stage.n;
          const isLast      = idx === LOAN_STAGES.length - 1;
          const clickable   = !isUpcoming;

          return (
            <div key={stage.n} className="flex gap-4">
              {/* Left column: node + connector */}
              <div className="flex flex-col items-center">
                <motion.div
                  onClick={() => clickable && setExpanded(isExpanded ? null : stage.n)}
                  whileHover={clickable ? { scale: 1.08 } : {}}
                  whileTap={clickable ? { scale: 0.94 } : {}}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all select-none ${
                    clickable ? "cursor-pointer" : "cursor-default"
                  } ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isActive
                        ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                        : "bg-secondary border-2 border-border text-muted-foreground/50"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/25"
                      animate={{ scale: [1, 1.55, 1], opacity: [0.7, 0, 0.7] }}
                      transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <stage.Icon className="w-4 h-4 relative z-10" />
                </motion.div>
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 min-h-5 mt-1 mb-1 ${
                      isCompleted ? "bg-emerald-400" : "bg-border"
                    }`}
                    style={!isCompleted ? { borderLeft: "2px dashed", borderColor: "hsl(var(--border))", width: 1 } : undefined}
                  />
                )}
              </div>

              {/* Right column: stage info + detail */}
              <div className="flex-1 pb-5 pt-1">
                <button
                  onClick={() => clickable && setExpanded(isExpanded ? null : stage.n)}
                  disabled={!clickable}
                  className="w-full text-left disabled:cursor-default"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p
                          className={`text-sm font-semibold leading-snug ${
                            isCompleted
                              ? "text-emerald-700"
                              : isActive
                                ? "text-foreground"
                                : "text-muted-foreground/60"
                          }`}
                        >
                          {stage.label}
                        </p>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-full px-2 py-0.5 leading-none">
                            Current
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 leading-none">
                            Done
                          </span>
                        )}
                      </div>
                      {!isUpcoming && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {stage.timeline}
                        </p>
                      )}
                    </div>
                    {clickable && (
                      isExpanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    )}
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 bg-secondary/50 border border-border/60 rounded-2xl p-5 space-y-4">
                        <p className="text-sm text-foreground leading-relaxed">{stage.description}</p>

                        <div className="space-y-3 border-t border-border/40 pt-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                              What you can do now
                            </p>
                            <p className="text-sm text-foreground">{stage.action}</p>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                            <p className="text-sm text-emerald-800 italic">"{stage.reassurance}"</p>
                          </div>

                          {stage.n < 7 && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                                What happens next
                              </p>
                              <p className="text-sm text-muted-foreground flex gap-2 items-start">
                                <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                                {stage.next}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border pt-4 space-y-1">
        <p className="text-xs text-muted-foreground">
          Timelines are estimates and may vary depending on documentation and lender processing.
        </p>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">Last updated by loan officer: {updatedAt}</p>
        )}
      </div>
    </div>
  );
}
