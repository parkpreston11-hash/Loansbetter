import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, HeartHandshake, RotateCcw, ChevronRight, Star } from "lucide-react";
import { useMortgage } from "@/context/MortgageContext";
import { ContactDialog } from "@/components/ContactDialog";
import { QUESTION_COUNT } from "@/lib/constants";

function getTypeLabel(type: string) {
  if (type === "buy") return "Buy a Home";
  if (type === "refinance") return "Refinance";
  if (type === "cashout") return "Cash-Out Refinance";
  if (type === "reverse") return "Reverse Mortgage";
  return "your session";
}

export default function Landing() {
  const { hasSavedProgress, selectedMortgageType, estimateResult, clearSavedProgress } = useMortgage();
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col w-full bg-background">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">

        {/* Background: subtle radial gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/60 via-background to-background pointer-events-none" />
        {/* Decorative circle */}
        <div className="absolute right-[-12rem] top-[-12rem] w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute left-[-8rem] bottom-[-8rem] w-[28rem] h-[28rem] rounded-full bg-primary/4 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">

          {/* Resume banner */}
          <AnimatePresence>
            {hasSavedProgress && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mb-10 w-full max-w-xl bg-card border border-primary/20 rounded-2xl px-6 py-4 shadow-sm flex flex-col sm:flex-row items-center gap-4 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Welcome back — your progress is saved</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedMortgageType ? `Goal: ${getTypeLabel(selectedMortgageType)}` : "Pick up where you left off."}
                    {estimateResult ? " · Estimate ready" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={clearSavedProgress}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
                    data-testid="button-clear-progress"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Start fresh
                  </button>
                  <button
                    onClick={() => setLocation(estimateResult ? "/results" : "/questions")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-1.5 rounded-lg transition-all"
                    data-testid="button-resume-progress"
                  >
                    Continue
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary rounded-full px-5 py-2 text-sm font-medium mb-8 tracking-wide"
          >
            NMLS# 2641696 · Fountain Valley, CA
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.05 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-foreground leading-[1.05]"
          >
            Mortgage clarity,
            <br />
            <span className="text-primary italic">before</span> the paperwork.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-light"
          >
            Under 10 questions. Instant estimates. Zero forms.
            <br className="hidden md:block" /> Know your options before you talk to anyone.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-12 flex flex-col sm:flex-row gap-4 items-center"
          >
            <Link
              href="/start"
              className="group inline-flex items-center justify-center rounded-full text-base font-semibold transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground shadow-xl shadow-primary/20 h-14 px-10"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <ContactDialog>
              {(open) => (
                <button
                  onClick={open}
                  className="inline-flex items-center justify-center rounded-full text-base font-medium h-14 px-10 border border-border bg-background text-foreground hover:bg-secondary hover:border-primary/30 transition-all"
                >
                  Talk to a Loan Officer
                </button>
              )}
            </ContactDialog>
          </motion.div>

          {/* Phone */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-5 text-sm text-muted-foreground"
          >
            Or call us directly:{" "}
            <a href="tel:7144944172" className="font-semibold text-primary hover:underline">714-494-4172</a>
          </motion.p>

          {/* Stat chips */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-16 flex flex-wrap justify-center gap-4"
          >
            {[
              { value: "< 10", label: "Questions" },
              { value: "2 min", label: "To your estimate" },
              { value: "100%", label: "Free & private" },
              { value: "No", label: "Credit check" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center bg-card border border-border rounded-2xl px-6 py-4 min-w-[7rem] shadow-sm">
                <span className="font-serif text-2xl font-bold text-primary">{stat.value}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent to-border" />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="w-full py-28 md:py-36 bg-background border-t border-border/40">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">The Process</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground">Three steps to clarity.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-3xl overflow-hidden shadow-sm border border-border">
            {[
              { step: "01", title: "Share your basics", desc: `Under 10 quick questions about your financial picture. No credit check. No sensitive data.` },
              { step: "02", title: "See your numbers", desc: "Get an instant estimate and interactive scenarios that show exactly what changes your options." },
              { step: "03", title: "Talk when you're ready", desc: "Your summary and a client code are waiting. Hand them to any loan officer — or call ours." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card p-10 md:p-12 flex flex-col"
              >
                <span className="font-serif text-6xl font-bold text-primary/15 leading-none mb-6">{item.step}</span>
                <h3 className="text-xl font-semibold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY LOANSBETTER ──────────────────────────────────────────── */}
      <section className="w-full py-28 md:py-36 bg-secondary/30 border-t border-border/40">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">Why LoansBetter</p>
              <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
                Better clarity.<br />Better outcomes.
              </h2>
              <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                Borrowers who understand their numbers <em>before</em> talking to a lender negotiate better rates, close with fewer surprises, and save thousands over the life of their loan. That edge is exactly what LoansBetter gives you — free, in under 2 minutes.
              </p>

              <div className="space-y-8">
                {[
                  { icon: Shield, title: "Your data stays yours — always", desc: "We never sell your information or share it with lenders without your say-so. No spam. No pressure calls. Your trust is the only thing we're asking for." },
                  { icon: CheckCircle2, title: "Know before you owe", desc: "Most borrowers leave money on the table because they didn't know their position going in. Two minutes with LoansBetter changes that — your personalized estimate is ready instantly." },
                  { icon: HeartHandshake, title: "You stay in the driver's seat", desc: "No obligation, ever. When you're ready, a loan officer who already knows your full picture is one step away. Until then, the next move is always yours." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex gap-5"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              {[
                { quote: "For the first time, I actually understood how my student loans affected my homebuying budget.", author: "Sarah M.", role: "First-time buyer" },
                { quote: "The scenario sliders are brilliant. I saw exactly what paying off my car would do to my mortgage options.", author: "James T.", role: "Refinancing" },
                { quote: "I called the loan officer already knowing what to ask. Made the whole process so much smoother.", author: "Patricia R.", role: "Cash-out refinance" },
              ].map((test, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="bg-card rounded-2xl p-6 border border-border shadow-sm"
                >
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground leading-relaxed mb-4">"{test.quote}"</p>
                  <p className="text-sm text-muted-foreground font-medium">— {test.author} · <span className="font-normal">{test.role}</span></p>
                </motion.div>
              ))}

              {/* Rating summary */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center gap-4 bg-primary/5 border border-primary/15 rounded-2xl px-6 py-4"
              >
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-5 h-5 ${j < 5 ? "fill-primary text-primary" : "text-muted-foreground"}`}
                      style={j === 4 ? { clipPath: "inset(0 20% 0 0)" } : undefined}
                    />
                  ))}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg leading-none">4.8 <span className="font-normal text-muted-foreground text-sm">out of 5</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">Based on client reviews</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="w-full py-28 bg-foreground text-background">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-xs font-semibold tracking-widest text-background/50 uppercase mb-5">Ready when you are</p>
            <h2 className="font-serif text-4xl md:text-6xl font-semibold mb-6 leading-tight">
              Know your numbers.<br />Walk in confident.
            </h2>
            <p className="text-background/60 text-lg mb-12 max-w-xl mx-auto">
              Start in two minutes — no forms, no credit check, no commitment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/start"
                className="inline-flex items-center justify-center rounded-full font-semibold h-14 px-12 bg-background text-foreground hover:bg-background/90 transition-transform hover:scale-105 active:scale-95 text-base shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="tel:7144944172"
                className="inline-flex items-center justify-center rounded-full font-medium h-14 px-10 border border-background/20 text-background hover:bg-white/10 transition-all text-base"
              >
                Call 714-494-4172
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
