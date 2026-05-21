import { useState, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Search, Phone, ShieldCheck, BookOpen,
  AlertCircle, User, Briefcase, Mail, Lock, Unlock,
  Activity, CheckCircle2, Save, MessageSquare,
  FileX, ArrowRight, UploadCloud, Clock, FolderX, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentChecklist, getDocList } from "@/components/DocumentChecklist";
import {
  LoanProgressTracker,
  getStages,
  buildTimestamp,
  type StageHistoryEntry,
  type StoredStageData,
} from "@/components/LoanProgressTracker";

// ── Constants ─────────────────────────────────────────────────────────────────

const BRIEF_KEY_PREFIX   = "lb_brief_";
const CONTACT_KEY_PREFIX = "lb_contact_";
const STAGE_KEY_PREFIX   = "lb_stage_";
const DOCS_KEY_PREFIX    = "lb_docs_";

const LO_OVERRIDE_CODE = "LBLO2025";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoredBrief {
  code: string;
  date: string;
  goal: string;
  fullName?: string;
  creditScore: string;
  employmentType: string;
  profile: Record<string, string>;
  estimate: { label: string; low: string; high: string };
  scenarios: string[];
  questions: string[];
}

interface StoredContact {
  name?: string;
  email?: string;
  phone?: string;
}

function getTypeLabel(type: string) {
  if (type === "buy") return "Buy a Home";
  if (type === "refinance") return "Refinance";
  if (type === "cashout") return "Cash-Out Refinance";
  if (type === "reverse") return "Reverse Mortgage";
  if (type === "second") return "2nd Mortgage";
  return type;
}

interface DocsStatus {
  complete: boolean;
  totalRequired: number;
  uploaded: number;
  missing: string[];
}

function checkDocs(code: string, goal: string, creditScore: string, employmentType: string): DocsStatus {
  try {
    const raw = localStorage.getItem(DOCS_KEY_PREFIX + code);
    const states: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    const allDocs = getDocList(goal, creditScore, employmentType);
    const required = allDocs.filter(d => d.required);
    const missing = required.filter(d => !states[d.id]).map(d => d.title);
    return {
      complete: missing.length === 0,
      totalRequired: required.length,
      uploaded: required.length - missing.length,
      missing,
    };
  } catch {
    return { complete: false, totalRequired: 0, uploaded: 0, missing: [] };
  }
}

function loadStageData(code: string): StoredStageData {
  try {
    const raw = localStorage.getItem(STAGE_KEY_PREFIX + code);
    if (!raw) return { currentStage: 0, loanType: "buy", history: [], updatedAt: "" };
    const parsed = JSON.parse(raw) as Partial<StoredStageData & { stage?: number }>;
    return {
      currentStage: parsed.currentStage ?? parsed.stage ?? 0,
      loanType: parsed.loanType ?? "buy",
      history: parsed.history ?? [],
      updatedAt: parsed.updatedAt ?? "",
      archived: parsed.archived,
      archiveReason: parsed.archiveReason,
      archiveNote: parsed.archiveNote,
      archiveOfficer: parsed.archiveOfficer,
      archiveTimestamp: parsed.archiveTimestamp,
    };
  } catch {
    return { currentStage: 0, loanType: "buy", history: [], updatedAt: "" };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LookupBrief() {
  const [input, setInput]       = useState("");
  const [result, setResult]     = useState<StoredBrief | null>(null);
  const [contact, setContact]   = useState<StoredContact | null>(null);
  const [error, setError]       = useState("");
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"officer" | "progress" | "client">("officer");
  const inputRef = useRef<HTMLInputElement>(null);

  // Always re-read localStorage when switching to Progress so partial uploads
  // made in the same or a previous session are reflected immediately.
  const switchTab = (tab: "officer" | "progress" | "client") => {
    if (tab === "progress" && result) {
      setDocsStatus(checkDocs(result.code, result.goal ?? "buy", result.creditScore ?? "", result.employmentType ?? ""));
    }
    setActiveTab(tab);
  };

  // Stage state
  const [stageData, setStageData] = useState<StoredStageData>({
    currentStage: 0, loanType: "buy", history: [], updatedAt: "",
  });

  // LO override state
  const [loCodeInput, setLoCodeInput]   = useState("");
  const [loUnlocked, setLoUnlocked]     = useState(false);
  const [loError, setLoError]           = useState("");
  const [pendingStage, setPendingStage] = useState(0);
  const [loNote, setLoNote]             = useState("");
  const [stageSaved, setStageSaved]     = useState(false);

  // Archive state
  const [showArchivePanel, setShowArchivePanel]     = useState(false);
  const [archiveReason, setArchiveReason]           = useState("");
  const [archiveCustomNote, setArchiveCustomNote]   = useState("");
  const [archiveConfirming, setArchiveConfirming]   = useState(false);
  const [archiveSaved, setArchiveSaved]             = useState(false);
  const [archiveCodeInput, setArchiveCodeInput]     = useState("");
  const [archiveCodeError, setArchiveCodeError]     = useState("");

  // Reopen state
  const [showReopenPanel, setShowReopenPanel]       = useState(false);
  const [reopenCodeInput, setReopenCodeInput]       = useState("");
  const [reopenCodeError, setReopenCodeError]       = useState("");
  const [reopenUnlocked, setReopenUnlocked]         = useState(false);
  const [reopenMode, setReopenMode]                 = useState<"same" | "update" | null>(null);
  const [editableProfile, setEditableProfile]       = useState<Record<string, string>>({});
  const [editableCreditScore, setEditableCreditScore] = useState("");
  const [editableEmploymentType, setEditableEmploymentType] = useState("");
  const [editableGoal, setEditableGoal]             = useState("");

  // Doc gate state
  const [docsStatus, setDocsStatus] = useState<DocsStatus>({
    complete: false, totalRequired: 0, uploaded: 0, missing: [],
  });

  // ── Code input ────────────────────────────────────────────────────────────
  const handleInput = (raw: string) => {
    const clean = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12);
    let formatted = "";
    for (let i = 0; i < clean.length; i++) {
      if (i === 0) formatted += "-";
      formatted += clean[i];
      if (i === 3 || i === 7) formatted += "-";
    }
    setInput(formatted);
    setError("");
    setSearched(false);
    setResult(null);
    setStageData({ currentStage: 0, loanType: "buy", history: [], updatedAt: "" });
    setDocsStatus({ complete: false, totalRequired: 0, uploaded: 0, missing: [] });
    setLoUnlocked(false);
    setLoCodeInput("");
    setLoError("");
    setStageSaved(false);
    setPendingStage(0);
    setLoNote("");
    setShowArchivePanel(false);
    setArchiveReason("");
    setArchiveCustomNote("");
    setArchiveConfirming(false);
    setArchiveSaved(false);
    setArchiveCodeInput("");
    setArchiveCodeError("");
    setShowReopenPanel(false);
    setReopenCodeInput("");
    setReopenCodeError("");
    setReopenUnlocked(false);
    setReopenMode(null);
    setEditableProfile({});
    setEditableCreditScore("");
    setEditableEmploymentType("");
    setEditableGoal("");
  };

  const handleLookup = () => {
    const stripped = input.replace(/-/g, "");
    if (stripped.length < 12) {
      setError("Please enter a complete 12-character client code.");
      return;
    }
    const stored = localStorage.getItem(BRIEF_KEY_PREFIX + input);
    setSearched(true);
    if (!stored) {
      setResult(null);
      setContact(null);
      setError("No brief found for that code. Double-check the code and try again.");
    } else {
      try {
        const brief = JSON.parse(stored) as StoredBrief;
        setResult(brief);
        setError("");
        try {
          const raw = localStorage.getItem(CONTACT_KEY_PREFIX + input);
          setContact(raw ? (JSON.parse(raw) as StoredContact) : null);
        } catch { setContact(null); }

        const sd = loadStageData(input);
        if (!sd.loanType || sd.loanType === "buy") sd.loanType = brief.goal ?? "buy";
        setStageData(sd);
        setPendingStage(sd.currentStage > 0 ? sd.currentStage : 1);

        // Check required documents
        setDocsStatus(checkDocs(input, brief.goal ?? "buy", brief.creditScore ?? "", brief.employmentType ?? ""));
      } catch {
        setError("The brief data appears to be corrupted. Ask the client to generate a new code.");
      }
    }
  };

  // ── LO unlock ─────────────────────────────────────────────────────────────
  const handleLoUnlock = () => {
    if (loCodeInput.trim().toUpperCase().replace(/[-\s]/g, "") === LO_OVERRIDE_CODE) {
      setLoUnlocked(true);
      setLoError("");
      if (stageData.currentStage > 0) setPendingStage(stageData.currentStage);
      else setPendingStage(1);
    } else {
      setLoError("Incorrect override code. Please try again.");
    }
  };

  // ── Save stage (accepts stage number directly) ────────────────────────────
  const handleSaveStage = (stageN: number) => {
    if (!result || stageN < 1) return;
    const stages = getStages(result.goal ?? "buy");
    const stageLabel = stages.find(s => s.n === stageN)?.label ?? `Stage ${stageN}`;
    const ts = buildTimestamp();

    const entry: StageHistoryEntry = {
      stage: stageN,
      label: stageLabel,
      timestamp: ts,
      note: loNote.trim() || undefined,
      officerTag: "Loan Officer",
    };

    const updated: StoredStageData = {
      currentStage: stageN,
      loanType: result.goal ?? "buy",
      history: [...stageData.history, entry],
      updatedAt: ts,
    };

    try {
      localStorage.setItem(STAGE_KEY_PREFIX + result.code, JSON.stringify(updated));
      setStageData(updated);
      setStageSaved(true);
      setLoNote("");
      setTimeout(() => setStageSaved(false), 4000);
    } catch {}
  };

  // ── Archive / close file ──────────────────────────────────────────────────
  const ARCHIVE_REASONS = [
    "Not qualified",
    "No longer interested",
    "Incomplete information",
    "Duplicate application",
    "Other (manual note)",
  ];

  const handleArchive = () => {
    if (!result || !archiveReason) return;
    if (archiveCodeInput.trim().toUpperCase().replace(/[-\s]/g, "") !== LO_OVERRIDE_CODE) {
      setArchiveCodeError("Incorrect code. Please try again.");
      return;
    }
    const ts = buildTimestamp();
    const updated: StoredStageData = {
      ...stageData,
      archived: true,
      archiveReason,
      archiveNote: archiveCustomNote.trim() || undefined,
      archiveOfficer: "Loan Officer",
      archiveTimestamp: ts,
    };
    try {
      localStorage.setItem(STAGE_KEY_PREFIX + result.code, JSON.stringify(updated));
      setStageData(updated);
      setArchiveSaved(true);
      setShowArchivePanel(false);
      setArchiveConfirming(false);
      setArchiveCodeInput("");
      setArchiveCodeError("");
    } catch {}
  };

  // ── Reopen closed file ────────────────────────────────────────────────────
  const CREDIT_OPTIONS = [
    "Poor (below 580)", "Fair (580–669)", "Good (670–739)",
    "Very Good (740–799)", "Excellent (800+)",
  ];
  const EMPLOYMENT_OPTIONS = ["employed", "self-employed", "retired", "other"];
  const GOAL_OPTIONS = [
    { value: "buy",       label: "Buy a Home" },
    { value: "refinance", label: "Refinance" },
    { value: "cashout",   label: "Cash-Out Refinance" },
    { value: "reverse",   label: "Reverse Mortgage" },
    { value: "second",    label: "2nd Mortgage" },
  ];

  const handleReopenUnlock = () => {
    if (!result) return;
    if (reopenCodeInput.trim().toUpperCase().replace(/[-\s]/g, "") !== LO_OVERRIDE_CODE) {
      setReopenCodeError("Incorrect code. Please try again.");
      return;
    }
    setReopenUnlocked(true);
    setReopenCodeError("");
    // Pre-fill editable fields from existing brief
    setEditableProfile({ ...result.profile });
    setEditableCreditScore(result.creditScore ?? "");
    setEditableEmploymentType(result.employmentType ?? "");
    setEditableGoal(result.goal ?? "buy");
  };

  const handleReopenConfirm = () => {
    if (!result) return;
    // Reopen stage data
    const updatedStage: StoredStageData = {
      ...stageData,
      archived: false,
      archiveReason: undefined,
      archiveNote: undefined,
      archiveOfficer: undefined,
      archiveTimestamp: undefined,
    };
    try {
      localStorage.setItem(STAGE_KEY_PREFIX + result.code, JSON.stringify(updatedStage));
      setStageData(updatedStage);

      // If updating profile, save updated brief too
      if (reopenMode === "update") {
        const updatedBrief: StoredBrief = {
          ...result,
          creditScore: editableCreditScore,
          employmentType: editableEmploymentType,
          goal: editableGoal,
          profile: editableProfile,
        };
        localStorage.setItem(BRIEF_KEY_PREFIX + result.code, JSON.stringify(updatedBrief));
        setResult(updatedBrief);
      }

      setShowReopenPanel(false);
      setReopenUnlocked(false);
      setReopenMode(null);
      setReopenCodeInput("");
      setReopenCodeError("");
      setActiveTab("officer");
    } catch {}
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-secondary/30 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground -ml-2">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
            <ShieldCheck className="w-4 h-4" />
            Loan Lookup
          </div>
          <h1 className="font-serif text-4xl font-semibold text-foreground">Client Code Lookup</h1>
          <p className="text-muted-foreground text-lg">
            Enter a client code to view the profile brief, track loan progress, or upload documents.
          </p>
        </div>

        {/* Code Input */}
        <div className="bg-card border border-border rounded-3xl p-8 space-y-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Client Reference Code</label>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
              placeholder="-XAFG-3328-KFKA"
              spellCheck={false}
              maxLength={15}
              className="w-full h-16 rounded-2xl border border-border bg-secondary/50 px-6 text-2xl font-mono font-semibold tracking-widest text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-center"
              data-testid="input-code"
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Format: -XXXX-0000-XXXX (auto-formatted as you type)
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-3 bg-destructive/8 border border-destructive/20 rounded-xl p-4 text-sm text-destructive"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleLookup}
            size="lg"
            className="w-full h-14 rounded-full text-base font-semibold"
            disabled={input.replace(/-/g, "").length < 12}
            data-testid="button-lookup"
          >
            <Search className="w-5 h-5 mr-2" />
            Look Up Code
          </Button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {result && stageData.archived ? (
            /* ── Archived / closed file view ─────────────────────────────── */
            <motion.div
              key="closed"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-md space-y-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FolderX className="w-5 h-5" />
                  <span className="font-semibold text-lg">LoansBetter Client File</span>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-muted-foreground">{result.code}</p>
                  <p className="text-xs text-muted-foreground">{result.date}</p>
                </div>
              </div>

              {/* Closed banner */}
              <div className="flex items-start gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <FolderX className="w-6 h-6 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="font-bold text-slate-700 text-lg">File Closed</p>
                  <p className="text-sm text-slate-500">
                    This client file has been closed and is no longer active.
                  </p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                {stageData.archiveReason && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Reason</p>
                    <p className="text-foreground font-medium">{stageData.archiveReason}</p>
                  </div>
                )}
                {stageData.archiveNote && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Officer Note</p>
                    <p className="text-foreground italic">"{stageData.archiveNote}"</p>
                  </div>
                )}
                {stageData.archiveTimestamp && (
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Closed On</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {stageData.archiveTimestamp}
                      {stageData.archiveOfficer && ` · ${stageData.archiveOfficer}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Questions? Reach your loan officer directly.</p>
                <a
                  href="tel:7144944172"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 h-11 font-medium text-sm hover:bg-primary/90 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  714-494-4172
                </a>
              </div>

              {/* ── Loan Officer Tool ──────────────────────────────────── */}
              <div className="border-t border-border pt-6 space-y-3">
                <button
                  onClick={() => {
                    const next = !showReopenPanel;
                    setShowReopenPanel(next);
                    if (!next) { setReopenUnlocked(false); setReopenMode(null); setReopenCodeInput(""); setReopenCodeError(""); }
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                      {reopenUnlocked
                        ? <Unlock className="w-3.5 h-3.5 text-amber-700" />
                        : <Lock className="w-3.5 h-3.5 text-amber-700" />}
                    </div>
                    <span className="text-sm font-semibold text-amber-800">Loan Officer Tool</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-amber-500 transition-transform ${showReopenPanel ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence initial={false}>
                  {showReopenPanel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 pt-1 pb-1">

                        {/* ── Step 1: Code entry ── */}
                        {!reopenUnlocked && (
                          <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">Enter your override code to unlock reactivation options.</p>
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={reopenCodeInput}
                                onChange={(e) => { setReopenCodeInput(e.target.value); setReopenCodeError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && handleReopenUnlock()}
                                placeholder="Override code"
                                className="flex-1 h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                              />
                              <Button
                                onClick={handleReopenUnlock}
                                disabled={!reopenCodeInput.trim()}
                                className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Unlock
                              </Button>
                            </div>
                            <AnimatePresence>
                              {reopenCodeError && (
                                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                  className="text-xs text-destructive flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />{reopenCodeError}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        {/* ── Step 2: Choose reactivation mode ── */}
                        {reopenUnlocked && reopenMode === null && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                            <div className="flex items-center gap-2 text-amber-700 mb-1">
                              <Unlock className="w-4 h-4" />
                              <p className="text-sm font-semibold">Override verified — choose how to reactivate</p>
                            </div>
                            <button
                              onClick={() => setReopenMode("same")}
                              className="w-full text-left px-4 py-4 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors space-y-0.5"
                            >
                              <p className="text-sm font-semibold text-emerald-800">Reactivate — Keep Current Profile</p>
                              <p className="text-xs text-emerald-700/80">Restore the file exactly as-is. All existing stages and history are preserved.</p>
                            </button>
                            <button
                              onClick={() => setReopenMode("update")}
                              className="w-full text-left px-4 py-4 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors space-y-0.5"
                            >
                              <p className="text-sm font-semibold text-amber-800">Reactivate — Update Client Profile</p>
                              <p className="text-xs text-amber-700/80">Reopen and update the client's qualifications before reactivating (e.g. credit improved, new loan type).</p>
                            </button>
                          </motion.div>
                        )}

                        {/* ── Step 3a: Same profile confirm ── */}
                        {reopenUnlocked && reopenMode === "same" && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <p className="text-sm font-semibold text-emerald-800">Reactivate with current profile?</p>
                            <p className="text-xs text-emerald-700/80 leading-relaxed">
                              The file will be reopened. All previous stages and history remain intact. No profile data is changed.
                            </p>
                            <div className="flex gap-2 pt-1">
                              <Button onClick={() => setReopenMode(null)} variant="outline" size="sm" className="flex-1">Back</Button>
                              <Button onClick={handleReopenConfirm} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white">
                                Confirm Reactivation
                              </Button>
                            </div>
                          </motion.div>
                        )}

                        {/* ── Step 3b: Update profile form ── */}
                        {reopenUnlocked && reopenMode === "update" && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                              <p className="text-xs font-semibold text-amber-800 uppercase tracking-widest mb-0.5">Update Client Profile</p>
                              <p className="text-xs text-amber-700/80">Edit the fields that have changed. These will overwrite the existing brief on reactivation.</p>
                            </div>

                            {/* Loan type */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Loan Type</label>
                              <div className="grid grid-cols-2 gap-2">
                                {GOAL_OPTIONS.map(opt => (
                                  <button key={opt.value} onClick={() => setEditableGoal(opt.value)}
                                    className={`px-3 py-2.5 rounded-xl text-sm border transition-all text-left ${editableGoal === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}>
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Credit score */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Credit Score</label>
                              <div className="space-y-1.5">
                                {CREDIT_OPTIONS.map(opt => (
                                  <button key={opt} onClick={() => setEditableCreditScore(opt)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${editableCreditScore === opt ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}>
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Employment type */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Employment</label>
                              <div className="grid grid-cols-2 gap-2">
                                {EMPLOYMENT_OPTIONS.map(opt => (
                                  <button key={opt} onClick={() => setEditableEmploymentType(opt)}
                                    className={`px-3 py-2.5 rounded-xl text-sm border transition-all capitalize ${editableEmploymentType === opt ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary/50"}`}>
                                    {opt}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Profile key/value pairs */}
                            {Object.keys(editableProfile).length > 0 && (
                              <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Profile Details</label>
                                {Object.entries(editableProfile).map(([label, value]) => (
                                  <div key={label} className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground w-36 shrink-0">{label}</span>
                                    <input
                                      type="text"
                                      value={value}
                                      onChange={(e) => setEditableProfile(prev => ({ ...prev, [label]: e.target.value }))}
                                      className="flex-1 h-9 rounded-lg border border-border bg-secondary/50 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2 pt-2 border-t border-border">
                              <Button onClick={() => setReopenMode(null)} variant="outline" size="sm" className="flex-1">Back</Button>
                              <Button onClick={handleReopenConfirm} size="sm" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white">
                                Save & Reactivate
                              </Button>
                            </div>
                          </motion.div>
                        )}

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Tabs */}
              <div className="flex gap-2 bg-secondary rounded-2xl p-1.5">
                {(["officer", "progress", "client"] as const).map((tab) => {
                  const labels: Record<string, { icon: React.ReactNode; label: string }> = {
                    officer:  { icon: <Briefcase className="w-4 h-4" />,  label: "Loan Officer" },
                    progress: { icon: <Activity className="w-4 h-4" />,   label: "Progress" },
                    client:   { icon: <User className="w-4 h-4" />,       label: "Documents" },
                  };
                  const t = labels[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => switchTab(tab)}
                      className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all ${
                        activeTab === tab
                          ? "bg-card shadow-sm text-foreground border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {t.icon}
                      <span className="hidden sm:inline">{t.label}</span>
                      <span className="sm:hidden">{tab === "officer" ? "Officer" : t.label}</span>
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">

                {/* ── Loan Officer Brief ─────────────────────────────── */}
                {activeTab === "officer" && (
                  <motion.div
                    key="officer"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-3xl p-8 md:p-10 space-y-10 shadow-md"
                  >
                    <div className="flex items-center justify-between border-b border-border pb-6">
                      <div className="flex items-center gap-2 text-primary">
                        <ShieldCheck className="w-5 h-5" />
                        <span className="font-semibold text-lg">LoansBetter Client Brief</span>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm font-bold text-primary">{result.code}</p>
                        <p className="text-xs text-muted-foreground">{result.date}</p>
                      </div>
                    </div>

                    <section>
                      <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Goal</h3>
                      <p className="text-2xl font-serif text-foreground">{getTypeLabel(result.goal)}</p>
                    </section>

                    {(contact?.name || result.fullName) && (
                      <section>
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Client Name</h3>
                        <p className="text-2xl font-serif text-foreground">{contact?.name || result.fullName}</p>
                      </section>
                    )}

                    {result.employmentType && (
                      <section>
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">Employment</h3>
                        <p className="text-foreground capitalize">{result.employmentType}</p>
                      </section>
                    )}

                    <section>
                      <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">Client Profile</h3>
                      <div className="grid sm:grid-cols-2 gap-y-3 gap-x-8">
                        {Object.entries(result.profile).map(([label, value]) => (
                          <div key={label} className="flex justify-between border-b border-border/40 pb-2">
                            <span className="text-muted-foreground text-sm">{label}</span>
                            <span className="font-medium text-foreground text-sm">{value}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                      <h3 className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Estimate</h3>
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                        <span className="text-muted-foreground text-sm">{result.estimate.label}</span>
                        <span className="text-3xl font-bold text-primary">
                          {result.estimate.low} – {result.estimate.high}
                        </span>
                      </div>
                    </section>

                    {result.scenarios.length > 0 && (
                      <section>
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">Scenarios Explored</h3>
                        <ul className="space-y-2">
                          {result.scenarios.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-primary mt-0.5">•</span> {s}
                            </li>
                          ))}
                        </ul>
                      </section>
                    )}

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Questions the Client Asked</h3>
                      </div>
                      {result.questions.length > 0 ? (
                        <ul className="space-y-3">
                          {result.questions.map((q, i) => (
                            <li key={i} className="bg-secondary rounded-xl p-4 text-sm text-foreground flex gap-3">
                              <span className="text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                              <span>"{q}"</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground italic text-sm">Client did not use the AI chat.</p>
                      )}
                    </section>

                    {/* Contact */}
                    <div className="pt-4 border-t border-border space-y-4">
                      {(contact?.name || contact?.email || contact?.phone) && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Client Contact Info</p>
                          <div className="flex flex-col gap-2">
                            {contact?.name && (
                              <div className="inline-flex items-center gap-2 text-sm text-foreground font-medium">
                                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                                {contact.name}
                              </div>
                            )}
                            {contact?.email && (
                              <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2 text-sm text-foreground font-medium hover:text-primary transition-colors">
                                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                                {contact.email}
                              </a>
                            )}
                            {contact?.phone && (
                              <a href={`tel:${contact.phone.replace(/\D/g, "")}`} className="inline-flex items-center gap-2 text-sm text-foreground font-medium hover:text-primary transition-colors">
                                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">Get a hold of your loan officer</p>
                        <a href="tel:7144944172" className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 h-11 font-medium text-sm hover:bg-primary/90 transition-all">
                          <Phone className="w-4 h-4" />
                          714-494-4172
                        </a>
                      </div>
                    </div>

                    {/* ── LO Controls ──────────────────────────────────── */}
                    <div className="border-t border-border pt-8 space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          {loUnlocked
                            ? <Unlock className="w-4 h-4 text-amber-700" />
                            : <Lock className="w-4 h-4 text-amber-700" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">Loan Officer Controls</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {loUnlocked
                              ? "Override verified — select a stage, add an optional note, and save."
                              : "Enter your override code to update this client's loan stage."}
                          </p>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {!loUnlocked ? (
                          <motion.div key="locked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="password"
                                value={loCodeInput}
                                onChange={(e) => { setLoCodeInput(e.target.value); setLoError(""); }}
                                onKeyDown={(e) => e.key === "Enter" && handleLoUnlock()}
                                placeholder="Override code"
                                className="flex-1 h-11 rounded-xl border border-border bg-secondary/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                              />
                              <Button
                                onClick={handleLoUnlock}
                                disabled={!loCodeInput.trim()}
                                className="h-11 px-5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Unlock
                              </Button>
                            </div>
                            {loError && (
                              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" /> {loError}
                              </motion.p>
                            )}
                          </motion.div>
                        ) : (
                          <motion.div key="unlocked" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">

                            {/* Optional note — typed before pressing ✓ */}
                            <div className="space-y-1.5">
                              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                <MessageSquare className="w-3.5 h-3.5" />
                                Note for client (optional)
                              </label>
                              <textarea
                                value={loNote}
                                onChange={(e) => setLoNote(e.target.value)}
                                placeholder="e.g. Documents verified. Moving to underwriting."
                                rows={2}
                                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                              />
                              <p className="text-[11px] text-muted-foreground">
                                Add a note above, then press ✓ on any stage to mark it current.
                              </p>
                            </div>

                            {/* Stage list — instant ✓ per row */}
                            <div className="space-y-1.5">
                              {getStages(result.goal ?? "buy").map((stage) => {
                                const isCurrent = stageData.currentStage === stage.n;
                                const isPast    = stageData.currentStage > stage.n;
                                return (
                                  <div
                                    key={stage.n}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                      isCurrent
                                        ? "border-emerald-300 bg-emerald-50"
                                        : isPast
                                          ? "border-emerald-100 bg-emerald-50/40"
                                          : "border-border bg-secondary/30"
                                    }`}
                                  >
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                                      isCurrent ? "bg-emerald-500 text-white"
                                      : isPast  ? "bg-emerald-300 text-white"
                                      :           "bg-border text-muted-foreground"
                                    }`}>
                                      {(isCurrent || isPast)
                                        ? <CheckCircle2 className="w-3.5 h-3.5" />
                                        : <stage.Icon className="w-3.5 h-3.5" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium leading-snug ${
                                        isCurrent ? "text-emerald-800"
                                        : isPast  ? "text-emerald-700"
                                        :           "text-foreground"
                                      }`}>
                                        {stage.n}. {stage.label}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{stage.timeline}</p>
                                    </div>

                                    {/* Instant ✓ button */}
                                    <button
                                      onClick={() => handleSaveStage(stage.n)}
                                      title="Mark as current stage"
                                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110 active:scale-95 ${
                                        isCurrent
                                          ? "bg-emerald-500 text-white shadow-sm"
                                          : "bg-secondary border border-border text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                                      }`}
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Success flash */}
                            <AnimatePresence>
                              {stageSaved && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4"
                                >
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                  <div>
                                    <p className="text-sm font-semibold text-emerald-800">Stage updated — timestamp logged</p>
                                    <p className="text-xs text-emerald-700 mt-0.5">{stageData.updatedAt}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            {/* ── Client Status Control ──────────────── */}
                            <div className="border-t border-border pt-6 space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                    <FolderX className="w-3.5 h-3.5 text-slate-500" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground">Client Status Control</p>
                                    <p className="text-xs text-muted-foreground">Close or archive this client file permanently.</p>
                                  </div>
                                </div>
                              </div>

                              {stageData.archived ? (
                                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                                  <FolderX className="w-4 h-4 text-slate-500 shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-slate-700">File closed — {stageData.archiveReason}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{stageData.archiveTimestamp} · {stageData.archiveOfficer}</p>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setShowArchivePanel(!showArchivePanel)}
                                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <FolderX className="w-4 h-4 text-slate-500" />
                                      <span className="text-sm font-medium text-slate-700">End / Archive Client File</span>
                                    </div>
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showArchivePanel ? "rotate-180" : ""}`} />
                                  </button>

                                  <AnimatePresence initial={false}>
                                    {showArchivePanel && (
                                      <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.22 }}
                                        className="overflow-hidden"
                                      >
                                        <div className="space-y-4 pt-1 pb-1">
                                          {/* Reason picker */}
                                          <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Reason for closing</p>
                                            <div className="space-y-1.5">
                                              {ARCHIVE_REASONS.map((reason) => (
                                                <button
                                                  key={reason}
                                                  onClick={() => { setArchiveReason(reason); setArchiveConfirming(false); }}
                                                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                                                    archiveReason === reason
                                                      ? "bg-slate-700 text-white border-slate-700"
                                                      : "bg-card border-border text-foreground hover:border-slate-400"
                                                  }`}
                                                >
                                                  {reason}
                                                </button>
                                              ))}
                                            </div>
                                          </div>

                                          {/* Optional manual note */}
                                          <div>
                                            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-1.5">
                                              Officer note (optional)
                                            </label>
                                            <textarea
                                              value={archiveCustomNote}
                                              onChange={(e) => setArchiveCustomNote(e.target.value)}
                                              placeholder="Add context for internal records…"
                                              rows={2}
                                              className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-slate-400/30 focus:border-slate-400 transition-all resize-none"
                                            />
                                          </div>

                                          {/* Confirm step */}
                                          {!archiveConfirming ? (
                                            <Button
                                              onClick={() => { setArchiveConfirming(true); setArchiveCodeInput(""); setArchiveCodeError(""); }}
                                              disabled={!archiveReason}
                                              variant="outline"
                                              className="w-full border-slate-400 text-slate-700 hover:bg-slate-100"
                                            >
                                              <FolderX className="w-4 h-4 mr-2" />
                                              Continue to Close File
                                            </Button>
                                          ) : (
                                            <motion.div
                                              initial={{ opacity: 0, y: 4 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              className="space-y-4 bg-red-50 border border-red-200 rounded-xl p-4"
                                            >
                                              <div>
                                                <p className="text-sm font-semibold text-red-800">
                                                  Confirm closure — re-enter your officer code
                                                </p>
                                                <p className="text-xs text-red-700/80 leading-relaxed mt-1">
                                                  Reason: <strong>{archiveReason}</strong>. This permanently marks the file CLOSED. To confirm, re-enter the override code below.
                                                </p>
                                              </div>
                                              <div className="space-y-2">
                                                <input
                                                  type="password"
                                                  value={archiveCodeInput}
                                                  onChange={(e) => { setArchiveCodeInput(e.target.value); setArchiveCodeError(""); }}
                                                  onKeyDown={(e) => e.key === "Enter" && handleArchive()}
                                                  placeholder="Override code"
                                                  className="w-full h-11 rounded-xl border border-red-300 bg-white px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 transition-all"
                                                />
                                                <AnimatePresence>
                                                  {archiveCodeError && (
                                                    <motion.p
                                                      initial={{ opacity: 0, y: -4 }}
                                                      animate={{ opacity: 1, y: 0 }}
                                                      exit={{ opacity: 0 }}
                                                      className="text-xs text-red-700 flex items-center gap-1.5"
                                                    >
                                                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                                      {archiveCodeError}
                                                    </motion.p>
                                                  )}
                                                </AnimatePresence>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button
                                                  onClick={() => { setArchiveConfirming(false); setArchiveCodeInput(""); setArchiveCodeError(""); }}
                                                  variant="outline"
                                                  size="sm"
                                                  className="flex-1"
                                                >
                                                  Cancel
                                                </Button>
                                                <Button
                                                  onClick={handleArchive}
                                                  size="sm"
                                                  disabled={!archiveCodeInput.trim()}
                                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                  Close File
                                                </Button>
                                              </div>
                                            </motion.div>
                                          )}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}

                {/* ── Progress Tracker ───────────────────────────────── */}
                {activeTab === "progress" && (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-3xl p-8 md:p-10 shadow-md space-y-6"
                  >
                    <div className="border-b border-border pb-6">
                      <h2 className="font-serif text-2xl font-semibold text-foreground">
                        Track your mortgage progress with clarity.
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1.5">
                        Understand where you are in the process, what's happening now, and what to expect next.
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <span className="font-mono text-xs font-bold text-primary bg-primary/8 rounded-full px-3 py-1">
                          {result.code}
                        </span>
                        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-3 py-1">
                          {getTypeLabel(result.goal)}
                        </span>
                        {(contact?.name || result.fullName) && (
                          <span className="text-xs text-muted-foreground">
                            · {contact?.name || result.fullName}
                          </span>
                        )}
                      </div>
                    </div>

                    {(stageData.currentStage > 0 || stageData.archived) ? (
                      <LoanProgressTracker
                        currentStage={stageData.currentStage}
                        loanType={stageData.loanType || result.goal}
                        history={stageData.history}
                        updatedAt={stageData.updatedAt || undefined}
                        archived={stageData.archived}
                        archiveReason={stageData.archiveReason}
                        archiveNote={stageData.archiveNote}
                        archiveOfficer={stageData.archiveOfficer}
                        archiveTimestamp={stageData.archiveTimestamp}
                      />
                    ) : docsStatus.uploaded > 0 ? (
                      /* ── Under review state ──────────────────────────── */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="flex flex-col items-center text-center py-6 space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                            <Clock className="w-7 h-7 text-blue-600" />
                          </div>
                          <div className="space-y-2 max-w-sm">
                            <p className="font-semibold text-lg text-foreground">
                              Documents received — under review
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Talk to a loan officer who will review your paperwork and activate your progress tracker. Your loan officer will use their code to confirm receipt and begin your file.
                            </p>
                          </div>
                        </div>

                        {/* Doc summary */}
                        <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-5 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">Documents submitted</span>
                            <span className="font-bold text-blue-700">
                              {docsStatus.uploaded} / {docsStatus.totalRequired} required
                            </span>
                          </div>
                          <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${docsStatus.totalRequired > 0 ? (docsStatus.uploaded / docsStatus.totalRequired) * 100 : 100}%` }}
                              transition={{ duration: 0.7, ease: "easeOut" }}
                              className="h-full bg-blue-500 rounded-full"
                            />
                          </div>
                          <p className="text-xs text-blue-700/80">
                            Your loan officer will confirm all documents on their end.
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={() => switchTab("client")}
                            className="flex-1 h-12 rounded-full border border-border bg-card font-medium text-sm flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
                          >
                            <UploadCloud className="w-4 h-4" />
                            Add More Documents
                          </button>
                          <a
                            href="tel:7144944172"
                            className="flex-1 h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.98]"
                          >
                            <Phone className="w-4 h-4" />
                            Call Loan Officer
                          </a>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                          Your loan officer will activate your progress tracker after reviewing your submission.
                        </p>
                      </motion.div>
                    ) : (
                      /* ── No docs yet ─────────────────────────────────── */
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                      >
                        <div className="flex flex-col items-center text-center py-6 space-y-4">
                          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center">
                            <Lock className="w-7 h-7 text-muted-foreground" />
                          </div>
                          <div className="space-y-2 max-w-sm">
                            <p className="font-semibold text-lg text-foreground">
                              Upload your documents to get started
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              Submit your documents, then a loan officer will review them and activate your progress tracker.
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => switchTab("client")}
                          className="w-full h-14 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.98]"
                        >
                          <UploadCloud className="w-5 h-5" />
                          Upload Documents
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* ── Document Upload ───────────────────────────────── */}
                {activeTab === "client" && (
                  <motion.div
                    key="client"
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-secondary/60 rounded-2xl p-5 mb-4">
                      <p className="text-sm text-foreground leading-relaxed">
                        Didn't finish uploading your documents? No problem — your checklist progress is saved to your code. Upload or add more files below, then hit <strong>Submit to Loan Officer</strong> when you're ready.
                      </p>
                    </div>
                    <DocumentChecklist
                      mortgageType={result.goal}
                      creditScore={result.creditScore ?? ""}
                      employmentType={result.employmentType ?? ""}
                      code={result.code}
                      fullName={result.fullName ?? ""}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {searched && !result && !error && (
          <p className="text-center text-muted-foreground text-sm">Searching…</p>
        )}

        <p className="text-center text-xs text-muted-foreground pb-8">
          Client briefs are stored locally on the device where the session was completed.
        </p>
      </div>
    </div>
  );
}
