import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useMortgage, MortgageType } from "@/context/MortgageContext";
import { Home, TrendingDown, HandCoins, Building2, Phone } from "lucide-react";
import { ContactDialog } from "@/components/ContactDialog";

export default function Start() {
  const [, setLocation] = useLocation();
  const { setSelectedMortgageType } = useMortgage();

  const handleSelect = (type: MortgageType) => {
    setSelectedMortgageType(type);
    setLocation("/questions");
  };

  return (
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
              { label: "Home Purchase",   result: "$340K – $420K", sub: "estimated buying range",    detail: "$85K income · 680 credit · 10% down",  colorClass: "text-emerald-700", bgClass: "bg-emerald-50/70 border-emerald-200/60" },
              { label: "Refinance",       result: "~$280/mo less", sub: "potential monthly savings", detail: "6.9% → 6.2% rate · 30-yr fixed",        colorClass: "text-primary",     bgClass: "bg-primary/5 border-primary/20" },
              { label: "Cash-Out Equity", result: "~$62,000",      sub: "potential equity access",   detail: "$480K home · $310K balance",            colorClass: "text-amber-700",   bgClass: "bg-amber-50/70 border-amber-200/60" },
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
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={() => handleSelect("buy")}
            data-testid="button-buy-home"
            className="group relative flex flex-col p-8 bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-2xl text-left transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Buy a Home</h3>
            <p className="text-muted-foreground">For first-time or repeat buyers looking to understand their budget and options.</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => handleSelect("refinance")}
            data-testid="button-refinance"
            className="group relative flex flex-col p-8 bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-2xl text-left transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingDown className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Refinance</h3>
            <p className="text-muted-foreground">Lower your interest rate, change your loan term, or reduce your monthly payment.</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            onClick={() => handleSelect("cashout")}
            data-testid="button-cashout"
            className="group relative flex flex-col p-8 bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-2xl text-left transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <HandCoins className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Cash-Out Refinance</h3>
            <p className="text-muted-foreground">Access your home equity to consolidate debt or fund major projects.</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => handleSelect("reverse")}
            data-testid="button-reverse-mortgage"
            className="group relative flex flex-col p-8 bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-2xl text-left transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Reverse Mortgage</h3>
            <p className="text-muted-foreground">For homeowners 62+ looking to convert home equity into tax-free income.</p>
          </motion.button>
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
  );
}
