import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Home as HomeIcon, RefreshCw, DollarSign,
  BarChart3, BadgeCheck, Lock, Shield, Phone,
  ShieldCheck, CreditCard, SlidersHorizontal, Info,
  MessageCircle, HeartHandshake, Layers, Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

const LOAN_TYPES = [
  {
    icon: HomeIcon,
    title: "Buy a Home",
    sub: "Understand what you can truly afford before you ever speak to a lender.",
    img: "/images/loan-buy.jpg",
    href: "/start",
    delay: 0,
    wide: false,
  },
  {
    icon: RefreshCw,
    title: "Refinance",
    sub: "Find out if a lower rate, shorter term, or smaller payment is within reach.",
    img: "/images/loan-refi.jpg",
    href: "/start",
    delay: 0.07,
    wide: false,
  },
  {
    icon: DollarSign,
    title: "Cash-Out Refi",
    sub: "Tap your home's equity for renovations, debt payoff, or big expenses.",
    img: "/images/loan-cashout.jpg",
    href: "/start",
    delay: 0.14,
    wide: false,
  },
  {
    icon: BarChart3,
    title: "Reverse Mortgage",
    sub: "Homeowners 62+ can convert equity into tax-free income — no payments required.",
    img: "/images/loan-reverse.jpg",
    href: "/start",
    delay: 0.21,
    wide: false,
  },
  {
    icon: Layers,
    title: "2nd Mortgages",
    sub: "Access your home equity with a HELOAN (fixed lump sum) or HELOC (flexible credit line) — without touching your first mortgage.",
    img: "/images/lifestyle.jpg",
    href: "/start",
    delay: 0.28,
    wide: true,
  },
];

export default function NewHome() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ══════════════════════════════════════════════════════════
          HERO — full-bleed photo with centered overlaid text
      ══════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Photo layer */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg.jpg"
            alt="Premium modern home"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Gradient overlay — bottom heavy so text pops */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/75" />

        {/* Subtle warm vignette */}
        <div className="absolute inset-0 bg-radial-[at_50%_60%] from-transparent to-black/30 pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 md:px-8 text-center py-24">

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-white/25 bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full mb-8"
          >
            <BadgeCheck className="w-3.5 h-3.5" />
            Free · No credit check · No obligation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.08 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.04] tracking-tight text-white mb-7 max-w-4xl mx-auto"
          >
            Smarter mortgage decisions,{" "}
            <span className="italic text-primary-foreground/90 drop-shadow-lg">made better.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16 }}
            className="text-xl md:text-2xl text-white/80 leading-relaxed mb-12 max-w-2xl mx-auto"
          >
            Explore your mortgage options, understand real scenarios, and make
            confident financial decisions — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-10 text-base font-semibold bg-white text-primary hover:bg-white/95 shadow-2xl hover:scale-[1.02] transition-transform"
            >
              <Link href="/start">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full h-14 px-9 text-base font-medium border-white/40 text-white hover:bg-white/15 backdrop-blur-sm transition-all"
            >
              <Link href="/how-it-works">See How It Works</Link>
            </Button>
          </motion.div>

          {/* Inline stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.32 }}
            className="flex flex-wrap justify-center gap-10 md:gap-20"
          >
            {[
              { val: "< 10", label: "Questions to your estimate" },
              { val: "$0", label: "Cost — ever" },
              { val: "0%", label: "Pressure or obligation" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-serif text-3xl font-bold text-white mb-1">{s.val}</p>
                <p className="text-xs text-white/60 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          TRUST STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8 py-5">
          <div className="flex flex-wrap justify-center md:justify-between gap-5 text-sm text-muted-foreground">
            {[
              { icon: BadgeCheck, label: "Licensed & independent" },
              { icon: Lock,       label: "No data sold — ever" },
              { icon: Shield,     label: "No credit pull required" },
              { icon: Phone,      label: "714-494-4172" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 font-medium">
                <Icon className="w-4 h-4 text-primary shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FEAR REMOVAL — Before you start
      ══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 md:px-8 py-12">
        <motion.div {...fadeUp(0)} className="bg-secondary/40 border border-border rounded-3xl p-8 md:p-12 max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">Before you start</p>
          <h3 className="font-serif text-2xl font-semibold text-foreground mb-8">A few things worth knowing first.</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: ShieldCheck, title: "No pressure to apply or commit", desc: "This is a tool for understanding, not a place where anyone will push you toward a decision." },
              { icon: CreditCard, title: "Exploring does not affect your credit", desc: "No credit check runs here — ever. Your score is completely unaffected by using this tool." },
              { icon: SlidersHorizontal, title: "You stay in full control", desc: "At every step, the next move is yours. Nothing happens without your explicit say-so." },
              { icon: Info, title: "This is not a lender", desc: "LoansBetter is a clarity and information tool. We help you understand — not commit." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-2xl hover:bg-secondary/60 transition-colors duration-200">
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          PHOTO CARD GRID — 4 loan types as tall photo cards
      ══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 md:px-8 py-24">
        <motion.div {...fadeUp(0)} className="mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">What brings you here?</p>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight max-w-lg">
              Every situation is different.<br />Pick yours.
            </h2>
            <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
              Choose your path and get a personalized estimate in minutes — no lender
              conversation required.
            </p>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LOAN_TYPES.map(({ icon: Icon, title, sub, img, href, delay, wide }) => (
            <motion.div key={title} {...fadeUp(delay)} className={wide ? "sm:col-span-2 lg:col-span-4" : ""}>
              <Link href={href}>
                <div className={`group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 ${wide ? "h-[260px]" : "h-[420px]"}`}>

                  {/* Photo */}
                  <img
                    src={img}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Always-on gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Icon pill — top left */}
                  <div className="absolute top-5 left-5 w-10 h-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>

                  {/* Text — bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-serif text-2xl font-bold text-white mb-2 leading-tight">{title}</h3>
                    <p className="text-sm text-white/75 leading-relaxed mb-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-400">
                      {sub}
                    </p>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      Get my estimate
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          WHY DIFFERENT — 2×2 calm comparison cards
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-secondary/20 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Why choose us</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
              What makes LoansBetter better than other loan companies.
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
            {[
              { icon: MessageCircle, title: "No confusing financial jargon", desc: "Everything is written in plain language you can actually understand without a finance degree.", delay: 0 },
              { icon: HeartHandshake, title: "No pushy sales process", desc: "No quotas, no pressure calls, no one chasing a commission. Just honest, clear information.", delay: 0.07 },
              { icon: Layers, title: "Clear, step-by-step understanding", desc: "We break complex scenarios into simple steps so you always know exactly where you stand.", delay: 0.14 },
              { icon: Lightbulb, title: "Built to help you decide before you act", desc: "Knowledge first, always. What you do with it is entirely and completely up to you.", delay: 0.21 },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <motion.div key={title} {...fadeUp(delay)} className="group bg-card border border-border rounded-2xl p-7 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25 transition-all duration-300">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                  <Icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          LIFESTYLE SPLIT — large photo left, benefits right
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-secondary/20 border-y border-border py-24">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl max-w-6xl mx-auto">

            {/* Left — lifestyle photo with quote */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative h-[500px] md:h-auto min-h-[480px]"
            >
              <img
                src="/images/lifestyle.jpg"
                alt="Confident homeowner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Pull quote overlaid on photo */}
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-serif text-2xl font-semibold leading-snug italic">
                  "We believe people deserve knowledge and confidence before commitment."
                </p>
                <p className="text-white/60 text-sm mt-3">— The LoansBetter principle</p>
              </div>
            </motion.div>

            {/* Right — benefits on clean background */}
            <motion.div {...fadeUp(0.1)} className="bg-card p-10 md:p-14 flex flex-col justify-center">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">Why LoansBetter</p>
              <h2 className="font-serif text-4xl font-semibold text-foreground leading-tight mb-8">
                The knowledge that changes everything.
              </h2>

              <div className="space-y-7">
                {[
                  {
                    title: "Your data stays yours — always",
                    desc: "We never sell your information or share it with lenders without your permission. No spam. No pressure calls.",
                  },
                  {
                    title: "Know before you owe",
                    desc: "Most borrowers leave money on the table going in uninformed. Two minutes with LoansBetter changes that.",
                  },
                  {
                    title: "No pressure, no obligation — ever",
                    desc: "When you're ready, a loan officer who already knows your full picture is one step away. Until then, the next move is always yours.",
                  },
                ].map(({ title, desc }, i) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground mb-1">{title}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button asChild className="rounded-full h-12 px-8 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                  <Link href="/start">
                    Start Exploring Free
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full h-12 px-6 text-muted-foreground hover:text-foreground">
                  <Link href="/about">Who We Are</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          SOFT EXIT CTA — "Just exploring?"
      ══════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 md:px-8 py-16">
        <motion.div {...fadeUp(0)} className="max-w-2xl mx-auto text-center bg-secondary/30 border border-border rounded-3xl p-10 md:p-14">
          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-3">No commitment required</p>
          <h3 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4">Just exploring?</h3>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8 max-w-md mx-auto">
            You don't need to decide anything today. Start by simply understanding your options — no strings, no pressure.
          </p>
          <Button asChild variant="outline" size="lg" className="rounded-full h-13 px-10 font-medium border-border hover:border-primary/40 hover:bg-primary/5 transition-all">
            <Link href="/how-it-works">
              Explore without commitment
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          FINAL CTA — minimal, strong
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 pointer-events-none" />
        <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 md:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-primary-foreground/60 text-xs font-semibold tracking-widest uppercase mb-4">Ready when you are</p>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight max-w-3xl mx-auto">
              Clear numbers.<br />Confident decisions.
            </h2>
            <p className="text-primary-foreground/75 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
              Under 10 questions. Instant personalized estimates. Zero pressure — ever.
            </p>
            <Button
              asChild
              size="lg"
              className="rounded-full h-14 px-12 text-base font-semibold bg-white text-primary hover:bg-white/95 shadow-2xl hover:scale-[1.02] transition-transform"
            >
              <Link href="/start">
                Start Exploring Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <p className="text-primary-foreground/50 text-sm mt-8">
              Or call us directly:{" "}
              <a href="tel:7144944172" className="text-primary-foreground font-semibold hover:underline">
                714-494-4172
              </a>
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
