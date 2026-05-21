import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowRight, Eye, Shield, TrendingUp, Users, HeartHandshake,
  Lightbulb, BookOpen, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: "easeOut" as const },
});

export default function WhoWeAre() {
  return (
    <div className="bg-background text-foreground overflow-x-hidden">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative py-28 md:py-36 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/3 -translate-y-1/4" />

        <div className="relative container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <motion.p {...fadeUp(0)} className="text-xs font-semibold tracking-widest text-primary uppercase mb-5">
            Who We Are
          </motion.p>
          <motion.h1 {...fadeUp(0.07)} className="font-serif text-5xl md:text-6xl font-bold leading-tight mb-7 tracking-tight">
            Built to make mortgage decisions clearer.
          </motion.h1>
          <motion.p {...fadeUp(0.14)} className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            LoansBetter is an independent platform designed to help people understand
            their mortgage options through simple tools, clear explanations, and
            scenario-based insights — with no pressure attached.
          </motion.p>
        </div>
      </section>

      {/* ─── WHO WE ARE ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">

          {/* Left — story */}
          <motion.div {...fadeUp(0)} className="space-y-6 text-lg text-foreground leading-relaxed">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase">Our story</p>
            <p>
              We built LoansBetter because mortgage decisions are often overwhelming and
              unclear. Too many people are forced to rely on confusing explanations,
              complicated numbers, or rushed conversations with people who have a
              financial incentive to close as fast as possible.
            </p>
            <p className="text-muted-foreground">
              Most people walk into the mortgage process at a disadvantage — and they
              know it. That feeling of not fully understanding something before signing
              your name to it is exactly what we're here to change.
            </p>
            <p>
              Our goal is simple:{" "}
              <span className="font-semibold text-primary">
                make mortgage understanding more accessible, transparent, and calm.
              </span>
            </p>
          </motion.div>

          {/* Right — photo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative hidden md:block"
          >
            <div className="relative rounded-3xl overflow-hidden h-[440px] shadow-xl">
              <img
                src="/images/who-we-are.jpg"
                alt="Homeowners feeling confident about their decision"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>
            {/* Accent strip on left edge */}
            <div className="absolute top-12 -left-1.5 w-1.5 h-20 bg-primary rounded-full opacity-70" />
            {/* Floating quote */}
            <div className="absolute -bottom-5 -right-6 bg-card border border-border rounded-2xl shadow-lg p-5 max-w-[220px]">
              <p className="text-sm text-foreground font-medium leading-snug italic">
                "Built for you, not for lenders."
              </p>
              <p className="text-xs text-muted-foreground mt-2">— LoansBetter</p>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ─── DIVIDER ──────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 max-w-3xl">
        <div className="border-t border-border" />
      </div>

      {/* ─── WHAT WE BELIEVE ──────────────────────────────────────── */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4 md:px-8">
          <motion.div {...fadeUp(0)} className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Our foundation</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold">What we believe.</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                icon: Eye, title: "Clarity over complexity",
                desc: "Financial concepts don't have to be intimidating. When information is presented clearly, good decisions follow naturally.",
                delay: 0,
              },
              {
                icon: Shield, title: "Transparency builds trust",
                desc: "We have no hidden agendas, no lending relationships, and no reason to push you toward any particular outcome.",
                delay: 0.07,
              },
              {
                icon: TrendingUp, title: "Informed decisions lead to better outcomes",
                desc: "When people truly understand their options, they make choices that are right for their actual situation — not just the one they were presented.",
                delay: 0.14,
              },
              {
                icon: HeartHandshake, title: "No pressure, no confusion",
                desc: "There is no right answer we're steering you toward. Your situation is yours. We just help you see it more clearly.",
                delay: 0.07,
              },
              {
                icon: Lightbulb, title: "Tools should empower, not overwhelm",
                desc: "We design every part of this platform to reduce complexity, not add to it. If something is confusing, that's our problem to fix.",
                delay: 0.14,
              },
              {
                icon: Users, title: "Built for real people",
                desc: "Not for finance professionals. Not for investors. For people making one of the most important financial decisions of their lives.",
                delay: 0.21,
              },
            ].map(({ icon: Icon, title, desc, delay }) => (
              <motion.div key={title} {...fadeUp(delay)} className="bg-card border border-border rounded-2xl p-7 hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHAT WE DO ───────────────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-20 max-w-3xl">
        <motion.div {...fadeUp(0)}>
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-5">What we do</p>
          <h2 className="font-serif text-4xl font-semibold mb-8 leading-tight">Simple tools for a complex decision.</h2>
          <div className="space-y-5 text-lg text-foreground leading-relaxed">
            <p>
              LoansBetter provides simple tools that help users explore mortgage
              scenarios, understand financial tradeoffs, and make more confident
              decisions before committing to anything.
            </p>
            <p className="text-muted-foreground">
              We do not issue loans or act as a bank.{" "}
              <span className="text-foreground font-medium">
                Our focus is helping you understand your options clearly before
                you make any financial commitments.
              </span>{" "}
              That's the entire scope of what we do — and we think that's enough.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── WHY IT EXISTS ────────────────────────────────────────── */}
      <section className="bg-secondary/30 border-y border-border py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-3xl">
          <motion.div {...fadeUp(0)}>
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-5">Why this exists</p>
            <h2 className="font-serif text-4xl font-semibold mb-8 leading-tight">
              Big decisions deserve better clarity.
            </h2>
            <div className="space-y-5 text-lg leading-relaxed">
              <p className="text-foreground">
                Most financial decisions are made under stress, confusion, or time
                pressure. People are handed documents they don't fully understand,
                given numbers without context, and pushed toward decisions before
                they're ready.
              </p>
              <p className="text-muted-foreground">
                We believe people deserve better — especially when the decision
                involves their home. A mortgage is likely the largest financial
                commitment most people will ever make. The process of understanding
                it should not add stress to an already difficult moment.
              </p>
              <p className="font-medium text-foreground text-xl mt-6 pt-2 border-t border-border">
                This platform exists to reduce confusion, not add to it.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST & TRANSPARENCY ─────────────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-20 max-w-5xl">
        <motion.div {...fadeUp(0)} className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">Our commitments</p>
          <h2 className="font-serif text-4xl font-semibold">Simple. Transparent. Independent.</h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: BookOpen, title: "Independent platform", desc: "No lender relationships. No quotas. No incentives to point you anywhere." },
            { icon: CheckCircle2, title: "No lending decisions", desc: "We are not a lender. We help you understand — you decide what to do with that." },
            { icon: Shield, title: "No hidden agendas", desc: "There is nothing behind what you see. No upsells. No data selling. No surprises." },
            { icon: Eye, title: "Built for clarity", desc: "Every feature on this platform has one job: make something easier to understand." },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div key={title} {...fadeUp(i * 0.08)} className="text-center px-4 py-8 bg-card border border-border rounded-2xl hover:shadow-md hover:border-primary/20 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CLOSING ──────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-background pointer-events-none" />
        <div className="relative container mx-auto px-4 md:px-8 text-center max-w-2xl">
          <motion.div {...fadeUp(0)}>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-7 leading-tight">
              Clarity leads to confidence.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-10">
              When people understand their options clearly, they make better
              decisions. That is the foundation of LoansBetter — and it always will be.
            </p>
            <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-10 text-base font-medium border-border hover:border-primary/40 hover:bg-primary/4 transition-all">
              <Link href="/learn">
                Explore Tools
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
