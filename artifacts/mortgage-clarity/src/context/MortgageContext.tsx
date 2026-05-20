import React, { createContext, useContext, useState, ReactNode } from "react";

export type MortgageType = "buy" | "refinance" | "cashout" | "reverse" | null;
export type CreditScoreRange = "Below 580" | "580–619" | "620–679" | "680–739" | "740 or above";

export interface Answers {
  income: number;
  monthlyDebt: number;
  creditScore: CreditScoreRange;
  downPayment: number;
  homeValue: number;
  mortgageBalance: number;
  age: number;
}

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
  estimateResult: EstimateResult | null;
  setEstimateResult: (res: EstimateResult | null) => void;
  calculateEstimate: () => void;
}

const defaultAnswers: Answers = {
  income: 80000,
  monthlyDebt: 500,
  creditScore: "680–739",
  downPayment: 20000,
  homeValue: 400000,
  mortgageBalance: 200000,
  age: 65,
};

const defaultAdjustments: ScenarioAdjustments = {
  incomeBoost: 0,
  debtReduction: 0,
  creditImprovement: 0,
  downPaymentBoost: 0,
};

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: ReactNode }) {
  const [selectedMortgageType, setSelectedMortgageType] = useState<MortgageType>(null);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [scenarioAdjustments, setScenarioAdjustments] = useState<ScenarioAdjustments>(defaultAdjustments);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [estimateResult, setEstimateResult] = useState<EstimateResult | null>(null);

  const updateAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const addChatMessage = (msg: Omit<ChatMessage, "timestamp">) => {
    setChatHistory(prev => [...prev, { ...msg, timestamp: new Date() }]);
  };

  const resetChat = () => {
    setChatHistory([]);
  };

  const calculateEstimate = () => {
    const { income, monthlyDebt, creditScore, downPayment, mortgageBalance, homeValue, age } = answers;

    let creditMultiplier = 1.0;
    if (creditScore === "Below 580") creditMultiplier = 0.7;
    else if (creditScore === "580–619") creditMultiplier = 0.8;
    else if (creditScore === "620–679") creditMultiplier = 0.9;
    else if (creditScore === "740 or above") creditMultiplier = 1.1;

    let debtRed = monthlyDebt * 12 * 2;

    if (selectedMortgageType === "buy") {
      let base = income * 3.5;
      let low = Math.max(50000, (base - debtRed + downPayment * 2) * creditMultiplier * 0.9);
      let high = Math.max(60000, (base - debtRed + downPayment * 2) * creditMultiplier * 1.1);
      setEstimateResult({ low, high, type: "Estimated Home Price Range" });
    } else if (selectedMortgageType === "refinance") {
      let low = Math.max(0, mortgageBalance * 0.0025);
      let high = Math.max(0, mortgageBalance * 0.0075);
      setEstimateResult({ low, high, type: "Estimated Monthly Savings" });
    } else if (selectedMortgageType === "cashout") {
      let homeValEst = mortgageBalance * 1.4;
      let maxLoan = homeValEst * 0.8;
      let accessible = Math.max(0, maxLoan - mortgageBalance);
      setEstimateResult({ low: accessible * 0.9, high: accessible * 1.1, type: "Estimated Accessible Equity" });
    } else if (selectedMortgageType === "reverse") {
      const yearsRemaining = Math.max(0, 90 - age);
      const equityFactor = 0.4 + (age - 62) * 0.015;
      const low = Math.max(0, homeValue * Math.min(equityFactor, 0.75) * 0.85);
      const high = Math.max(0, homeValue * Math.min(equityFactor, 0.75) * 1.05);
      setEstimateResult({ low, high, type: "Estimated Loan Proceeds" });
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
      estimateResult,
      setEstimateResult,
      calculateEstimate
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
