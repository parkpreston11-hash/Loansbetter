import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileImage, X, Eye, Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

interface DocState {
  id: string;
  file?: UploadedFile;
}

// ─── Document lists by mortgage type ─────────────────────────────────────────

function getDocList(mortgageType: string, creditScore: string): DocItem[] {
  const base: DocItem[] = [
    {
      id: "photo-id",
      title: "Government-Issued Photo ID",
      desc: "Driver's license, passport, or state ID.",
      required: true,
      tip: "Both sides if it's a driver's license.",
    },
    {
      id: "pay-stubs",
      title: "Pay Stubs",
      desc: "Most recent 30 days of pay stubs from your employer.",
      required: true,
      tip: "If paid bi-weekly, upload your last 2 stubs.",
    },
    {
      id: "w2",
      title: "W-2 Forms",
      desc: "W-2s from the last 2 years (all employers).",
      required: true,
    },
    {
      id: "tax-returns",
      title: "Federal Tax Returns",
      desc: "Complete federal tax returns for the last 2 years.",
      required: true,
      tip: "Include all schedules and pages.",
    },
    {
      id: "bank-statements",
      title: "Bank Statements",
      desc: "Last 2–3 months of statements for all accounts.",
      required: true,
      tip: "All pages, even blank ones. Savings, checking, and investment accounts.",
    },
  ];

  if (mortgageType === "buy") {
    return [
      ...base,
      {
        id: "ssn",
        title: "Social Security Card or Documentation",
        desc: "Copy of your Social Security card or an official SSN document.",
        required: true,
      },
      {
        id: "down-payment-source",
        title: "Down Payment Source Documentation",
        desc: "Proof that your down payment funds are yours (account statements showing the balance).",
        required: true,
        tip: "Funds must be 'seasoned' (in your account) for at least 60 days.",
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

  if (mortgageType === "refinance") {
    return [
      ...base,
      {
        id: "mortgage-statement",
        title: "Current Mortgage Statement",
        desc: "Your most recent monthly mortgage statement.",
        required: true,
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
  }

  if (mortgageType === "cashout") {
    return [
      ...base,
      {
        id: "mortgage-statement",
        title: "Current Mortgage Statement",
        desc: "Your most recent monthly mortgage statement.",
        required: true,
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
      {
        id: "use-of-funds",
        title: "Statement of Intended Use of Funds",
        desc: "A brief note on what you plan to do with the cash-out proceeds.",
        required: false,
        tip: "Not always required, but having it ready speeds up the process.",
      },
    ];
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
        id: "mortgage-statement",
        title: "Current Mortgage Statement",
        desc: "Most recent mortgage statement, if you still have a balance.",
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
  const sizeStr = file ? (file.size < 1024 * 1024
    ? `${(file.size / 1024).toFixed(0)} KB`
    : `${(file.size / 1024 / 1024).toFixed(1)} MB`)
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
        {/* Status icon */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          uploaded ? "bg-green-100 text-green-600" : "bg-secondary text-muted-foreground"
        }`}>
          {uploaded
            ? <CheckCircle2 className="w-4 h-4" />
            : <Clock className="w-4 h-4" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-medium text-foreground text-sm">{doc.title}</span>
              {!doc.required && (
                <span className="ml-2 text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">Optional</span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{doc.desc}</p>
          {doc.tip && !uploaded && (
            <p className="text-xs text-primary/70 mt-1.5 italic">{doc.tip}</p>
          )}

          {/* Uploaded file info */}
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

          {/* Image preview */}
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

        {/* Actions */}
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
  code: string;
}

export function DocumentChecklist({ mortgageType, creditScore, code }: DocumentChecklistProps) {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<Record<string, UploadedFile | undefined>>(() =>
    loadDocStates(code)
  );

  const docs = getDocList(mortgageType, creditScore);
  const required = docs.filter(d => d.required);
  const optional = docs.filter(d => !d.required);
  const uploadedCount = docs.filter(d => files[d.id]).length;
  const requiredDone = required.filter(d => files[d.id]).length;

  useEffect(() => {
    saveDocStates(code, files);
  }, [files, code]);

  const handleUpload = (id: string, file: UploadedFile) => {
    setFiles(prev => ({ ...prev, [id]: file }));
  };

  const handleRemove = (id: string) => {
    setFiles(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const allRequiredDone = requiredDone === required.length;

  return (
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-md">
      {/* Toggle header */}
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
                : `Personalized document checklist for your ${mortgageType === "buy" ? "home purchase" : mortgageType === "refinance" ? "refinance" : mortgageType === "cashout" ? "cash-out refinance" : "reverse mortgage"}`
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

              {/* Progress bar */}
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
                  Upload clear photos or scans of each document below. Your files are stored privately on this device only — nothing is sent to any server. Once everything is ready, call{" "}
                  <a href="tel:7144944172" className="text-primary font-semibold hover:underline">714-494-4172</a>
                  {" "}and reference your client code <strong className="font-mono">{code}</strong>.
                </p>
              </div>

              {/* Required docs */}
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

              {/* Optional docs */}
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

              {/* CTA when done */}
              <div className="pt-2 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Ready to move forward? Call us with your client code and we'll take it from here.
                </p>
                <a
                  href="tel:7144944172"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 h-12 font-semibold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shrink-0 whitespace-nowrap"
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
