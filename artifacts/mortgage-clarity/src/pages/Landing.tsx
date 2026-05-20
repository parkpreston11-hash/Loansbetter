import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Shield, HeartHandshake } from "lucide-react";

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh] w-full">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-24 md:py-32 lg:py-48 flex items-center justify-center bg-gradient-to-b from-secondary/50 to-background overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="container px-4 md:px-6 flex flex-col items-center text-center z-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground max-w-4xl"
            >
              Understand your mortgage options <span className="text-primary italic">before</span> paperwork.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mt-6 text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              LoansBetter walks you through your mortgage options in minutes — no forms, no jargon, no pressure.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
            >
              <Link href="/start" className="inline-flex items-center justify-center rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground shadow-lg h-14 px-10">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="tel:7027279713"
                className="inline-flex items-center justify-center rounded-full text-lg font-medium transition-transform hover:scale-105 active:scale-95 h-14 px-10 border border-border bg-background text-foreground hover:bg-secondary"
              >
                Talk to a Loan Officer
              </a>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 text-muted-foreground text-base"
            >
              Call us: <a href="tel:7027279713" className="font-semibold text-primary hover:underline">(702) 727-9713</a>
            </motion.p>
          </div>
        </section>

        {/* How It Works */}
        <section className="w-full py-20 md:py-32 bg-background border-t border-border/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">How It Works</h2>
              <p className="mt-4 text-lg text-muted-foreground">Three simple steps to clarity.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                { step: "01", title: "Share your basics", desc: "Answer 5 simple questions about your financial picture. No credit checks or sensitive info." },
                { step: "02", title: "See your options", desc: "Get an instant, jargon-free estimate of what you might qualify for, plus interactive scenarios." },
                { step: "03", title: "Talk when you're ready", desc: "We'll prepare a summary you can take to any lender when you feel confident." }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-secondary text-primary font-serif text-2xl flex items-center justify-center font-bold mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/" className="inline-flex items-center text-primary font-medium hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </section>

        {/* Why It's Different */}
        <section className="w-full py-20 md:py-32 bg-card border-t border-border">
          <div className="container px-4 md:px-6 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6">
                  Not a bank. Not a lead generator.
                </h2>
                <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                  We built LoansBetter because the mortgage process is intentionally confusing. We're here to give you back the power.
                </p>

                <div className="space-y-8">
                  {[
                    { icon: Shield, title: "Stress-Free & Secure", desc: "We never sell your data or spam your phone." },
                    { icon: CheckCircle2, title: "Simple & Transparent", desc: "Complex financial formulas translated into plain English." },
                    { icon: HeartHandshake, title: "On Your Side", desc: "We act as your educational guide, not your salesperson." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold mb-1">{item.title}</h4>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-secondary rounded-3xl p-8 md:p-12 border border-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="relative z-10 space-y-6">
                  {[
                    { quote: "For the first time, I actually understood how my student loans affected my homebuying budget.", author: "Sarah M.", role: "First-time buyer" },
                    { quote: "The scenario sliders are brilliant. I saw exactly what paying off my car would do to my mortgage options.", author: "James T.", role: "Refinancing" },
                    { quote: "I called the loan officer already knowing what to ask. Made the whole process so much smoother.", author: "Patricia R.", role: "Cash-out refinance" },
                  ].map((test, i) => (
                    <div key={i} className="bg-background rounded-2xl p-6 shadow-sm border border-border/50">
                      <p className="text-foreground text-lg mb-4">"{test.quote}"</p>
                      <p className="text-sm font-medium text-muted-foreground">— {test.author}, <span className="font-normal">{test.role}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="w-full py-20 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">Ready to get clarity?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">Start in minutes or call us directly — no paperwork required.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/start" className="inline-flex items-center justify-center rounded-full font-medium h-14 px-10 bg-white text-primary hover:bg-white/90 transition-transform hover:scale-105 active:scale-95">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <a href="tel:7027279713" className="inline-flex items-center justify-center rounded-full font-medium h-14 px-10 border border-white/40 text-primary-foreground hover:bg-white/10 transition-all">
                Call (702) 727-9713
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-12 bg-background border-t border-border">
        <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold font-serif text-xs">L</div>
            <span className="font-serif font-semibold text-lg tracking-tight">LoansBetter</span>
          </div>
          <p className="text-xs text-muted-foreground text-center md:text-left max-w-md">
            LoansBetter is an educational tool only. Not a lender. Estimates are informational and do not constitute financial advice.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
