import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Home as HomeIcon, RefreshCw, DollarSign,
  BarChart3, BadgeCheck, Lock, Shield, Users, ChevronRight, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay, ease: "easeOut" as const },
});

export default function NewHome() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/4 via-background to-background pointer-events-none" />

        <div className="relative container mx-auto px-4 md:px-8 py-20 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left — copy */}
          <div>
            <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 bg-primary/8 border border-primary/15 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-8">
              <BadgeCheck className="w-3.5 h-3.5" />
              Free · No credit check · No obligation
            </motion.div>

            <motion.h1 {...fadeUp(0.07)} className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.04] tracking-tight mb-7">
              Smarter mortgage decisions,{" "}
              <span className="text-primary italic">made simple.</span>
            </motion.h1>

            <motion.p {...fadeUp(0.14)} className="text-xl text-muted-foreground leading-relaxed mb-10 max-w-lg">
              Explore your mortgage options, understand real scenarios, and make confident
              financial decisions — all in one place.
            </motion.p>

            <motion.div {...fadeUp(0.21)} className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button asChild size="lg" className="rounded-full h-14 px-10 text-base font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                <Link href="/start">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full h-14 px-9 text-base font-medium border-border hover:border-primary/40 hover:bg-primary/4 transition-all">
                <Link href="/learn">Explore Tools</Link>
              </Button>
            </motion.div>

            <motion.div {...fadeUp(0.28)} className="flex flex-wrap gap-8">
              {[
                { val: "< 10", label: "Questions to your estimate" },
                { val: "$0", label: "Cost, ever" },
                { val: "0%", label: "Pressure or obligation" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-serif text-2xl font-bold text-primary mb-0.5">{s.val}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — real photo with floating details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="hidden md:block relative"
          >
            {/* Photo container */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[580px]">
              <img
                src="/images/hero-home.jpg"
                alt="Beautiful modern home"
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay — bottom fade for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
              {/* Bottom overlay text */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-white/70 text-xs uppercase tracking-widest mb-1">Serving Orange County, CA</p>
                <p className="text-white font-semibold text-lg">714-494-4172</p>
              </div>
            </div>

            {/* Accent stripe on right edge */}
            <div className="absolute top-10 -right-1.5 w-1.5 h-24 bg-primary rounded-full opacity-80" />

            {/* Floating badge — top right */}
            <div className="absolute -top-4 right-6 bg-primary text-primary-foreground rounded-2xl px-4 py-2.5 shadow-lg flex items-center gap-2 text-sm font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Est. in 2 min
            </div>

            {/* Floating qualify card — bottom left */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-8 bg-card border border-border rounded-2xl shadow-xl px-5 py-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Based on your profile</p>
                <p className="text-sm font-bold text-foreground">Likely to qualify</p>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ─── TRUST STRIP ──────────────────────────────────────────── */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4 md:px-8 py-5">
          <div className="flex flex-wrap justify-center md:justify-between gap-5 text-sm text-muted-foreground">
            {[
              { icon: BadgeCheck, label: "Licensed & independent platform" },
              { icon: Lock,        label: "No data sold — ever" },
              { icon: Shield,      label: "No credit pull required" },
              { icon: Users,       label: "Built for buyers & homeowners" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 font-medium">
                <Icon className="w-4 h-4 text-primary shrink-0" />
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
          <h2 className="font-serif text-4xl md:text-5xl font-semibold leading-tight">
            Pick your path.
          </h2>
          <p className="text-muted-foreground mt-4 text-lg max-w-lg mx-auto">
            Every mortgage situation is different. Choose yours and get a personalized estimate in minutes.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: HomeIcon, title: "Buy a Home",
              desc: "See how much you can afford and estimate your payment before talking to anyone.",
              delay: 0,
            },
            {
              icon: RefreshCw, title: "Refinance",
              desc: "Find out if refinancing could lower your rate, reduce your payment, or shorten your term.",
              delay: 0.07,
            },
            {
              icon: DollarSign, title: "Cash-Out Refi",
              desc: "Unlock your home's equity to cover renovations, consolidate debt, or fund major expenses.",
              delay: 0.14,
            },
            {
              icon: BarChart3, title: "Reverse Mortgage",
              desc: "Explore how homeowners 62+ can convert equity into tax-free income — no monthly payments.",
              delay: 0.21,
            },
          ].map(({ icon: Icon, title, desc, delay }) => (
            <motion.div key={title} {...fadeUp(delay)}>
              <Link href="/start">
                <div className="group bg-card border border-border rounded-2xl p-7 h-full flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/8 hover:border-primary/25">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary transition-colors duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
                  <div className="flex items-center gap-1 mt-5 text-primary text-sm font-semibold group-hover:gap-2 transition-all duration-200">
                    Get my estimate <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── MINIMAL CTA BANNER ───────────────────────────────────── */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative container mx-auto px-4 md:px-8 text-center">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
              Clear numbers. Confident decisions.
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-lg mx-auto">
              Under 10 questions. Instant personalized estimates. Zero pressure — ever.
            </p>
            <Button asChild size="lg" className="rounded-full h-14 px-10 text-base font-semibold bg-white text-primary hover:bg-white/95 hover:scale-[1.02] shadow-2xl transition-transform">
              <Link href="/start">
                Start Exploring Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <p className="text-primary-foreground/60 text-sm mt-7">
              Or call us:{" "}
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
