import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useMortgage, MortgageType } from "@/context/MortgageContext";
import { Home, TrendingDown, HandCoins, Clock } from "lucide-react";

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

        <div className="grid md:grid-cols-2 gap-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            onClick={() => handleSelect("buy")}
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
            className="group relative flex flex-col p-8 bg-card border border-border hover:border-primary/50 hover:shadow-md rounded-2xl text-left transition-all hover:-translate-y-1"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <HandCoins className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Cash-Out Refinance</h3>
            <p className="text-muted-foreground">Access your home equity to consolidate debt or fund major projects.</p>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative flex flex-col p-8 bg-secondary/50 border border-border/50 rounded-2xl text-left opacity-75 cursor-not-allowed"
          >
            <div className="absolute top-6 right-6 px-3 py-1 bg-background text-xs font-medium rounded-full border border-border">
              Coming Soon
            </div>
            <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-semibold mb-2 text-muted-foreground">Reverse Mortgage</h3>
            <p className="text-muted-foreground">For homeowners 62+ looking to convert equity into cash.</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}