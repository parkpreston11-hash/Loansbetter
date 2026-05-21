import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList, Search, BadgeCheck, CheckCircle2, Home,
  FileText, Building2, KeyRound, Sparkles, Lock,
  BookOpen, ShieldCheck, DollarSign, RefreshCcw, Calculator,
  Clock, ChevronDown, ChevronUp, ArrowRight, CalendarDays, Activity,
} from "lucide-react";

// ── Shared helpers ────────────────────────────────────────────────────────────

export interface StageHistoryEntry {
  stage: number;
  label: string;
  timestamp: string;
  note?: string;
  officerTag: string;
}

export interface StoredStageData {
  currentStage: number;
  loanType: string;
  history: StageHistoryEntry[];
  updatedAt: string;
}

export function buildTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", timeZoneName: "short",
  });
}

// ── Stage definitions ─────────────────────────────────────────────────────────

interface StageDef {
  n: number;
  label: string;
  Icon: React.ElementType;
  description: string;
  timeline: string;
  action: string;
  reassurance: string;
  next: string;
}

const BUY_STAGES: StageDef[] = [
  { n: 1,  label: "Application Submitted",       Icon: ClipboardList, description: "Your mortgage application has been received and is in the queue for initial processing.", timeline: "1–2 business days", action: "Confirm your personal and financial details are accurate. Watch for any initial requests via email.", reassurance: "You've taken the first step — your file is in the system.", next: "Your application will be reviewed and verified by the processing team." },
  { n: 2,  label: "Initial Review",              Icon: Search,        description: "A processor is reviewing your application for completeness and accuracy.", timeline: "1–3 business days", action: "Respond promptly to any requests for missing information or documentation.", reassurance: "Initial review is a routine step — most files move through quickly.", next: "Your income, credit, and assets will be formally verified." },
  { n: 3,  label: "Income + Credit Verification",Icon: BadgeCheck,    description: "Your income, employment, credit history, and assets are being verified by the processing team.", timeline: "2–4 business days", action: "Have your pay stubs, W-2s, tax returns, and bank statements ready to upload if requested.", reassurance: "Verification is standard — it protects both you and the lender.", next: "If your file looks strong, you will receive a pre-approval letter." },
  { n: 4,  label: "Pre-Approval Issued",         Icon: CheckCircle2,  description: "Congratulations — a pre-approval has been issued based on your financials. You're ready to shop.", timeline: "Issued", action: "Work with your real estate agent to search for homes within your approved price range.", reassurance: "Pre-approval is a significant milestone and shows sellers you're serious.", next: "Once you find a home and have an accepted offer, your contract is signed." },
  { n: 5,  label: "Home Search / Offer Stage",   Icon: Home,          description: "You are actively shopping for a home. Your pre-approval is valid while you search.", timeline: "Varies by market", action: "Partner with a trusted real estate agent. Be ready to act quickly in competitive markets.", reassurance: "Take your time — finding the right home is worth it.", next: "Once your offer is accepted, you'll sign the purchase contract." },
  { n: 6,  label: "Purchase Contract Signed",    Icon: FileText,      description: "Your purchase contract has been signed and your loan file has been formally submitted to underwriting.", timeline: "1–2 business days", action: "Avoid making large purchases or opening new credit accounts during this stage.", reassurance: "A signed contract is a major milestone — you're officially under contract.", next: "An underwriter will do a full review of your financial picture." },
  { n: 7,  label: "Underwriting Review",         Icon: Search,        description: "An underwriter is conducting a comprehensive review of your financial profile, documents, and property details.", timeline: "2–5 business days", action: "Keep all documents accessible. Respond to any underwriter conditions or requests immediately.", reassurance: "Underwriting is thorough by design — it's how lenders ensure you succeed.", next: "A home appraisal will be ordered to verify the property's value." },
  { n: 8,  label: "Home Appraisal Ordered",      Icon: Building2,     description: "A licensed appraiser has been ordered to assess the fair market value of the property.", timeline: "3–7 business days", action: "The seller's agent will coordinate appraisal access. No action needed from you at this time.", reassurance: "Appraisals are a standard and important protection for all parties.", next: "Once the appraisal is complete, your file moves to conditional approval." },
  { n: 9,  label: "Conditional Approval",        Icon: BadgeCheck,    description: "Your loan is approved subject to a few remaining conditions. These must be cleared before final approval.", timeline: "2–4 business days", action: "Address all listed conditions as quickly as possible. Your loan officer will guide you through each item.", reassurance: "Conditional approval is a very positive sign — you're nearly there.", next: "Once all conditions are satisfied, final approval will be issued." },
  { n: 10, label: "Final Approval (Clear to Close)", Icon: CheckCircle2, description: "All conditions have been cleared. Your loan is fully approved and you are clear to close.", timeline: "1–2 business days", action: "Schedule your closing date with your settlement agent. Review your Closing Disclosure carefully.", reassurance: "Clear to Close is the milestone every borrower works toward — you made it.", next: "You'll sign your closing documents and complete the transaction." },
  { n: 11, label: "Closing / Escrow Signing",    Icon: KeyRound,      description: "You're at the closing table. All final documents are being signed and your transaction is being finalized.", timeline: "Same day – 1 business day", action: "Bring a valid government-issued ID and certified funds for closing costs. Review every document you sign.", reassurance: "Closing is an exciting and guided process — your team will walk you through it.", next: "Your loan will be submitted for funding." },
  { n: 12, label: "Funding Released",            Icon: Sparkles,      description: "Your loan has been funded. The transaction is complete. Congratulations — you're a homeowner!", timeline: "Complete ✓", action: "Save all loan documents in a secure place and set up your first mortgage payment.", reassurance: "You did it! Welcome home. We're proud to have been part of your journey.", next: "Your first mortgage payment is typically due ~30 days after closing." },
];

const REFINANCE_STAGES: StageDef[] = [
  { n: 1,  label: "Application Submitted",       Icon: ClipboardList, description: "Your refinance application has been received and entered into our processing system.", timeline: "1–2 business days", action: "Confirm all application details are accurate. Watch for any follow-up requests.", reassurance: "You've started the process — your file is moving.", next: "Your credit and income will be formally reviewed." },
  { n: 2,  label: "Credit + Income Review",      Icon: BadgeCheck,    description: "Your credit history, income, and employment are being verified by the processing team.", timeline: "2–3 business days", action: "Have your recent pay stubs, W-2s, and bank statements ready for upload if requested.", reassurance: "Credit and income review is a standard and fast process.", next: "A property valuation will be ordered to confirm your home's current value." },
  { n: 3,  label: "Property Valuation / Appraisal", Icon: Building2,  description: "A licensed appraiser is assessing the current market value of your property.", timeline: "3–7 business days", action: "The appraiser will contact you to schedule access. Ensure the home is accessible and presentable.", reassurance: "Appraisals are standard — most refinances proceed smoothly through this step.", next: "Once valuation is confirmed, your rate can be locked if not already done." },
  { n: 4,  label: "Rate Lock",                   Icon: Lock,          description: "Your interest rate has been locked in, protecting you from market fluctuations during processing.", timeline: "Locked", action: "No action needed. Avoid any major financial changes that could affect your credit or income.", reassurance: "A locked rate gives you peace of mind regardless of market movement.", next: "Your file moves to underwriting for final review." },
  { n: 5,  label: "Underwriting Review",         Icon: Search,        description: "An underwriter is performing a comprehensive review of your file to ensure all requirements are met.", timeline: "2–5 business days", action: "Respond immediately to any conditions or document requests. Fast response = faster closing.", reassurance: "Underwriting is the final deep review before approval.", next: "Loan approval will be issued once underwriting is satisfied." },
  { n: 6,  label: "Loan Approval",               Icon: CheckCircle2,  description: "Your refinance has been fully approved. All conditions have been cleared.", timeline: "1–2 business days", action: "Review your final loan terms and confirm your closing date with your loan officer.", reassurance: "Approval means the finish line is near.", next: "Your Closing Disclosure will be issued at least 3 business days before closing." },
  { n: 7,  label: "Closing Disclosure Issued",   Icon: FileText,      description: "Your official Closing Disclosure has been issued, detailing all final loan terms, fees, and costs.", timeline: "3 business days (required)", action: "Review your Closing Disclosure carefully. Compare it to your Loan Estimate. Flag any questions for your loan officer.", reassurance: "You legally have 3 days to review before signing — use that time.", next: "You will sign your closing documents at the settlement appointment." },
  { n: 8,  label: "Signing / Closing",           Icon: KeyRound,      description: "You are signing your final refinance documents. This formally closes the old loan and opens the new one.", timeline: "Same day", action: "Bring a government-issued ID. Review every document before signing. Ask questions if anything is unclear.", reassurance: "Signing is a smooth and guided process — your team is with you.", next: "Your old loan will be paid off and the new loan activated." },
  { n: 9,  label: "Old Loan Paid Off",           Icon: RefreshCcw,    description: "Your previous mortgage has been paid in full from the proceeds of the new loan.", timeline: "1–3 business days", action: "Confirm with your previous servicer that your old loan is paid and closed.", reassurance: "The payoff process is routine and handled by the settlement agent.", next: "Your new loan will be activated and your servicer will send you a welcome package." },
  { n: 10, label: "New Loan Activated",          Icon: Sparkles,      description: "Your refinance is complete! Your new loan is active and your first payment has been scheduled.", timeline: "Complete ✓", action: "Set up auto-pay for your new loan. Save all documents in a secure location.", reassurance: "Congratulations — your refinance is done. Enjoy your new rate and terms.", next: "Your first payment is typically due within 30–60 days. Watch for a welcome letter from your servicer." },
];

const CASHOUT_STAGES: StageDef[] = [
  { n: 1,  label: "Application Submitted",       Icon: ClipboardList, description: "Your cash-out refinance application has been received and is being processed.", timeline: "1–2 business days", action: "Confirm all application details are accurate. Watch for initial document requests.", reassurance: "Your application is in — the process is underway.", next: "Your equity position will be evaluated to determine available cash." },
  { n: 2,  label: "Equity Evaluation",           Icon: Calculator,    description: "The equity in your home is being calculated based on your current balance and estimated property value.", timeline: "1–2 business days", action: "No action needed. This is an internal calculation by the processing team.", reassurance: "Equity evaluation is quick and gives you a clear picture of your access to funds.", next: "Your credit and income will be formally verified." },
  { n: 3,  label: "Credit + Income Verification",Icon: BadgeCheck,    description: "Your credit score, income, and employment history are being verified to ensure qualification.", timeline: "2–3 business days", action: "Prepare recent pay stubs, W-2s, tax returns, and bank statements for upload if requested.", reassurance: "Verification is standard and protects the integrity of your loan.", next: "A home appraisal will be ordered — this is critical for confirming your cash-out amount." },
  { n: 4,  label: "Home Appraisal",              Icon: Building2,     description: "A licensed appraiser is conducting a formal assessment of your property's current market value.", timeline: "3–7 business days", action: "Ensure your home is accessible. Present it in good condition for the appraiser's visit.", reassurance: "The appraisal confirms how much equity you can access — it's a key step.", next: "With appraisal complete, your full file moves to underwriting review." },
  { n: 5,  label: "Underwriting Review",         Icon: Search,        description: "An underwriter is reviewing your complete file — income, credit, equity, and appraisal results.", timeline: "2–5 business days", action: "Respond promptly to any conditions or document requests to avoid delays.", reassurance: "Underwriting is thorough by design. Most cash-out refinances move through without major issues.", next: "Upon underwriting completion, your cash-out approval will be issued." },
  { n: 6,  label: "Cash-Out Approval",           Icon: CheckCircle2,  description: "Your cash-out refinance has been approved. The cash amount and new loan terms are confirmed.", timeline: "1–2 business days", action: "Review your final loan terms. Confirm the cash-out amount with your loan officer.", reassurance: "Approval means your equity access is confirmed.", next: "Your official Closing Disclosure will be issued." },
  { n: 7,  label: "Closing Disclosure Issued",   Icon: FileText,      description: "Your Closing Disclosure has been issued with all final loan terms, closing costs, and your cash-out amount.", timeline: "3 business days (required)", action: "Review every line of your Closing Disclosure carefully. Confirm the cash-out amount and all fees.", reassurance: "You have 3 days to review — take your time and ask questions.", next: "You'll sign your closing documents to finalize the transaction." },
  { n: 8,  label: "Signing / Closing",           Icon: KeyRound,      description: "You are signing your final closing documents, completing the cash-out refinance transaction.", timeline: "Same day", action: "Bring a valid ID. Review and sign all documents. Ask your settlement agent if anything is unclear.", reassurance: "Closing is guided and professionally managed — your team will walk you through it.", next: "Your existing mortgage will be paid off and the process completes." },
  { n: 9,  label: "Existing Mortgage Paid Off",  Icon: RefreshCcw,    description: "Your previous mortgage balance has been paid in full from the new loan proceeds.", timeline: "1–3 business days", action: "Confirm payoff with your prior servicer. Keep records of the payoff confirmation.", reassurance: "The payoff is handled automatically by the settlement agent.", next: "Your cash funds will be released — typically within 3 business days after closing." },
  { n: 10, label: "Cash Funds Released",         Icon: DollarSign,    description: "Your cash-out funds have been released and are available in your account. Transaction complete!", timeline: "Complete ✓", action: "Confirm receipt of funds in your account. Save all loan documents securely.", reassurance: "Congratulations — your equity is now in your hands. Put it to work wisely.", next: "Your first payment on the new loan is typically due within 30–60 days." },
];

const REVERSE_STAGES: StageDef[] = [
  { n: 1,  label: "Eligibility Check",           Icon: ShieldCheck,   description: "Your age, property type, and ownership status are being verified to confirm reverse mortgage eligibility.", timeline: "1–2 business days", action: "Confirm your current property is your primary residence. Provide any ownership documents if requested.", reassurance: "Eligibility review is a straightforward first step.", next: "HUD requires mandatory counseling before a reverse mortgage can proceed." },
  { n: 2,  label: "Mandatory Counseling",        Icon: BookOpen,      description: "You are completing the required HUD-approved reverse mortgage counseling session with an independent counselor.", timeline: "Complete at your pace", action: "Schedule your counseling session with a HUD-approved agency. Bring questions — this session is for your benefit.", reassurance: "Counseling protects you and ensures you fully understand all terms and implications.", next: "Once counseling is complete, your formal application will be submitted." },
  { n: 3,  label: "Application Submitted",       Icon: ClipboardList, description: "Your official reverse mortgage application has been submitted following the counseling requirement.", timeline: "1–2 business days", action: "Ensure your counseling certificate is included with your application materials.", reassurance: "Submitting your application is a significant step — your file is now active.", next: "A home appraisal will be ordered to determine your property's current value." },
  { n: 4,  label: "Home Appraisal",              Icon: Building2,     description: "A licensed FHA appraiser is assessing your home's current market value, which determines your available loan amount.", timeline: "5–10 business days", action: "Ensure your home is accessible and in reasonable condition for the appraiser's visit.", reassurance: "The appraisal is a critical step — it directly determines the funds available to you.", next: "Your financial profile will be reviewed to confirm program eligibility." },
  { n: 5,  label: "Financial Review",            Icon: Search,        description: "Your financial history is being reviewed to ensure you can maintain property taxes, insurance, and upkeep obligations.", timeline: "2–4 business days", action: "Provide any requested documentation of income, assets, or financial history promptly.", reassurance: "Financial review ensures this loan structure is the right long-term fit for you.", next: "Your complete file will move to underwriting for formal approval." },
  { n: 6,  label: "Underwriting Approval",       Icon: BadgeCheck,    description: "An underwriter is reviewing your complete file to confirm all FHA and lender guidelines are satisfied.", timeline: "5–10 business days", action: "Respond immediately to any underwriter conditions or additional document requests.", reassurance: "Reverse mortgage underwriting is comprehensive because this is a long-term financial commitment.", next: "Your final loan terms will be confirmed and prepared for closing." },
  { n: 7,  label: "Loan Terms Finalized",        Icon: FileText,      description: "Your reverse mortgage terms are finalized — including your available loan amount, draw options, and any monthly payments.", timeline: "1–2 business days", action: "Review and confirm all loan terms carefully. Discuss any questions about disbursement options with your loan officer.", reassurance: "Finalized terms give you full clarity on what to expect going forward.", next: "Your closing documents will be prepared and a signing appointment scheduled." },
  { n: 8,  label: "Closing Documents Signed",    Icon: KeyRound,      description: "You are signing your closing documents, formalizing your reverse mortgage agreement.", timeline: "Same day", action: "A notary or closing agent will guide you through each document. Ask questions — take your time.", reassurance: "Closing is a calm, supported process — your team will be with you.", next: "After a 3-day right of rescission period, your funds will be disbursed." },
  { n: 9,  label: "Funds Disbursed",             Icon: Sparkles,      description: "Your reverse mortgage funds have been disbursed as selected — lump sum, line of credit, or monthly payments.", timeline: "Complete ✓", action: "Continue paying property taxes, homeowner's insurance, and maintenance as required by your loan agreement.", reassurance: "Congratulations — your reverse mortgage is complete. Your home is working for you.", next: "No monthly mortgage payment is required while you live in the home as your primary residence." },
];

export const STAGE_MAP: Record<string, StageDef[]> = {
  buy:       BUY_STAGES,
  refinance: REFINANCE_STAGES,
  cashout:   CASHOUT_STAGES,
  reverse:   REVERSE_STAGES,
};

export function getStages(loanType: string): StageDef[] {
  return STAGE_MAP[loanType] ?? BUY_STAGES;
}

// ── Estimated completion ──────────────────────────────────────────────────────

function getEstimate(current: number, total: number): { label: string; window: string } {
  const remaining = Math.max(0, total - current);
  if (remaining === 0) return { label: "Complete", window: "All stages complete" };

  let min: number, max: number;
  const pct = remaining / total;
  if (pct >= 0.7)      { min = 20; max = 35; }
  else if (pct >= 0.5) { min = 12; max = 22; }
  else if (pct >= 0.3) { min = 6;  max = 14; }
  else if (pct >= 0.15){ min = 3;  max = 8;  }
  else                 { min = 1;  max = 4;  }

  const now = new Date();
  const s = new Date(now.getTime() + min * 86400000);
  const e = new Date(now.getTime() + max * 86400000);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return {
    label: `${min}–${max} business days`,
    window: `${fmt(s)} – ${fmt(e)}`,
  };
}

// ── Confidence config ─────────────────────────────────────────────────────────

function getConfidence(current: number, total: number) {
  const pct = current / total;
  if (current === 0)    return { label: "Not Started",      color: "text-muted-foreground",  bg: "bg-secondary border-border",             bar: 0   };
  if (pct >= 1)         return { label: "Complete",         color: "text-emerald-700",        bg: "bg-emerald-50 border-emerald-200",        bar: 100 };
  if (pct >= 0.75)      return { label: "Near Completion",  color: "text-emerald-600",        bg: "bg-emerald-50 border-emerald-100",        bar: 85  };
  if (pct >= 0.45)      return { label: "Mid Process",      color: "text-amber-600",          bg: "bg-amber-50 border-amber-100",            bar: 55  };
  return               { label: "Early Stage",             color: "text-sky-600",            bg: "bg-sky-50 border-sky-100",                bar: 20  };
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  currentStage: number;
  loanType: string;
  history: StageHistoryEntry[];
  updatedAt?: string;
}

export function LoanProgressTracker({ currentStage, loanType, history, updatedAt }: Props) {
  const [expanded, setExpanded] = useState<number | null>(currentStage > 0 ? currentStage : null);
  const [showHistory, setShowHistory] = useState(false);

  const stages = getStages(loanType);
  const total   = stages.length;
  const conf    = getConfidence(currentStage, total);
  const est     = getEstimate(currentStage, total);

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

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-6">

      {/* ── Confidence + estimated completion ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`border rounded-2xl p-5 space-y-4 ${conf.bg}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${conf.color}`}>{conf.label}</span>
              <span className="text-xs text-muted-foreground">· Stage {currentStage} of {total}</span>
            </div>
            <div className="w-full bg-black/8 rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf.bar}%` }}
                transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground sm:max-w-[180px] sm:text-right leading-relaxed">
            You are progressing normally through the mortgage process.
          </p>
        </div>

        {currentStage < total && (
          <div className="flex flex-col sm:flex-row gap-4 border-t border-black/8 pt-4">
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Estimated time remaining
              </p>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{est.label}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                Estimated closing window
              </p>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground">{est.window}</span>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Timeline ──────────────────────────────────────────────────── */}
      <div>
        {stages.map((stage, idx) => {
          const isCompleted = stage.n < currentStage;
          const isActive    = stage.n === currentStage;
          const isUpcoming  = stage.n > currentStage;
          const isExpanded  = expanded === stage.n;
          const isLast      = idx === stages.length - 1;
          const clickable   = true;

          // Find matching history entry for completed stages
          const histEntry = history.filter(h => h.stage === stage.n).pop();

          return (
            <div key={stage.n} className="flex gap-4">
              {/* Node + connector */}
              <div className="flex flex-col items-center">
                <motion.div
                  onClick={() => setExpanded(isExpanded ? null : stage.n)}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.93 }}
                  className={`relative w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all select-none cursor-pointer ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isActive
                        ? "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20"
                        : "bg-secondary border-2 border-border text-muted-foreground/50 hover:border-primary/40 hover:text-muted-foreground"
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
                  <div className={`flex-1 min-h-5 mt-1 mb-1 transition-colors ${
                    isCompleted
                      ? "w-0.5 bg-emerald-400"
                      : "border-l-2 border-dashed border-border w-0"
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-5 pt-1">
                <button
                  onClick={() => setExpanded(isExpanded ? null : stage.n)}
                  className="w-full text-left group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-semibold leading-snug ${
                          isCompleted ? "text-emerald-700"
                          : isActive   ? "text-foreground"
                          :              "text-muted-foreground/60"
                        }`}>
                          {stage.label}
                        </p>
                        {isActive && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-primary/10 text-primary rounded-full px-2 py-0.5 leading-none shrink-0">
                            Current
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 leading-none shrink-0">
                            ✓ Done
                          </span>
                        )}
                        {isUpcoming && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-secondary text-muted-foreground/60 rounded-full px-2 py-0.5 leading-none shrink-0">
                            Upcoming
                          </span>
                        )}
                      </div>
                      {/* Timestamp for completed stages */}
                      {isCompleted && histEntry && (
                        <p className="text-[11px] text-emerald-600/80 mt-0.5 font-medium">
                          {histEntry.timestamp}
                          {histEntry.officerTag && ` · ${histEntry.officerTag}`}
                        </p>
                      )}
                      {/* Timeline shown for all non-completed stages */}
                      {!isCompleted && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {stage.timeline}
                        </p>
                      )}
                    </div>
                    {isExpanded
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    }
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 bg-secondary/50 border border-border/60 rounded-2xl p-5 space-y-4">
                        <p className="text-sm text-foreground leading-relaxed">{stage.description}</p>

                        <div className="space-y-3 border-t border-border/40 pt-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                              What you should prepare
                            </p>
                            <p className="text-sm text-foreground">{stage.action}</p>
                          </div>

                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                            <p className="text-sm text-emerald-800 italic">"{stage.reassurance}"</p>
                          </div>

                          {stage.n < total && (
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                                What happens next
                              </p>
                              <p className="text-sm text-muted-foreground flex gap-2 items-start">
                                <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                                {stage.next}
                              </p>
                            </div>
                          )}

                          {isCompleted && histEntry?.note && (
                            <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Loan Officer Note</p>
                              <p className="text-sm text-foreground">"{histEntry.note}"</p>
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

      {/* ── Activity history feed ─────────────────────────────────────── */}
      {sortedHistory.length > 0 && (
        <div className="border-t border-border pt-5 space-y-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
          >
            <Activity className="w-4 h-4" />
            Activity History ({sortedHistory.length} update{sortedHistory.length !== 1 ? "s" : ""})
            {showHistory
              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
            }
          </button>

          <AnimatePresence initial={false}>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-1">
                  {sortedHistory.map((entry, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex gap-3 bg-secondary/40 border border-border/50 rounded-xl px-4 py-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-foreground">{entry.label}</p>
                          <span className="text-[11px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 shrink-0">
                            Stage {entry.stage}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.timestamp} · {entry.officerTag}
                        </p>
                        {entry.note && (
                          <p className="text-xs text-foreground/70 mt-1 italic">"{entry.note}"</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <div className="border-t border-border pt-4 space-y-1">
        <p className="text-xs text-muted-foreground">
          Timelines are estimates and may vary depending on documentation, underwriting, and external processing factors.
        </p>
        {updatedAt && (
          <p className="text-xs text-muted-foreground">Last updated: {updatedAt}</p>
        )}
      </div>
    </div>
  );
}
