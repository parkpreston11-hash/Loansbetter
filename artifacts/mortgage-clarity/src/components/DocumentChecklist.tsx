import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileImage, X, Eye, Folder, Send, PartyPopper, Mail, Phone
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DocItem {
  id: string;
  title: string;
  desc: string;
  required: boolean;
  tip?: string;
}

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  dataUrl: string;
}

// ─── Document lists ───────────────────────────────────────────────────────────

function getDocList(
  mortgageType: string,
  creditScore: string,
  employmentType: string
): DocItem[] {
  const selfEmployed = employmentType === "self-employed";

  const coreIncomeDocs: DocItem[] = [
    {
      id: "pay-stubs",
      title: "Most Recent Pay Stubs",
      desc: "Your most current pay stubs — typically the last 30 days.",
      required: true,
      tip: "If paid bi-weekly, include your last 2 stubs.",
    },
    {
      id: "w2",
      title: "W-2 Forms (Last 2 Years)",
      desc: "W-2s from all employers for the past 2 years.",
      required: true,
    },
    {
      id: "1099",
      title: "1099 Forms (Last 2 Years)",
      desc: "1099s from all sources of non-W-2 income for the past 2 years.",
      required: true,
      tip: "Include 1099-NEC, 1099-MISC, 1099-INT, 1099-DIV — any that apply.",
    },
  ];

  const selfEmployedDocs: DocItem[] = selfEmployed ? [
    {
      id: "balance-sheet",
      title: "Business Balance Sheet",
      desc: "Current business balance sheet showing assets, liabilities, and equity.",
      required: true,
      tip: "Prepared by a CPA or your accounting software (QuickBooks, etc.).",
    },
    {
      id: "profit-loss",
      title: "Profit & Loss Statement",
      desc: "Year-to-date P&L statement for your business.",
      required: true,
      tip: "Should be current within 60 days.",
    },
  ] : [];

  const base: DocItem[] = [
    {
      id: "photo-id",
      title: "Government-Issued Photo ID",
      desc: "Driver's license, passport, or state ID.",
      required: true,
      tip: "Both sides if it's a driver's license.",
    },
    ...coreIncomeDocs,
    ...selfEmployedDocs,
    {
      id: "bank-statements",
      title: "Bank Statements (Last 2 Months)",
      desc: "2 months of statements for all accounts — checking, savings, investments.",
      required: true,
      tip: "All pages, even blank ones.",
    },
  ];

  if (mortgageType === "buy") {
    return [
      ...base,
      {
        id: "ssn",
        title: "Social Security Card or Documentation",
        desc: "Copy of your Social Security card or official SSN document.",
        required: true,
      },
      {
        id: "down-payment-source",
        title: "Down Payment Source Documentation",
        desc: "Proof that your down payment funds are yours — account statements showing the balance.",
        required: true,
        tip: "Funds should be 'seasoned' (in your account) for at least 60 days.",
      },
      {
        id: "gift-letter",
        title: "Gift Letter",
        desc: "If any portion of your down payment is a gift from family, a signed letter is required.",
        required: false,
        tip: "Your lender will provide the template. The donor must also show the transfer.",
      },
      ...(creditScore === "Below 580" || creditScore === "580–619" ? [{
        id: "credit-explanation",
        title: "Letter of Explanation for Credit",
        desc: "A brief written explanation for any negative items on your credit report.",
        required: true,
        tip: "Be honest and concise. Lenders appreciate transparency.",
      }] : []),
    ];
  }

  if (mortgageType === "refinance" || mortgageType === "cashout") {
    const refiDocs: DocItem[] = [
      {
        id: "mortgage-statement",
        title: "Most Recent Mortgage Statement",
        desc: "Your most recent lender mortgage statement showing balance and payment history.",
        required: true,
        tip: "This is the statement from your current lender — not the escrow analysis.",
      },
      {
        id: "insurance-dec",
        title: "Homeowner's Insurance Declaration Page",
        desc: "The 'dec page' from your current homeowner's insurance policy.",
        required: true,
      },
      {
        id: "property-tax",
        title: "Property Tax Bill",
        desc: "Most recent property tax bill or statement.",
        required: true,
      },
    ];

    if (mortgageType === "cashout") {
      return [
        ...base,
        ...refiDocs,
        {
          id: "use-of-funds",
          title: "Statement of Intended Use of Funds",
          desc: "A brief note on what you plan to do with the cash-out proceeds.",
          required: false,
          tip: "Not always required, but having it ready speeds things up.",
        },
      ];
    }

    return [...base, ...refiDocs];
  }

  if (mortgageType === "reverse") {
    return [
      {
        id: "photo-id",
        title: "Government-Issued Photo ID",
        desc: "Driver's license, passport, or state ID.",
        required: true,
        tip: "Both sides if it's a driver's license.",
      },
      {
        id: "ssn-card",
        title: "Social Security Card",
        desc: "Original or certified copy of your Social Security card.",
        required: true,
      },
      {
        id: "proof-income",
        title: "Proof of Income",
        desc: "Social Security benefit statement, pension statements, or other income sources.",
        required: true,
        tip: "Your most recent Social Security award letter works perfectly.",
      },
      {
        id: "w2",
        title: "W-2 Forms (Last 2 Years)",
        desc: "W-2s from all employers for the past 2 years (if applicable).",
        required: false,
      },
      {
        id: "1099",
        title: "1099 Forms (Last 2 Years)",
        desc: "1099s from any non-W-2 income sources for the past 2 years.",
        required: false,
      },
      {
        id: "bank-statements",
        title: "Bank Statements (Last 2 Months)",
        desc: "2 months of statements for all accounts.",
        required: true,
        tip: "All pages, even blank ones.",
      },
      {
        id: "mortgage-statement",
        title: "Most Recent Mortgage Statement",
        desc: "Your lender's most recent statement, if you still have a balance.",
        required: false,
      },
      {
        id: "insurance-dec",
        title: "Homeowner's Insurance Declaration Page",
        desc: "Current homeowner's insurance policy dec page.",
        required: true,
      },
      {
        id: "property-tax",
        title: "Property Tax Bill",
        desc: "Most recent property tax bill or statement.",
        required: true,
      },
      {
        id: "medicare-card",
        title: "Medicare Card",
        desc: "Copy of your Medicare card (if applicable).",
        required: false,
      },
      {
        id: "hud-counseling",
        title: "HUD Counseling Certificate",
        desc: "Required by law — a certificate from an approved HUD housing counselor.",
        required: true,
        tip: "If you haven't done this yet, contact a HUD-approved counselor first. It's a simple 90-minute phone session.",
      },
      {
        id: "property-deed",
        title: "Property Deed or Title",
        desc: "Proof of home ownership — the deed or title document.",
        required: true,
      },
    ];
  }

  return base;
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const DOCS_KEY_PREFIX = "lb_docs_";
const SUBMITTED_KEY_PREFIX = "lb_submitted_";

function loadDocStates(code: string): Record<string, UploadedFile | undefined> {
  try {
    const raw = localStorage.getItem(DOCS_KEY_PREFIX + code);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDocStates(code: string, states: Record<string, UploadedFile | undefined>) {
  try {
    localStorage.setItem(DOCS_KEY_PREFIX + code, JSON.stringify(states));
  } catch {}
}

function loadSubmitted(code: string): boolean {
  try {
    return !!localStorage.getItem(SUBMITTED_KEY_PREFIX + code);
  } catch {
    return false;
  }
}

function saveSubmitted(code: string, date: string) {
  try {
    localStorage.setItem(SUBMITTED_KEY_PREFIX + code, date);
  } catch {}
}

function clearSubmitted(code: string) {
  try {
    localStorage.removeItem(SUBMITTED_KEY_PREFIX + code);
  } catch {}
}

const CONTACT_KEY_PREFIX = "lb_contact_";

function loadContact(code: string): { email: string; phone: string } {
  try {
    const raw = localStorage.getItem(CONTACT_KEY_PREFIX + code);
    return raw ? JSON.parse(raw) : { email: "", phone: "" };
  } catch {
    return { email: "", phone: "" };
  }
}

function saveContact(code: string, data: { email: string; phone: string }) {
  try {
    localStorage.setItem(CONTACT_KEY_PREFIX + code, JSON.stringify(data));
  } catch {}
}

// ─── Single doc item ──────────────────────────────────────────────────────────

function DocRow({
  doc,
  file,
  onUpload,
  onRemove,
}: {
  doc: DocItem;
  file?: UploadedFile;
  onUpload: (file: UploadedFile) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(false);
  const uploaded = !!file;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onUpload({
        name: f.name,
        size: f.size,
        type: f.type,
        dataUrl: ev.target?.result as string,
      });
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const isImage = file?.type.startsWith("image/");
  const sizeStr = file
    ? file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / 1024 / 1024).toFixed(1)} MB`
    : "";

  return (
    <motion.div
      layout
      className={`rounded-2xl border transition-colors ${
        uploaded
          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
          : "border-border bg-card"
      } p-5`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          uploaded ? "bg-green-100 text-green-600" : "bg-secondary text-muted-foreground"
        }`}>
          {uploaded ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground text-sm">{doc.title}</span>
            {!doc.required && (
              <span className="shrink-0 text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">Optional</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{doc.desc}</p>
          {doc.tip && !uploaded && (
            <p className="text-xs text-primary/70 mt-1.5 italic">{doc.tip}</p>
          )}

          {uploaded && file && (
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-green-100/80 text-green-700 rounded-lg px-2.5 py-1 text-xs font-medium">
                <FileImage className="w-3 h-3" />
                <span className="truncate max-w-[140px]">{file.name}</span>
                <span className="text-green-500">· {sizeStr}</span>
              </div>
              {isImage && (
                <button
                  onClick={() => setPreview(v => !v)}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" />
                  {preview ? "Hide" : "Preview"}
                </button>
              )}
            </div>
          )}

          <AnimatePresence>
            {preview && isImage && file && (
              <motion.img
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                src={file.dataUrl}
                alt={file.name}
                className="mt-3 rounded-xl border border-border max-h-48 object-contain w-full"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {uploaded ? (
            <button
              onClick={onRemove}
              className="w-7 h-7 rounded-full bg-secondary hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFile}
              />
              <button
                onClick={() => inputRef.current?.click()}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors"
              >
                <Upload className="w-3 h-3" />
                Upload
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface DocumentChecklistProps {
  mortgageType: string;
  creditScore: string;
  employmentType: string;
  code: string;
  fullName: string;
}

export function DocumentChecklist({
  mortgageType,
  creditScore,
  employmentType,
  code,
  fullName,
}: DocumentChecklistProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<Record<string, UploadedFile | undefined>>(() =>
    loadDocStates(code)
  );
  const [submitted, setSubmitted] = useState(() => loadSubmitted(code));
  const [clientEmail, setClientEmail] = useState(() => loadContact(code).email);
  const [clientPhone, setClientPhone] = useState(() => loadContact(code).phone);

  const docs = getDocList(mortgageType, creditScore, employmentType);
  const required = docs.filter(d => d.required);
  const optional = docs.filter(d => !d.required);
  const uploadedCount = docs.filter(d => files[d.id]).length;
  const requiredDone = required.filter(d => files[d.id]).length;
  const allRequiredDone = requiredDone === required.length && required.length > 0;

  useEffect(() => {
    saveDocStates(code, files);
  }, [files, code]);

  useEffect(() => {
    saveContact(code, { email: clientEmail, phone: clientPhone });
  }, [clientEmail, clientPhone, code]);

  const triggerDocumentEmail = (docTitle: string, fileName: string) => {
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    const body = [
      `New Document Uploaded`,
      ``,
      `From: ${fullName || "Client"}`,
      ...(clientEmail.trim() ? [`Email: ${clientEmail.trim()}`] : []),
      ...(clientPhone.trim() ? [`Phone: ${clientPhone.trim()}`] : []),
      ``,
      `Document: ${docTitle}`,
      `File: ${fileName}`,
      ``,
      `Client Code: ${code}`,
      `Date: ${dateStr}`,
      ``,
      `--`,
      `Sent automatically via LoansBetter`,
    ].join("\n");
    const subject = encodeURIComponent(`LoansBetter — New Document: ${docTitle} — ${code}`);
    const encodedBody = encodeURIComponent(body);
    const cc = clientEmail.trim() ? `&cc=${encodeURIComponent(clientEmail.trim())}` : "";
    window.open(`mailto:parkpreston11@gmail.com?${cc}subject=${subject}&body=${encodedBody}`, "_blank");
  };

  const handleUpload = (id: string, file: UploadedFile) => {
    setFiles(prev => ({ ...prev, [id]: file }));
    clearSubmitted(code);
    setSubmitted(false);
    const doc = docs.find(d => d.id === id);
    if (doc) triggerDocumentEmail(doc.title, file.name);
  };

  const handleRemove = (id: string) => {
    setFiles(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    clearSubmitted(code);
    setSubmitted(false);
  };

  const handleSubmit = () => {
    const typeFull =
      mortgageType === "buy" ? "Buy a Home" :
      mortgageType === "refinance" ? "Refinance" :
      mortgageType === "cashout" ? "Cash-Out Refinance" :
      "Reverse Mortgage";

    const uploadedDocs = docs
      .filter(d => files[d.id])
      .map(d => `  • ${d.title} — ${files[d.id]!.name}`)
      .join("\n");

    const missingRequired = required
      .filter(d => !files[d.id])
      .map(d => `  • ${d.title}`)
      .join("\n");

    const body = [
      `LoansBetter Document Submission`,
      ``,
      `From: ${fullName || "Client"}`,
      ...(clientEmail.trim() ? [`Email: ${clientEmail.trim()}`] : []),
      ...(clientPhone.trim() ? [`Phone: ${clientPhone.trim()}`] : []),
      ``,
      `Client Code: ${code}`,
      `Loan Type: ${typeFull}`,
      `Employment: ${employmentType || "Not specified"}`,
      `Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
      ``,
      `UPLOADED DOCUMENTS (${uploadedCount}):`,
      uploadedDocs || "  None",
      ...(missingRequired ? [``, `STILL NEEDED:`, missingRequired] : []),
      ``,
      `--`,
      `Submitted via LoansBetter`,
    ].join("\n");

    const subject = encodeURIComponent(`LoansBetter — ${fullName || "Client"} — ${code}`);
    const encodedBody = encodeURIComponent(body);
    const cc = clientEmail.trim() ? `&cc=${encodeURIComponent(clientEmail.trim())}` : "";
    window.open(`mailto:parkpreston11@gmail.com?${cc}subject=${subject}&body=${encodedBody}`, "_blank");
    const dateStr = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    saveSubmitted(code, dateStr);
    setSubmitted(true);
  };

  const typeLabel =
    mortgageType === "buy" ? "home purchase" :
    mortgageType === "refinance" ? "refinance" :
    mortgageType === "cashout" ? "cash-out refinance" :
    "reverse mortgage";

  const selfEmployed = employmentType === "self-employed";

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-md">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-8 text-left hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <Folder className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-lg">Follow Through — Start Your Application</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {open
                ? `${uploadedCount} of ${docs.length} documents uploaded · ${requiredDone}/${required.length} required`
                : `Personalized document checklist for your ${typeLabel}${selfEmployed ? " · self-employed" : ""}`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {uploadedCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              {uploadedCount} uploaded
            </div>
          )}
          {open ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 space-y-8 border-t border-border pt-6">

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Required documents</span>
                  <span className="font-medium text-foreground">{requiredDone} / {required.length}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${required.length > 0 ? (requiredDone / required.length) * 100 : 0}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                {allRequiredDone && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-green-600 font-medium flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    All required documents uploaded — you're ready to submit!
                  </motion.p>
                )}
              </div>

              {/* Intro */}
              <div className="bg-secondary/60 rounded-2xl p-5">
                <p className="text-sm text-foreground leading-relaxed">
                  Upload clear photos or scans of each document below. Your files are stored privately on this device — nothing is sent to any server. Once everything is ready, call{" "}
                  <a href="tel:7144944172" className="text-primary font-semibold hover:underline">714-494-4172</a>
                  {" "}and reference your client code <strong className="font-mono">{code}</strong>.
                </p>
              </div>

              {/* Required */}
              <div className="space-y-3">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Required Documents</p>
                {required.map(doc => (
                  <DocRow
                    key={doc.id}
                    doc={doc}
                    file={files[doc.id]}
                    onUpload={(f) => handleUpload(doc.id, f)}
                    onRemove={() => handleRemove(doc.id)}
                  />
                ))}
              </div>

              {/* Optional */}
              {optional.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Optional Documents</p>
                  {optional.map(doc => (
                    <DocRow
                      key={doc.id}
                      doc={doc}
                      file={files[doc.id]}
                      onUpload={(f) => handleUpload(doc.id, f)}
                      onRemove={() => handleRemove(doc.id)}
                    />
                  ))}
                </div>
              )}

              {/* Submit section */}
              <div className="rounded-2xl border-2 border-dashed border-primary/20 bg-primary/3 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Send className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Submit to Loan Officer</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Add your contact info and hit the button below. Your email app will open pre-filled — just press Send.
                    </p>
                  </div>
                </div>

                {/* Contact info */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Your Contact Info</p>
                  <div className="grid gap-2">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="Email address"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="tel"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        placeholder="Phone number"
                        className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                      />
                    </div>
                  </div>
                  {(!clientEmail.trim() || !clientPhone.trim()) && (
                    <p className="text-xs text-muted-foreground">
                      Both fields required — you'll receive a copy of the submission at your email.
                    </p>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4"
                    >
                      <PartyPopper className="w-5 h-5 text-green-600 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-green-800">Email opened — just press Send!</p>
                        <p className="text-xs text-green-700 mt-0.5">
                          Your loan officer will receive your document list and follow up with next steps.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="btn"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={handleSubmit}
                      disabled={uploadedCount === 0 || !clientEmail.trim() || !clientPhone.trim()}
                      className="w-full h-12 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <Send className="w-4 h-4" />
                      {uploadedCount === 0
                        ? "Upload at least one document to submit"
                        : !clientEmail.trim() || !clientPhone.trim()
                        ? "Add email and phone to submit"
                        : `Submit ${uploadedCount} Document${uploadedCount !== 1 ? "s" : ""} to Loan Officer`
                      }
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer CTA */}
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Prefer to call? Reference your client code and we'll take it from here.
                </p>
                <a
                  href="tel:7144944172"
                  className="inline-flex items-center gap-2 bg-card border border-border text-foreground rounded-full px-8 h-12 font-semibold text-sm hover:bg-secondary transition-all shrink-0 whitespace-nowrap"
                >
                  Call 714-494-4172
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
