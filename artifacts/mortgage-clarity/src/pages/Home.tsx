import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Shield, CheckCircle2, TrendingDown, Home as HomeIcon,
  RefreshCw, DollarSign, Users, Star, BarChart3, Clock, Lock,
  ChevronRight, Sparkles, BadgeCheck, Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactDialog } from "@/components/ContactDialog";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

export default function Home() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center">
        {/* gradient backdrop */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/4" />

        <div className="relative container mx-auto px-4 md:px-8 py-20 grid md:grid-cols-2 gap-16 items-center">

          {/* Left copy */}
          <div>
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-primary/8 border border-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Free · No credit check · No obligation
            </motion.div>

            <motion.h1 {...fadeUp(0.06)} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
              Smarter mortgage decisions,{" "}
              <span className="text-primary italic">made simple.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.12)} className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Explore your mortgage options, understand every scenario, and
              walk into any lender conversation already ahead — in under 2 minutes.
            </motion.p>

            <motion.div {...fadeUp(0.18)} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="rounded-full h-14 px-10 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Link href="/start">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-10 text-base font-medium border-border hover:border-primary/40 hover:bg-primary/3 transition-all">
                <Link href="/learn">
                  Explore Tools
                </Link>
              </Button>
            </motion.div>

            <motion.div {...fadeUp(0.24)} className="flex flex-wrap gap-6">
              {[
                { val: "< 10", label: "Questions to your estimate" },
                { val: "0%", label: "Pressure or obligation" },
                { val: "100%", label: "Free & private" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col">
                  <span className="font-serif text-2xl font-bold text-primary">{s.val}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — real photo + floating estimate card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="hidden md:block relative"
          >
            {/* Background photo */}
            <div className="relative rounded-3xl overflow-hidden h-[520px] shadow-2xl">
              <img
                src="/images/how-it-works-bg.jpg"
                alt="Modern neighborhood"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            </div>

            {/* Floating estimate card — centered on photo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[280px] bg-card/95 backdrop-blur-sm border border-border rounded-3xl shadow-2xl p-6">
              <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-1">Your Estimate</p>
              <p className="text-3xl font-bold text-foreground">$2,847<span className="text-base font-normal text-muted-foreground">/mo</span></p>
              <p className="text-xs text-muted-foreground mt-0.5 mb-4">30-Year Fixed · 6.75% APR</p>
              <div className="space-y-2.5 mb-4">
                {[
                  ["Home Price", "$450,000"],
                  ["Down Payment", "$90,000 (20%)"],
                  ["Loan Amount", "$360,000"],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground">{val}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 flex items-center gap-2 text-emerald-600 text-xs font-semibold">
                <BadgeCheck className="w-3.5 h-3.5" />
                Likely to qualify
              </div>
            </div>

            {/* Floating badge top */}
            <div className="absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 text-sm font-semibold shadow-lg flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Est. in 2 min
            </div>

            {/* Floating "save" card bottom */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-8 bg-card border border-border rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">vs. going in blind</p>
                <p className="text-sm font-bold text-foreground">Save thousands</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST STRIP ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/40">
        <div className="container mx-auto px-4 md:px-8 py-5">
          <div className="flex flex-wrap justify-center md:justify-between gap-6 text-sm text-muted-foreground">
            {[
              { icon: BadgeCheck, label: "Licensed & independent" },
              { icon: Users,       label: "Built for buyers & homeowners" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 font-medium">
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOAN TYPE CARDS ─────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-24">
        <motion.div {...fadeUp(0)} className="text-center mb-14">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">What brings you here?</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">Pick your path to clarity.</h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-xl mx-auto">Every situation is different. Choose yours and get a personalized estimate in minutes.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: HomeIcon, title: "Buy a Home",
              desc: "See how much home you can afford and estimate your monthly payment before you ever talk to a lender.",
              delay: 0, wide: false,
            },
            {
              icon: RefreshCw, title: "Refinance",
              desc: "Find out if refinancing could lower your rate, shrink your payment, or help you pay off your home faster.",
              delay: 0.07, wide: false,
            },
            {
              icon: DollarSign, title: "Cash-Out Refi",
              desc: "Unlock the equity in your home to consolidate debt, fund renovations, or cover major expenses.",
              delay: 0.14, wide: false,
            },
            {
              icon: BarChart3, title: "Reverse Mortgage",
              desc: "Explore how homeowners 62+ can convert home equity into tax-free income — with zero monthly payments.",
              delay: 0.21, wide: false,
            },
            {
              icon: Layers, title: "2nd Mortgages",
              desc: "Access your home equity with a HELOAN (fixed lump sum) or HELOC (flexible credit line) — without changing your first mortgage rate.",
              delay: 0.28, wide: true,
            },
          ].map(({ icon: Icon, title, desc, delay, wide }) => (
            <motion.div key={title} {...fadeUp(delay)} className={wide ? "sm:col-span-2 lg:col-span-4" : ""}>
              <Link href="/start">
                <div className="group relative bg-card border border-border rounded-2xl p-7 h-full flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/30">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
                  <div className="flex items-center gap-1 mt-5 text-primary text-sm font-semibold group-hover:gap-2 transition-all">
                    Get my estimate <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border py-24">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-16">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Simple by design</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold">Three steps to total clarity.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-0 relative">
            {/* connector line desktop */}
            <div className="absolute hidden md:block top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />

            {[
              {
                n: "01", icon: CheckCircle2, title: "Share your basics",
                desc: "Under 10 quick questions about your financial picture. No credit check. No sensitive data collected.",
                delay: 0,
              },
              {
                n: "02", icon: BarChart3, title: "See your real numbers",
                desc: "Get a personalized estimate instantly. Explore \"what if\" scenarios that show exactly how small changes affect your options.",
                delay: 0.1,
              },
              {
                n: "03", icon: Users, title: "Talk when you're ready",
                desc: "Your summary and a private client code are saved. Hand them to any loan officer — or call ours. No pressure, ever.",
                delay: 0.2,
              },
            ].map(({ n, icon: Icon, title, desc, delay }) => (
              <motion.div key={n} {...fadeUp(delay)} className="flex flex-col items-center text-center px-8 py-10">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-background border-2 border-primary/30 flex items-center justify-center shadow-sm">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{n.slice(1)}</span>
                </div>
                <h3 className="font-semibold text-foreground text-xl mb-3">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp(0.3)} className="text-center mt-10">
            <Button asChild size="lg" className="rounded-full h-14 px-10 text-base font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <Link href="/start">
                Start — it's free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY LOANSBETTER ──────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-4">Why LoansBetter</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight mb-6">
              Better clarity.<br />Better outcomes.
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Borrowers who understand their numbers <em>before</em> talking to a lender
              negotiate better rates, close with fewer surprises, and save thousands over
              the life of their loan. That edge is exactly what LoansBetter gives you —
              free, in under 2 minutes.
            </p>
            <ContactDialog>
              {(open) => (
                <button onClick={open} className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                  Talk to a loan officer <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </ContactDialog>
          </motion.div>

          <motion.div {...fadeUp(0.1)} className="space-y-5">
            {[
              {
                icon: Lock, title: "Your data stays yours — always",
                desc: "We never sell your information or share it with lenders without your permission. No spam. No pressure calls.",
              },
              {
                icon: BarChart3, title: "Know before you owe",
                desc: "Most borrowers leave money on the table because they didn't know their position going in. Two minutes with LoansBetter changes that.",
              },
              {
                icon: Users, title: "You stay in the driver's seat",
                desc: "No obligation, ever. When you're ready, a loan officer who already knows your full picture is one step away.",
              },
            ].map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} {...fadeUp(i * 0.08)} className="flex gap-5 p-6 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Real people. Real results.</p>
            <h2 className="font-serif text-4xl font-semibold">What homeowners are saying.</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "I finally understood what I could actually afford before talking to anyone. That confidence alone was worth it.",
                name: "First-time buyer", loc: "Irvine, CA", delay: 0,
              },
              {
                quote: "I thought refinancing wasn't worth it at my rate. This tool showed me I was leaving $320/month on the table.",
                name: "Homeowner refinancing", loc: "Fountain Valley, CA", delay: 0.08,
              },
              {
                quote: "No one had explained a reverse mortgage to me clearly until now. No pressure, no jargon — just real answers.",
                name: "Retired homeowner", loc: "Orange County, CA", delay: 0.16,
              },
            ].map(({ quote, name, loc, delay }) => (
              <motion.div key={name} {...fadeUp(delay)} className="bg-card border border-border rounded-2xl p-7">
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6 italic">"{quote}"</p>
                <div>
                  <p className="font-semibold text-sm text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{loc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 md:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <p className="text-primary-foreground/70 text-sm font-semibold tracking-widest uppercase mb-4">Ready when you are</p>
            <h2 className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Explore your mortgage options<br />with complete clarity.
            </h2>
            <p className="text-primary-foreground/80 text-xl mb-10 max-w-xl mx-auto leading-relaxed">
              Under 10 questions. Instant personalized estimates. Zero pressure — ever.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full h-14 px-10 text-base font-semibold bg-white text-primary hover:bg-white/95 hover:scale-[1.02] shadow-2xl transition-transform">
                <Link href="/start">
                  Start Exploring Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-10 text-base font-medium border-white/30 text-primary-foreground hover:bg-white/10 transition-all">
                <Link href="/questions">
                  Calculate My Numbers
                </Link>
              </Button>
            </div>
            <p className="text-primary-foreground/60 text-sm mt-8">
              Or call us directly:{" "}
              <a href="tel:7144944172" className="text-primary-foreground font-semibold hover:underline">714-494-4172</a>
            </p>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
