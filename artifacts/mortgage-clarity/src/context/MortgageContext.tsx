import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type MortgageType = "buy" | "refinance" | "cashout" | "reverse" | null;
export type CreditScoreRange = "500 or below" | "501–579" | "580–619" | "620–679" | "680–739" | "740 or above";

export type EmploymentType = "employed" | "self-employed" | "";
export type LoanType = "fha" | "conventional" | "va" | "";
export type LoanTerm = "30-fixed" | "30-arm" | "15-fixed" | "15-arm" | "";
export type RefiGoal = "lower-rate" | "lower-payment" | "pay-off-faster" | "consolidate-debt" | "";
export type PropertyType = "single-family" | "condo" | "townhouse" | "multi-family" | "";
export type LoanPurpose = "supplement-income" | "medical" | "home-improvements" | "debt-payoff" | "";

export const LOAN_TERM_RATES: Record<string, { rate: number; label: string; description: string }> = {
  "30-fixed": { rate: 6.75,  label: "30-Year Fixed",    description: "Stable payment for 30 years. Most popular choice." },
  "30-arm":   { rate: 6.375, label: "30-Year ARM",       description: "Lower rate for first 5 years, then adjusts with market." },
  "15-fixed": { rate: 6.125, label: "15-Year Fixed",     description: "Pay off faster and save on interest. Higher monthly payment." },
  "15-arm":   { rate: 5.875, label: "15-Year ARM",       description: "Lowest starting rate. Adjusts after initial fixed period." },
};

export interface Answers {
  fullName: string;
  income: number;
  monthlyDebt: number;
  creditScore: CreditScoreRange;
  downPayment: number;
  homeValue: number;
  mortgageBalance: number;
  age: number;
  employmentType: EmploymentType;
  loanType: LoanType;
  loanTerm: LoanTerm;
  currentInterestRate: number;
  refiGoal: RefiGoal;
  propertyType: PropertyType;
  loanPurpose: LoanPurpose;
}

export const CURRENT_MARKET_RATE = 6.875;

export interface ScenarioAdjustments {
  incomeBoost: number;
  debtReduction: number;
  creditImprovement: number;
  downPaymentBoost: number;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface EstimateResult {
  low: number;
  high: number;
  type: string;
}

interface MortgageContextType {
  selectedMortgageType: MortgageType;
  setSelectedMortgageType: (type: MortgageType) => void;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  updateAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  scenarioAdjustments: ScenarioAdjustments;
  setScenarioAdjustments: React.Dispatch<React.SetStateAction<ScenarioAdjustments>>;
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  addChatMessage: (msg: Omit<ChatMessage, "timestamp">) => void;
  resetChat: () => void;
  saveChatHistory: () => void;
  chatSaved: boolean;
  estimateResult: EstimateResult | null;
  setEstimateResult: (res: EstimateResult | null) => void;
  calculateEstimate: () => void;
  hasSavedProgress: boolean;
  clearSavedProgress: () => void;
}

// Progress key: answers, mortgage type, estimate — auto-saved
const PROGRESS_KEY = "loansbetter_progress";
// Chat key: only saved when user explicitly clicks Save
const CHAT_KEY = "loansbetter_chat";

const defaultAnswers: Answers = {
  fullName: "",
  income: 80000,
  monthlyDebt: 500,
  creditScore: "680–739" as CreditScoreRange,
  downPayment: 20000,
  homeValue: 400000,
  mortgageBalance: 200000,
  age: 65,
  employmentType: "",
  loanType: "",
  loanTerm: "",
  currentInterestRate: 0,
  refiGoal: "",
  propertyType: "",
  loanPurpose: "",
};

const defaultAdjustments: ScenarioAdjustments = {
  incomeBoost: 0,
  debtReduction: 0,
  creditImprovement: 0,
  downPaymentBoost: 0,
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadSavedChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: ChatMessage) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {
    return [];
  }
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: ReactNode }) {
  const saved = loadProgress();

  const [selectedMortgageType, setSelectedMortgageType] = useState<MortgageType>(
    saved?.selectedMortgageType ?? null
  );
  const [answers, setAnswers] = useState<Answers>({ ...defaultAnswers, ...(saved?.answers ?? {}) });
  const [scenarioAdjustments, setScenarioAdjustments] = useState<ScenarioAdjustments>(
    saved?.scenarioAdjustments ?? defaultAdjustments
  );
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(
    saved?.estimateResult ?? null
  );
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean>(!!saved?.selectedMortgageType);

  // Chat: loaded from its own key (only present if user explicitly saved it)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(loadSavedChat);
  const [chatSaved, setChatSaved] = useState<boolean>(() => !!localStorage.getItem(CHAT_KEY));

  // Auto-save progress (not chat) whenever meaningful state changes
  useEffect(() => {
    if (!selectedMortgageType) return;
    try {
      localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({ selectedMortgageType, answers, scenarioAdjustments, estimateResult })
      );
      setHasSavedProgress(true);
    } catch {
      // Storage full or unavailable — fail silently
    }
  }, [selectedMortgageType, answers, scenarioAdjustments, estimateResult]);

  // Keep saved chat in sync when chatSaved is true and new messages are added
  useEffect(() => {
    if (!chatSaved || chatHistory.length === 0) return;
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory));
    } catch {}
  }, [chatHistory, chatSaved]);

  const updateAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const addChatMessage = (msg: Omit<ChatMessage, "timestamp">) => {
    setChatHistory(prev => [...prev, { ...msg, timestamp: new Date() }]);
  };

  // Explicit save: persists chat to localStorage
  const saveChatHistory = () => {
    try {
      localStorage.setItem(CHAT_KEY, JSON.stringify(chatHistory));
      setChatSaved(true);
    } catch {}
  };

  const resetChat = () => {
    setChatHistory([]);
    setChatSaved(false);
    try { localStorage.removeItem(CHAT_KEY); } catch {}
  };

  const clearSavedProgress = () => {
    try {
      localStorage.removeItem(PROGRESS_KEY);
      localStorage.removeItem(CHAT_KEY);
    } catch {}
    setSelectedMortgageType(null);
    setAnswers(defaultAnswers);
    setScenarioAdjustments(defaultAdjustments);
    setChatHistory([]);
    setChatSaved(false);
    setEstimateResult(null);
    setHasSavedProgress(false);
  };

  const calculateEstimate = () => {
    const { income, monthlyDebt, creditScore, downPayment, mortgageBalance, homeValue, age, currentInterestRate } = answers;

    let creditMultiplier = 1.0;
    if (creditScore === "500 or below" || creditScore === "501–579") creditMultiplier = 0.7;
    else if (creditScore === "580–619") creditMultiplier = 0.8;
    else if (creditScore === "620–679") creditMultiplier = 0.9;
    else if (creditScore === "740 or above") creditMultiplier = 1.1;

    const debtRed = monthlyDebt * 12 * 2;

    if (selectedMortgageType === "buy") {
      const base = income * 3.5;
      const low = Math.max(50000, (base - debtRed + downPayment * 2) * creditMultiplier * 0.9);
      const high = Math.max(60000, (base - debtRed + downPayment * 2) * creditMultiplier * 1.1);
      setEstimateResult({ low, high, type: "Estimated Affordability Range" });
    } else if (selectedMortgageType === "refinance") {
      const rateDiff = Math.max(0, (currentInterestRate - CURRENT_MARKET_RATE) / 100);
      const base = rateDiff * mortgageBalance / 12;
      const low = Math.max(0, base * 0.9);
      const high = Math.max(0, base * 1.1);
      setEstimateResult({ low, high, type: "Estimated Monthly Savings" });
    } else if (selectedMortgageType === "cashout") {
      const ltvMultiplier = answers.loanType === "va" ? 0.9 : 0.8;
      const maxCashOut = Math.max(25000, homeValue * ltvMultiplier - mortgageBalance);
      setEstimateResult({ low: 25000, high: maxCashOut, type: "Cash-Out Range" });
    } else if (selectedMortgageType === "reverse") {
      const maxCashOut = Math.max(25000, homeValue * 0.5 - mortgageBalance);
      setEstimateResult({ low: 25000, high: maxCashOut, type: "Estimated Loan Proceeds Range" });
    }
  };

  return (
    <MortgageContext.Provider value={{
      selectedMortgageType,
      setSelectedMortgageType,
      answers,
      setAnswers,
      updateAnswer,
      scenarioAdjustments,
      setScenarioAdjustments,
      chatHistory,
      setChatHistory,
      addChatMessage,
      resetChat,
      saveChatHistory,
      chatSaved,
      estimateResult,
      setEstimateResult,
      calculateEstimate,
      hasSavedProgress,
      clearSavedProgress,
    }}>
      {children}
    </MortgageContext.Provider>
  );
}

export function useMortgage() {
  const context = useContext(MortgageContext);
  if (context === undefined) {
    throw new Error("useMortgage must be used within a MortgageProvider");
  }
  return context;
}
