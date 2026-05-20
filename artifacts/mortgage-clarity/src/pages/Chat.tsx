import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useMortgage, ChatMessage } from "@/context/MortgageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, UserCircle2, Bot, ArrowLeft } from "lucide-react";

export default function Chat() {
  const { chatHistory, setChatHistory, addChatMessage } = useMortgage();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length === 0) {
      addChatMessage({
        role: "ai",
        content: "Hi! I'm here to help you understand your mortgage options. Ask me anything — I can explain terms, walk through hypothetical scenarios, and help you feel prepared before talking to a lender. Remember, I provide educational information only, not financial advice."
      });
    }
  }, [chatHistory, addChatMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const userMsg = inputValue.trim();
    addChatMessage({ role: "user", content: userMsg });
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response logic
    setTimeout(() => {
      let response = "";
      const lowerMsg = userMsg.toLowerCase();
      
      if (lowerMsg.includes("down payment")) {
        response = "A down payment is the upfront cash you pay toward a home purchase. Conventional loans typically require 3%–20% down. Putting down less than 20% usually requires Private Mortgage Insurance (PMI). A larger down payment reduces your loan amount, monthly payment, and may qualify you for better rates.";
      } else if (lowerMsg.includes("pmi") || lowerMsg.includes("private mortgage")) {
        response = "Private Mortgage Insurance (PMI) is required on conventional loans when your down payment is less than 20%. It protects the lender (not you) if you default. PMI typically costs 0.5%–1.5% of your loan amount annually and can be removed once you reach 20% equity.";
      } else if (lowerMsg.includes("credit score") || lowerMsg.includes("credit")) {
        response = "Credit scores range from 300–850. For mortgages: 740+ typically qualifies for the best rates, 680–739 is good, 620–679 is fair and may have slightly higher rates, below 620 may limit options. You can improve your score by paying bills on time, reducing credit card balances, and avoiding new credit inquiries.";
      } else if (lowerMsg.includes("rate")) {
        response = "Mortgage rates come in two main types: fixed (the same for the life of the loan, usually 15 or 30 years) and adjustable (starts lower, then adjusts periodically based on market conditions). Fixed rates offer predictability; ARMs can make sense if you plan to move or refinance within 5–7 years.";
      } else if (lowerMsg.includes("refinance")) {
        response = "Refinancing means replacing your current mortgage with a new one — usually to get a lower interest rate, reduce your monthly payment, or change your loan term. The key question is your 'break-even point': how many months does it take for your monthly savings to recoup the closing costs? If you plan to stay in your home beyond that point, refinancing often makes financial sense.";
      } else if (lowerMsg.includes("dti") || lowerMsg.includes("debt")) {
        response = "Debt-to-income ratio (DTI) compares your monthly debt payments to your gross monthly income. Most lenders prefer a total DTI below 43%. For example, if you earn $5,000/month and have $1,500 in monthly debt payments, your DTI is 30%. A lower DTI improves your loan eligibility and the rates you may qualify for.";
      } else {
        response = "That's a great question. Mortgage decisions depend on many factors including your income, credit profile, existing debts, and local market conditions. For your specific situation, I'd recommend discussing with a licensed loan officer who can review your complete picture. Is there a specific term or concept I can help explain?";
      }

      setIsTyping(false);
      addChatMessage({ role: "ai", content: response });
    }, 1500);
  };

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link href="/results">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Your Mortgage Guide</h1>
              <p className="text-xs text-muted-foreground">Educational assistance only</p>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="hidden sm:flex">
          <Link href="/handoff">Talk to a Loan Officer</Link>
        </Button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {chatHistory.map((msg, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 max-w-3xl ${msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted/50 border border-border">
              {msg.role === "user" ? <UserCircle2 className="w-5 h-5 text-muted-foreground" /> : <Bot className="w-5 h-5 text-primary" />}
            </div>
            <div className={`p-4 rounded-2xl text-[15px] leading-relaxed ${
              msg.role === "user" 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-secondary text-foreground rounded-tl-sm border border-border/50"
            }`}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex gap-3 max-w-3xl mr-auto"
          >
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted/50 border border-border">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div className="p-4 rounded-2xl bg-secondary rounded-tl-sm border border-border/50 flex items-center gap-1">
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 bg-primary/40 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-primary/60 rounded-full" />
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-primary/80 rounded-full" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto relative">
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about mortgage terms, rates, or your options..."
            className="pr-12 h-14 rounded-full bg-card shadow-sm border-border text-base"
          />
          <Button 
            onClick={handleSend}
            disabled={!inputValue.trim() || isTyping}
            size="icon" 
            className="absolute right-2 top-2 h-10 w-10 rounded-full"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          This assistant provides educational information only. It is not financial, legal, or investment advice.
        </p>
      </div>
    </div>
  );
}