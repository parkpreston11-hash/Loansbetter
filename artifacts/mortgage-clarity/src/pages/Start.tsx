import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage, MortgageType } from "@/context/MortgageContext";
import { Home, TrendingDown, HandCoins, Building2, Phone, User, Mail, X, ArrowRight, ShieldCheck } from "lucide-react";
import { ContactDialog } from "@/components/ContactDialog";

const PENDING_CONTACT_KEY = "lb_pending_contact";

export default function Start() {
  const [, setLocation]           = useLocation();
  const { setSelectedMortgageType, updateAnswer } = useMortgage();

  // Gate state
  const [pendingType, setPendingType] = useState<MortgageType>(null);
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [touched, setTouched]         = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  // Pre-fill from a previous session if available
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PENDING_CONTACT_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.name)  setName(saved.name);
        if (saved.email) setEmail(saved.email);
        if (saved.phone) setPhone(saved.phone);
      }
    } catch {}
  }, []);

  // Focus name field when gate opens
  useEffect(() => {
    if (pendingType) {
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [pendingType]);

  const nameValid    = name.trim().length > 0;
  const contactValid = email.trim().length > 0 || phone.trim().length > 0;
  const formValid    = nameValid && contactValid;

  const handleCardClick = (type: MortgageType) => {
    setPendingType(type);
    setTouched(false);
  };

  const handleSubmit = () => {
    setTouched(true);
    if (!formValid) return;

    // Persist contact for Handoff to pre-populate
    try {
      localStorage.setItem(PENDING_CONTACT_KEY, JSON.stringify({
        name:  name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      }));
    } catch {}

    // Pre-fill the fullName question in the Questions flow
    updateAnswer("fullName", name.trim());

    setSelectedMortgageType(pendingType!);
    setLocation("/questions");
  };

  const handleClose = () => {
    setPendingType(null);
    setTouched(false);
  };

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3)  return digits;
    if (digits.length <= 6)  return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const typeLabel: Record<string, string> = {
    buy: "Buy a Home", refinance: "Refinance",
    cashout: "Cash-Out Refinance", reverse: "Reverse Mortgage",
  };

  return (
    <>
      <div className="min-h-[calc(100dvh-5rem)] flex flex-col items-center justify-center bg-background py-12 px-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-4xl md:text-5xl font-semibold text-foreground"
            >
              What brings you here today?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-lg text-muted-foreground"
            >
              Select a path to get personalized clarity.
            </motion.p>
          </div>

          {/* Instant Value Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="mb-10"
          >
            <p className="text-center text-sm text-muted-foreground mb-4">
              See what others discovered — your results will be fully personalized:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Home Purchase",  result: "$340K – $420K", sub: "estimated buying range",    detail: "$85K income · 680 credit · 10% down",  colorClass: "text-emerald-700", bgClass: "bg-emerald-50/70 border-emerald-200/60" },
                { label: "Refinance",      result: "~$280/mo less", sub: "potential monthly savings", detail: "6.9% → 6.2% rate · 30-yr fixed",        colorClass: "text-primary",     bgClass: "bg-primary/5 border-primary/20" },
                { label: "Cash-Out Equity",result: "~$62,000",     sub: "potential equity access",   detail: "$480K home · $310K balance",            colorClass: "text-amber-700",   bgClass: "bg-amber-50/70 border-amber-200/60" },
              ].map(({ label, result, sub, detail, colorClass, bgClass }) => (
                <div key={label} className={`border rounded-2xl p-5 text-center ${bgClass}`}>
                  <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2 ${colorClass}`}>{label}</p>
                  <p className={`font-serif text-xl font-bold mb-0.5 ${colorClass}`}>{result}</p>
                  <p className="text-xs text-muted-foreground mb-2">{sub}</p>
                  <p className="text-[11px] text-muted-foreground/70 leading-snug">{detail}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-foreground/55 mt-3">
              Sample profiles for illustration · your estimate is calculated from your real answers
            </p>
          </motion.div>

          {/* Loan type cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {([
              { type: "buy",       Icon: Home,       title: "Buy a Home",           desc: "For first-time or repeat buyers looking to understand their budget and options.",           testId: "button-buy-home"          },
              { type: "refinance", Icon: TrendingDown,title: "Refinance",            desc: "Lower your interest rate, change your loan term, or reduce your monthly payment.",        testId: "button-refinance"         },
              { type: "cashout",   Icon: HandCoins,  title: "Cash-Out Refinance",   desc: "Access your home equity to consolidate debt or fund major projects.",                    testId: "button-cashout"           },
              { type: "reverse",   Icon: Building2,  title: "Reverse Mortgage",     desc: "For homeowners 62+ looking to convert home equity into tax-free income.",               testId: "button-reverse-mortgage"  },
            ] as { type: MortgageType; Icon: React.ElementType; title: string; desc: string; testId: string }[]).map(({ type, Icon, title, desc, testId }, i) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                onClick={() => handleCardClick(type)}
                data-testid={testId}
                className="group relative flex flex-col p-8 bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-2xl text-left transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
              </motion.button>
            ))}
          </div>

          {/* Talk to a Loan Officer */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-3 text-center"
          >
            <p className="text-muted-foreground text-sm">Prefer to speak with someone directly?</p>
            <ContactDialog>
              {(open) => (
                <button
                  onClick={open}
                  data-testid="link-loan-officer-phone"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-8 h-12 text-base font-medium text-foreground hover:border-primary/50 hover:shadow-sm transition-all hover:-translate-y-0.5"
                >
                  <Phone className="w-4 h-4 text-primary" />
                  Talk to a Loan Officer
                </button>
              )}
            </ContactDialog>
          </motion.div>
        </div>
      </div>

      {/* ── Contact gate modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pendingType && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={handleClose}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 32, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit={{ opacity: 0, y: 20,  scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-8 space-y-6">

                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">
                      {pendingType ? typeLabel[pendingType] : ""}
                    </p>
                    <h2 className="font-serif text-2xl font-semibold text-foreground leading-tight">
                      Before we get started
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      So your loan officer can follow up with your personalized results.
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      Full name <span className="text-destructive">*</span>
                    </label>
                    <input
                      ref={nameRef}
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="Jane Smith"
                      className={`w-full h-12 rounded-xl border px-4 text-sm bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                        touched && !nameValid
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:border-primary focus:ring-primary/30"
                      }`}
                    />
                    {touched && !nameValid && (
                      <p className="text-xs text-destructive">Please enter your name.</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="jane@example.com"
                      className={`w-full h-12 rounded-xl border px-4 text-sm bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                        touched && !contactValid
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:border-primary focus:ring-primary/30"
                      }`}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      Phone number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                      placeholder="(714) 494-4172"
                      inputMode="tel"
                      className={`w-full h-12 rounded-xl border px-4 text-sm bg-secondary/50 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                        touched && !contactValid
                          ? "border-destructive focus:ring-destructive/30"
                          : "border-border focus:border-primary focus:ring-primary/30"
                      }`}
                    />
                    {touched && !contactValid && (
                      <p className="text-xs text-destructive">Please provide at least one — email or phone.</p>
                    )}
                    {!touched && (
                      <p className="text-xs text-muted-foreground">Please provide at least one: email or phone.</p>
                    )}
                  </div>
                </div>

                {/* Privacy note */}
                <div className="flex items-start gap-2 bg-secondary/60 rounded-xl px-4 py-3">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your information is only shared with your loan officer. We do not sell your data.
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="w-full h-13 rounded-full bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.98] py-4"
                >
                  Continue to my questions
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
