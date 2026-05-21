import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MortgageProvider } from "@/context/MortgageContext";

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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
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
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
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