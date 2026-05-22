import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MortgageProvider, useMortgage } from "@/context/MortgageContext";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X, ArrowRight } from "lucide-react";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import NewHome from "@/pages/NewHome";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import WhoWeAre from "@/pages/WhoWeAre";
import Start from "@/pages/Start";
import Questions from "@/pages/Questions";
import Results from "@/pages/Results";
import Chat from "@/pages/Chat";
import Handoff from "@/pages/Handoff";
import LookupBrief from "@/pages/LookupBrief";
import Learn from "@/pages/Learn";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

// Pages that are part of the active flow — don't show the banner there
const FLOW_PATHS = new Set(["/start", "/questions", "/results", "/chat", "/handoff"]);

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return null;
}

function RestartBanner() {
  const [location, setLocation]           = useLocation();
  const { estimateResult, clearSavedProgress } = useMortgage();
  const [dismissed, setDismissed]         = useState(false);

  const inFlow    = FLOW_PATHS.has(location);
  const hasResult = estimateResult !== null;
  const visible   = hasResult && !inFlow && !dismissed;

  const handleYes = () => {
    clearSavedProgress();
    setDismissed(true);
    setLocation("/start");
  };

  const handleNo = () => setDismissed(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="restart-banner"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: 80,  opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4"
        >
          <div className="bg-card border border-border rounded-2xl shadow-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <RotateCcw className="w-4 h-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                  Ready to start your pre-approval?
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  You have a saved estimate. You can restart the process anytime.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNo}
                className="h-9 px-4 rounded-full text-sm font-medium text-muted-foreground border border-border bg-secondary hover:bg-secondary/80 transition-colors"
              >
                Not now
              </button>
              <button
                onClick={handleYes}
                className="h-9 px-4 rounded-full text-sm font-semibold bg-primary text-primary-foreground flex items-center gap-1.5 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Restart
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNo}
                className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={NewHome} />
          <Route path="/how-it-works" component={Home} />
          <Route path="/overview" component={Landing} />
          <Route path="/about" component={WhoWeAre} />
          <Route path="/start" component={Start} />
          <Route path="/questions" component={Questions} />
          <Route path="/results" component={Results} />
          <Route path="/chat" component={Chat} />
          <Route path="/handoff" component={Handoff} />
          <Route path="/lookup" component={LookupBrief} />
          <Route path="/learn" component={Learn} />
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <RestartBanner />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MortgageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </MortgageProvider>
    </QueryClientProvider>
  );
}

export default App;
