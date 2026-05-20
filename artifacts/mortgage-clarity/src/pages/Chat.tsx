import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useMortgage } from "@/context/MortgageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, UserCircle2, ArrowLeft, Phone, Sparkles, BookmarkCheck, Bookmark } from "lucide-react";

// ─── Response Engine ──────────────────────────────────────────────────────────

type MatchRule = {
  patterns: (string | RegExp)[];
  response: (ctx: ResponseContext) => string;
};

interface ResponseContext {
  income: number;
  monthlyDebt: number;
  creditScore: string;
  downPayment: number;
  homeValue: number;
  mortgageBalance: number;
  mortgageType: string | null;
  estimate: { low: number; high: number } | null;
  history: string[];
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function dtiFromCtx(ctx: ResponseContext) {
  if (!ctx.income) return null;
  return ctx.monthlyDebt / (ctx.income / 12);
}

const rules: MatchRule[] = [
  // ── Down Payment ──────────────────────────────────────────────────────────
  {
    patterns: ["down payment", "how much to put down", "how much down", "downpayment"],
    response: (ctx) => {
      const dp = ctx.downPayment;
      const hv = ctx.homeValue;
      const dpPct = hv > 0 ? dp / hv : 0;
      const hasPMI = dpPct < 0.2 && hv > 0;
      let personal = "";
      if (dp > 0 && hv > 0) {
        personal = ` Based on what you entered, your ${fmt(dp)} down payment is ${pct(dpPct)} of your target home price — ${hasPMI ? "which means PMI would likely apply until you hit 20% equity, but that's completely manageable and very common" : "which clears the 20% threshold, so you'd avoid PMI entirely — great position to be in"}.`;
      }
      return `A down payment is the upfront portion of the purchase price you pay in cash at closing. Here's the landscape:\n\n• **3–3.5%** — FHA loans and some conventional programs allow this for first-time buyers\n• **5–10%** — Common entry range; PMI applies\n• **20%+** — Avoids PMI, often unlocks better rates\n\nPMI (Private Mortgage Insurance) adds roughly 0.5–1.5% of the loan amount per year — on a $300k loan, that's about $125–$375/month — but it falls away once you hit 20% equity.${personal}\n\nThe "right" amount depends on your cash reserves, rate environment, and how long you plan to stay. Putting down *less* isn't necessarily worse — keeping cash liquid has real value too.`;
    },
  },

  // ── PMI ───────────────────────────────────────────────────────────────────
  {
    patterns: ["pmi", "private mortgage insurance", "mortgage insurance"],
    response: (ctx) => {
      const dp = ctx.downPayment;
      const hv = ctx.homeValue;
      const hasPMI = hv > 0 && dp / hv < 0.2;
      const extra = hasPMI
        ? ` With your current down payment of ${fmt(dp)}, PMI would likely apply — but it's not permanent. Once your loan balance drops to 80% of the home's value (through payments or appreciation), you can request cancellation.`
        : dp > 0 && hv > 0
        ? ` With your down payment of ${fmt(dp)}, you're above the 20% threshold — you'd likely avoid PMI entirely.`
        : "";
      return `PMI protects the *lender* — not you — if you stop making payments. It's required on most conventional loans when your down payment is under 20%.\n\n**What it costs:** Typically 0.2%–1.5% of the loan amount per year, depending on your credit score and loan size. On a $300k loan, expect $50–$375/month.\n\n**How to get rid of it:**\n• Automatically cancels at 78% LTV (Loan-to-Value)\n• You can request cancellation at 80% LTV\n• Refinancing once you have 20% equity is another route\n\nFHA loans have their own version called MIP, which works slightly differently.${extra}`;
    },
  },

  // ── Credit Score ─────────────────────────────────────────────────────────
  {
    patterns: ["credit score", "fico", "my credit", "improve credit", "credit history", "credit report", "bad credit", "good credit"],
    response: (ctx) => {
      const scoreMap: Record<string, string> = {
        "Below 580": "below 580 — you're still in the game. FHA loans go down to 500 with 10% down. The most impactful move right now is consistent on-time payments and reducing revolving balances.",
        "580–619": "in the 580–619 range — FHA programs are accessible, and many lenders work with this range. A few months of focus on your credit can make a meaningful difference.",
        "620–679": "in the 620–679 range — conventional loans are accessible, though rates may be slightly higher than top-tier scores. You're in solid, workable territory.",
        "680–739": "in the 680–739 range — that's genuinely good. Most loan programs are fully accessible, and you're not far from the best rate tiers.",
        "740 or above": "at 740 or above — you're in the top tier. This typically qualifies you for the most competitive rates and terms across all loan types. That's a real advantage.",
      };
      const scoreNote = ctx.creditScore && scoreMap[ctx.creditScore]
        ? `\n\nBased on what you shared, your score is ${scoreMap[ctx.creditScore]}`
        : "";
      return `Credit score has a big impact on mortgage rates — even a 20-point difference can mean thousands over the life of a loan.\n\n**Rate tier overview:**\n• 760+: Best available rates\n• 720–759: Very competitive\n• 680–719: Good, minor premium\n• 640–679: Fair, moderate premium\n• 580–639: Limited options, higher rates\n• Below 580: FHA/specialty programs\n\n**What actually moves the needle:**\n• Paying every bill on time (biggest factor — 35% of your score)\n• Keeping credit card balances below 30% of limits\n• Not opening new accounts right before applying\n• Disputing any errors on your report (free at annualcreditreport.com)${scoreNote}`;
    },
  },

  // ── Interest Rates / APR ─────────────────────────────────────────────────
  {
    patterns: ["interest rate", "mortgage rate", "what rate", "current rate", "apr", "annual percentage", "rate today", "rate right now", "how are rates"],
    response: () =>
      `Mortgage rates are one of the most-asked questions — and the answer is genuinely complex.\n\n**Fixed vs. Adjustable:**\n• **Fixed rate** — locked in for the loan's life (15 or 30 years). Predictable, great for stability.\n• **ARM (Adjustable)** — starts lower, adjusts after an initial period (5/1, 7/1, 10/1 ARM). Can make sense if you plan to sell or refinance within that window.\n\n**What affects YOUR rate:**\n• Credit score (biggest lever you control)\n• Loan-to-value ratio (higher down payment → better rate)\n• Loan type (conventional, FHA, VA, jumbo)\n• Loan term (15-year rates are lower than 30-year)\n• Market conditions\n\n**APR vs. Rate:** The rate is your interest cost. APR includes fees and closing costs — it's a truer picture of total loan cost. Always compare APR when shopping lenders.\n\nRates change daily — sometimes multiple times a day — based on bond markets. The best rate for *you* depends on your complete profile.`,
  },

  // ── Loan Types ────────────────────────────────────────────────────────────
  {
    patterns: ["loan type", "fha", "va loan", "usda", "conventional loan", "jumbo", "types of mortgage", "what kind of loan", "loan options"],
    response: (ctx) => {
      const score = ctx.creditScore;
      let personalNote = "";
      if (score === "Below 580" || score === "580–619") {
        personalNote = "\n\nGiven your credit score range, FHA loans would likely be the most accessible path for you right now — they're specifically designed for situations like yours.";
      } else if (score === "740 or above" || score === "680–739") {
        personalNote = "\n\nWith your credit score, you'd likely qualify across all conventional programs — giving you real flexibility to compare and choose the best fit.";
      }
      return `Here's a plain-English breakdown of the main mortgage types:\n\n**Conventional** — Not government-backed. Requires 620+ credit, 3% minimum down. Best rates for strong profiles.\n\n**FHA** — Government-backed (Federal Housing Administration). Credit scores down to 500. 3.5% down with 580+ score. More flexible on debt-to-income ratios. Requires mortgage insurance premium (MIP) for life of loan in most cases.\n\n**VA** — For veterans, active-duty service members, and eligible spouses. No down payment required, no PMI, competitive rates. One of the best programs available if you qualify.\n\n**USDA** — For rural and some suburban areas. No down payment required. Income limits apply. Worth checking if you're open to those areas.\n\n**Jumbo** — For loan amounts above conforming limits (~$766,550 in most areas, higher in expensive markets). Stricter requirements, often requires 10–20% down.${personalNote}`;
    },
  },

  // ── Refinance ────────────────────────────────────────────────────────────
  {
    patterns: ["refinance", "refi", "refinancing", "should i refinance", "when to refinance"],
    response: (ctx) => {
      const bal = ctx.mortgageBalance;
      const extra = bal > 0
        ? `\n\nWith a balance around ${fmt(bal)}, even a modest rate reduction can add up. For example, a 0.5% rate drop on that balance would typically save $200–$300/month — it's worth running the numbers for your specific situation.`
        : "";
      return `Refinancing replaces your existing mortgage with a new one — usually to lower your rate, reduce your monthly payment, shorten your term, or switch from ARM to fixed.\n\n**The break-even calculation:**\nDivide your closing costs by your monthly savings. If you'd save $250/month and closing costs are $5,000, your break-even is 20 months. If you plan to stay in the home longer than that, refinancing likely makes sense.\n\n**When refinancing is worth it:**\n• Rates have dropped at least 0.5–1% below your current rate\n• You plan to stay in the home past the break-even point\n• Your credit has improved significantly since your original loan\n• You want to switch from a 30-year to a 15-year term\n\n**When to be cautious:**\n• You're close to paying off the loan\n• You'd reset to a 30-year term and pay more interest over time\n• Closing costs eat up your savings too quickly${extra}`;
    },
  },

  // ── Cash-Out Refinance ───────────────────────────────────────────────────
  {
    patterns: ["cash out", "cash-out", "cash out refinance", "home equity", "tap equity", "borrow against home", "access equity"],
    response: (ctx) => {
      const bal = ctx.mortgageBalance;
      const extra = bal > 0
        ? `\n\nWith a balance of ${fmt(bal)}, the accessible equity depends heavily on your home's current value. A general rule: lenders allow borrowing up to 80% of your home's value minus what you owe.`
        : "";
      return `A cash-out refinance lets you replace your mortgage with a larger one and pocket the difference as cash. It's a way to access equity you've built up.\n\n**How it works:**\nIf your home is worth $400k and you owe $200k, you have $200k in equity. Lenders typically let you access up to 80% of your home's value ($320k), meaning you could take out up to $120k cash.\n\n**Common uses:**\n• Home renovations (can increase home value)\n• Debt consolidation (often lower rate than credit cards)\n• Large expenses\n• Investment opportunities\n\n**The tradeoff:**\nYour mortgage balance goes up, your monthly payment likely increases, and your home is collateral. The cash you receive is not taxed as income.\n\n**Alternatives to consider:**\n• **HELOC** — A line of credit against your equity; more flexible, often lower closing costs\n• **Home equity loan** — A second loan, fixed rate, doesn't touch your first mortgage${extra}`;
    },
  },

  // ── Reverse Mortgage ─────────────────────────────────────────────────────
  {
    patterns: ["reverse mortgage", "reverse", "hecm", "home equity conversion"],
    response: () =>
      `A reverse mortgage lets homeowners 62+ convert part of their home equity into cash — without monthly mortgage payments.\n\n**How it works:**\nInstead of you paying the lender each month, the lender makes payments to *you* (or provides a lump sum or credit line). The loan balance grows over time and is repaid when you sell, move out, or pass away. Your heirs can keep the home by repaying the loan.\n\n**Key requirements:**\n• Must be 62 or older\n• Home must be your primary residence\n• Must maintain the home and pay property taxes and insurance\n• Typically need substantial equity (usually 50%+)\n\n**Payment options:**\n• Lump sum (fixed rate)\n• Monthly payments\n• Line of credit (grows over time — often most flexible)\n• Combination\n\n**Important to know:**\nThe HECM (Home Equity Conversion Mortgage) is the most common type and is federally insured. It comes with required counseling, which is actually a valuable step to help you understand exactly what you're getting into.`,
  },

  // ── DTI ───────────────────────────────────────────────────────────────────
  {
    patterns: ["dti", "debt to income", "debt-to-income", "how much debt", "qualify with debt"],
    response: (ctx) => {
      const dti = dtiFromCtx(ctx);
      let personalNote = "";
      if (dti !== null && ctx.income > 0) {
        const dtiPct = (dti * 100).toFixed(0);
        const status =
          dti < 0.36 ? "well within the preferred range" :
          dti < 0.43 ? "within the typical qualifying range for most programs" :
          dti < 0.5  ? "above the conventional limit but some programs (FHA, VA) go higher" :
                       "on the higher side — reducing monthly obligations would strengthen your position";
        personalNote = `\n\nWith your income of ${fmt(ctx.income)}/year and monthly debts of ${fmt(ctx.monthlyDebt)}, your estimated front-end DTI is around ${dtiPct}% — ${status}.`;
      }
      return `DTI (Debt-to-Income ratio) is one of the core numbers lenders look at. It compares your monthly debt obligations to your gross monthly income.\n\n**Two types:**\n• **Front-end DTI** — Just housing costs (mortgage, taxes, insurance) ÷ monthly income. Lenders prefer under 28–31%.\n• **Back-end DTI** — All monthly debts (housing + car + student loans + cards) ÷ monthly income. Most programs prefer under 43%.\n\n**By loan type:**\n• Conventional: Typically up to 43–45%\n• FHA: Up to 50% with strong compensating factors\n• VA: Flexible, no hard cap but 41% is a benchmark\n\n**How to improve it:**\nPay down or pay off debts before applying. Even eliminating one car payment can meaningfully shift your qualifying range.${personalNote}`;
    },
  },

  // ── Affordability ─────────────────────────────────────────────────────────
  {
    patterns: ["afford", "how much can i", "how much house", "what can i qualify", "how much mortgage", "buying power", "qualify for"],
    response: (ctx) => {
      const estimate = ctx.estimate;
      if (estimate) {
        return `Based on what you shared, your estimate puts you in the **${fmt(estimate.low)} – ${fmt(estimate.high)}** range. Here's how that breaks down conceptually:\n\n**The main inputs that drive affordability:**\n• **Income** — Lenders typically allow housing costs up to 28–31% of gross monthly income\n• **Existing debt** — Every dollar of monthly debt reduces qualifying power by roughly $3–5 in home price\n• **Down payment** — More down = smaller loan = more qualifying room\n• **Credit score** — Higher scores unlock lower rates, which directly increases buying power\n\n**Rough rule of thumb:** Most people can afford roughly 3–5× their annual income in home value, depending on their debt load and down payment.\n\nThe scenario explorer on your results page lets you see exactly how adjusting any of these inputs shifts your range — it's worth playing with.`;
      }
      return `Affordability comes down to four main levers:\n\n1. **Income** — Lenders typically allow housing costs up to 28–31% of your gross monthly income\n2. **Existing debt** — The lower your monthly obligations, the more room for a mortgage payment\n3. **Down payment** — Reduces the loan amount you need\n4. **Credit score** — Determines the rate you'll get, which directly impacts monthly payments\n\n**Quick rule of thumb:** Most people can qualify for roughly 3–5× their gross annual income in home price, depending on their specific situation.\n\nIf you complete the questions in the app, we'll generate a personalized estimate based on your actual numbers.`;
    },
  },

  // ── Monthly Payment ───────────────────────────────────────────────────────
  {
    patterns: ["monthly payment", "how much per month", "what will i pay monthly", "mortgage payment", "payment calculation"],
    response: (ctx) => {
      const hv = ctx.homeValue;
      const dp = ctx.downPayment;
      const loanAmount = hv > dp ? hv - dp : hv * 0.8;
      let paymentExample = "";
      if (loanAmount > 0) {
        const rate30 = 0.07 / 12;
        const n = 360;
        const payment30 = Math.round(loanAmount * (rate30 * Math.pow(1 + rate30, n)) / (Math.pow(1 + rate30, n) - 1));
        const rate15 = 0.065 / 12;
        const n15 = 180;
        const payment15 = Math.round(loanAmount * (rate15 * Math.pow(1 + rate15, n15)) / (Math.pow(1 + rate15, n15) - 1));
        paymentExample = `\n\nFor a loan around ${fmt(loanAmount)} (illustrative, at ~7% for 30-year, ~6.5% for 15-year):\n• **30-year:** ~${fmt(payment30)}/month (principal & interest only)\n• **15-year:** ~${fmt(payment15)}/month — higher payment, but far less interest overall\n\nNote: Add property taxes (0.5–2% of home value annually), homeowner's insurance (~$100–200/month), and possibly HOA or PMI for total picture.`;
      }
      return `Your monthly mortgage payment has several components — often called PITI:\n\n• **P**rincipal — The portion paying down your loan balance\n• **I**nterest — The lender's cost for the loan\n• **T**axes — Property taxes, usually escrowed monthly\n• **I**nsurance — Homeowner's insurance, also escrowed\n\nPlus possibly PMI (if down payment < 20%) and HOA fees.${paymentExample}`;
    },
  },

  // ── Pre-approval ─────────────────────────────────────────────────────────
  {
    patterns: ["pre-approval", "preapproval", "pre approval", "pre-qualify", "prequalify", "get approved", "mortgage approval"],
    response: () =>
      `Pre-approval and pre-qualification are different — and that difference matters.\n\n**Pre-qualification:** A quick, usually informal estimate based on self-reported info. No hard credit pull. Fast and painless — good for early exploration.\n\n**Pre-approval:** A formal process where a lender reviews your actual income documents, credit, and assets. Results in a letter stating how much you're approved to borrow. Sellers take this seriously — it shows you're a real buyer.\n\n**What you'll typically need for pre-approval:**\n• W-2s and tax returns (last 2 years)\n• Recent pay stubs\n• Bank statements (last 2-3 months)\n• Photo ID\n• Authorization for a hard credit pull\n\n**Good news:** Getting pre-approved doesn't obligate you to use that lender. It's smart to get pre-approvals from 2–3 lenders within a 14–45 day window — credit bureaus treat multiple mortgage inquiries in that window as a single inquiry, so it won't hurt your score.`,
  },

  // ── Closing Costs ────────────────────────────────────────────────────────
  {
    patterns: ["closing cost", "closing fees", "how much to close", "what are closing costs"],
    response: (ctx) => {
      const hv = ctx.homeValue;
      const low = hv * 0.02;
      const high = hv * 0.05;
      const extra = hv > 0 ? `\n\nFor a home around ${fmt(hv)}, closing costs would typically fall between ${fmt(low)} and ${fmt(high)}.` : "";
      return `Closing costs are the fees and expenses you pay to finalize a mortgage — beyond the down payment. They typically run **2–5% of the loan amount**.\n\n**Common costs include:**\n• Loan origination fee (0.5–1%)\n• Appraisal ($300–700)\n• Title search and insurance ($1,000–2,500)\n• Attorney or escrow fees (varies by state)\n• Prepaid items: homeowner's insurance, property tax escrow, prepaid interest\n• Credit report fee, recording fees\n\n**Ways to reduce them:**\n• **Seller concessions** — Ask the seller to cover some costs (common in buyer's markets)\n• **Lender credits** — Accept a slightly higher rate in exchange for the lender covering costs\n• **No-closing-cost loans** — Costs are rolled into the rate; useful if you're short on cash now${extra}`;
    },
  },

  // ── Escrow ────────────────────────────────────────────────────────────────
  {
    patterns: ["escrow", "property tax escrow", "insurance escrow", "impound account"],
    response: () =>
      `Escrow accounts hold funds on your behalf to pay property taxes and homeowner's insurance when they come due.\n\n**How it works:** Your lender estimates your annual taxes and insurance, divides by 12, and adds that to your monthly mortgage payment. They hold it in the escrow account and pay the bills directly.\n\n**Why lenders require it:** It protects their collateral — if taxes go unpaid, the government can put a lien on the property. Escrow ensures that doesn't happen.\n\n**Escrow analysis:** Once a year, your lender reviews the account. If they collected too much, you get a refund. If taxes or insurance went up, your monthly payment adjusts.\n\nSome lenders allow you to waive escrow if you have significant equity (typically 20%+) — you'd then pay taxes and insurance directly when due.`,
  },

  // ── Amortization ─────────────────────────────────────────────────────────
  {
    patterns: ["amortization", "amortize", "how does a mortgage work", "how loans work", "principal vs interest"],
    response: () =>
      `Amortization describes how your payments are split between interest and principal over time — and the pattern is surprising to most people.\n\n**Early in the loan:** The majority of your payment goes to interest. On a $300k, 30-year loan at 7%, your first payment might be ~$1,996 — but only about $246 reduces your actual balance. The rest is interest.\n\n**As time goes on:** The balance slowly drops, so less interest accrues. More of each payment chips away at principal.\n\n**What this means practically:**\n• In the early years, you build equity slowly through payments alone\n• Making even one extra principal payment per year can shave years off the loan\n• A 15-year mortgage builds equity much faster than a 30-year\n• Home appreciation often builds equity faster than your payments do in the early years\n\n**The powerful insight:** If you can afford even $100–200 extra per month toward principal, the long-term interest savings can be substantial — often $40,000–80,000+ on a typical loan.`,
  },

  // ── 15 vs 30 Year ────────────────────────────────────────────────────────
  {
    patterns: ["15 year", "30 year", "loan term", "15 vs 30", "shorter term", "longer term"],
    response: (ctx) => {
      const loanAmount = ctx.homeValue > ctx.downPayment ? ctx.homeValue - ctx.downPayment : 250000;
      const r30 = 0.07 / 12, r15 = 0.065 / 12;
      const p30 = Math.round(loanAmount * (r30 * Math.pow(1+r30, 360)) / (Math.pow(1+r30, 360)-1));
      const p15 = Math.round(loanAmount * (r15 * Math.pow(1+r15, 180)) / (Math.pow(1+r15, 180)-1));
      const totalInt30 = Math.round(p30 * 360 - loanAmount);
      const totalInt15 = Math.round(p15 * 180 - loanAmount);
      return `This is one of the most impactful decisions in a mortgage — and it comes down to cash flow vs. total cost.\n\n**30-Year:**\n• Lower monthly payment\n• More cash flow flexibility each month\n• More total interest paid over time\n• Better if you plan to invest the difference\n\n**15-Year:**\n• Higher monthly payment (~30–50% more)\n• Lower interest rate (typically 0.5–0.75% less)\n• Dramatically less total interest\n• Faster equity building\n\nFor a loan around ${fmt(loanAmount)} (illustrative rates):\n• **30-year at ~7%:** ~${fmt(p30)}/mo → ${fmt(totalInt30)} total interest\n• **15-year at ~6.5%:** ~${fmt(p15)}/mo → ${fmt(totalInt15)} total interest\n\nDifference: ~${fmt(totalInt30 - totalInt15)} less interest on the 15-year.\n\nNeither is universally better — it depends on your financial goals, income stability, and what you'd do with the payment difference.`;
    },
  },

  // ── Points / Buying Down Rate ─────────────────────────────────────────────
  {
    patterns: ["points", "discount point", "buy down rate", "buying down", "mortgage points"],
    response: () =>
      `Mortgage points are upfront fees paid to reduce your interest rate — sometimes called "buying down" the rate.\n\n**One point = 1% of the loan amount.** On a $300k loan, one point costs $3,000 and typically reduces your rate by 0.25% (though this varies by lender and market conditions).\n\n**The math:** If one point costs $3,000 and saves you $50/month, your break-even is 60 months (5 years). If you stay past that, points are worth it.\n\n**Temporary buydowns:** Programs like 2-1 buydowns (rate is 2% lower in year 1, 1% lower in year 2, then goes to the full rate in year 3) are sometimes offered — often seller-paid. They help with cash flow in early years.\n\n**When points make sense:**\n• You plan to stay in the home long-term\n• You have the cash to spare at closing\n• The break-even is under 5–7 years\n\nWhen you're comparing lenders, always compare at the same rate *and* same points — that's the only apples-to-apples comparison.`,
  },

  // ── HELOC ────────────────────────────────────────────────────────────────
  {
    patterns: ["heloc", "home equity line", "line of credit", "home equity loan"],
    response: () =>
      `A HELOC (Home Equity Line of Credit) and a home equity loan are both ways to access your equity — without replacing your existing mortgage.\n\n**HELOC:**\n• Works like a credit card — draw as needed, pay back, draw again\n• Variable interest rate (usually tied to prime rate)\n• Draw period (typically 10 years) followed by repayment period\n• Interest may be tax-deductible if used for home improvements (consult a tax advisor)\n• Great for ongoing projects or uncertain costs\n\n**Home Equity Loan:**\n• Lump sum, fixed rate, fixed payments\n• Predictable — you know exactly what you owe each month\n• Better for one-time large expenses\n\n**vs. Cash-Out Refinance:**\n• Both HELOC and HE loans keep your original mortgage intact\n• If your original mortgage has a great rate, these let you tap equity without disturbing it\n• Usually lower closing costs than a full refinance\n\nCombined, your first mortgage + HELOC shouldn't exceed 80–90% of your home's value (lenders set their own limits).`,
  },

  // ── First-Time Buyer ─────────────────────────────────────────────────────
  {
    patterns: ["first time buyer", "first time home", "first home", "first-time buyer", "buying for the first time"],
    response: () =>
      `Buying your first home is one of the most meaningful financial steps you can take — and there's genuine support designed just for you.\n\n**Programs to know:**\n• **FHA loans** — 3.5% down, flexible credit (580+ for standard programs)\n• **Conventional 97** — 3% down, requires strong credit\n• **State programs** — Almost every state has first-time buyer assistance including down payment grants, below-market rates, and closing cost help. Availability and amounts vary widely.\n• **HUD-approved counseling** — Free or low-cost guidance from independent advisors\n\n**Common first-time buyer mistakes to avoid:**\n• Opening new credit accounts in the months before applying\n• Making large deposits without documentation\n• Changing jobs right before or during the process\n• Forgetting to budget for closing costs and moving expenses\n• Skipping the home inspection\n\n**The empowering truth:** The process is learnable. Most first-time buyers feel overwhelmed at the start and confident by the time they close. You're already ahead by educating yourself first.`,
  },

  // ── Property Tax ─────────────────────────────────────────────────────────
  {
    patterns: ["property tax", "real estate tax", "tax on home", "home taxes"],
    response: (ctx) => {
      const hv = ctx.homeValue;
      const avgMonthly = hv > 0 ? Math.round((hv * 0.012) / 12) : 0;
      const extra = avgMonthly > 0 ? `\n\nFor a home around ${fmt(hv)}, a rough estimate for property taxes might be ${fmt(avgMonthly)}/month — though actual rates vary significantly by location.` : "";
      return `Property taxes are set locally (county or municipality) and vary enormously — from under 0.3% of home value in some states to over 2.5% in others. The national average is around 1–1.2%.\n\n**How they're calculated:**\nTax rate × Assessed value. The assessed value may differ from market value depending on local rules.\n\n**Why they matter for your mortgage:**\nProperty taxes are typically added to your monthly payment and held in escrow. A high-tax area significantly increases your total monthly housing cost — sometimes by $300–800/month or more on a mid-priced home.\n\n**Research tip:** Look up specific property tax records for any home you're seriously considering — it's public information. This gives you the real number, not an estimate.${extra}`;
    },
  },

  // ── Homeowner's Insurance ─────────────────────────────────────────────────
  {
    patterns: ["homeowner insurance", "home insurance", "hazard insurance", "insurance cost"],
    response: () =>
      `Homeowner's insurance is required by all mortgage lenders — they need to know their collateral is protected.\n\n**Average cost:** $1,000–$2,500/year nationally, though it varies a lot by location, home size, and coverage level. That's roughly $80–200/month added to your housing costs.\n\n**What it covers:**\n• Dwelling (structure itself)\n• Personal property\n• Liability\n• Additional living expenses if you can't stay in the home\n\n**What it usually doesn't cover:**\n• Flood damage (requires separate flood insurance)\n• Earthquake damage (separate policy)\n• Normal wear and tear\n\n**Shopping tip:** Get at least 3 quotes before settling. Rates vary significantly. Bundling with your auto insurance often unlocks meaningful discounts. Your credit score can also affect homeowner's insurance premiums.`,
  },

  // ── HOA ──────────────────────────────────────────────────────────────────
  {
    patterns: ["hoa", "homeowners association", "condo fees", "association fees"],
    response: () =>
      `HOA (Homeowners Association) fees apply to many condos, townhomes, and some single-family communities. They cover shared amenities, maintenance, landscaping, and building insurance (for condos).\n\n**Range:** $100–$1,000+/month depending on community amenities and type of housing. Luxury high-rises or communities with extensive facilities run on the higher end.\n\n**Why they matter for your mortgage:**\nHOA fees are included in your debt-to-income calculation — they count as part of your monthly housing costs. A $400/month HOA fee meaningfully affects how much home you can qualify for.\n\n**Before buying in an HOA community:**\n• Review the HOA's financial health (reserve fund, pending special assessments)\n• Read the CC&Rs (rules and restrictions)\n• Understand what's covered vs. your responsibility\n• Check for any pending litigation\n\nA financially healthy HOA is an asset. An underfunded one can lead to unexpected special assessments — sometimes tens of thousands of dollars.`,
  },

  // ── Appraisal ────────────────────────────────────────────────────────────
  {
    patterns: ["appraisal", "home appraisal", "appraised value", "appraise"],
    response: () =>
      `An appraisal is a professional assessment of a home's market value, required by your lender before they'll finalize a loan.\n\n**Why lenders require it:** They want to make sure the property is worth at least what they're lending you. They won't lend more than the appraised value.\n\n**What happens if it comes in low:**\nIf the appraised value is below the purchase price, you have options:\n• Negotiate a lower price with the seller\n• Bring extra cash to cover the gap\n• Challenge the appraisal (if you have solid comparable sales data)\n• Walk away (if you have an appraisal contingency)\n\n**Cost:** Typically $300–700, paid by the buyer at closing or sometimes upfront.\n\n**What appraisers look at:** Square footage, condition, upgrades, comparable recent sales in the area, location factors.\n\nFor refinances, the appraisal determines your current equity — so an appraisal that comes in lower than expected can affect your rate or whether you qualify.`,
  },

  // ── Lock Rate ────────────────────────────────────────────────────────────
  {
    patterns: ["rate lock", "lock rate", "lock in rate", "float rate", "floating rate"],
    response: () =>
      `A rate lock is an agreement with your lender to hold your interest rate for a set period — typically 30, 45, or 60 days — while your loan processes.\n\n**Why lock?** Rates can change daily. Locking protects you if rates rise before closing.\n\n**The tradeoff:** If rates drop after you lock, you're stuck at the higher rate (unless you have a float-down option).\n\n**Float-down option:** Some lenders offer this for a fee — it lets you capture a lower rate if rates drop during the lock period. Worth asking about.\n\n**When to lock:** Most buyers lock once they have a signed purchase contract and have completed their application. Locking too early (before the contract is solid) can be risky if closing is delayed.\n\n**Extension:** If your closing is delayed past the lock expiration, you may need to extend — this usually costs 0.1–0.25% of the loan amount per week.`,
  },

  // ── Veterans / VA ────────────────────────────────────────────────────────
  {
    patterns: ["va loan", "veteran", "military", "active duty", "service member", "gi bill mortgage"],
    response: () =>
      `VA loans are one of the most powerful mortgage programs available — and they're exclusively for those who've served.\n\n**Eligibility:**\n• Veterans who served minimum active duty periods\n• Active-duty service members\n• Surviving spouses (in some cases)\n• National Guard and Reserve members (with qualifying service)\n\n**Key benefits:**\n• **No down payment required** (up to the conforming loan limit)\n• **No PMI** — ever — regardless of down payment\n• Competitive interest rates\n• Flexible credit requirements\n• Limits on closing costs\n• No prepayment penalties\n\n**VA Funding Fee:** Instead of PMI, VA loans have a one-time funding fee (typically 1.25–3.3% of loan amount, depending on down payment and whether it's your first VA loan). This can be financed into the loan. Disabled veterans are often exempt.\n\nIf you or your spouse has served, this program is almost always worth exploring — the no-PMI and no-down-payment combination is exceptional.`,
  },

  // ── USDA ─────────────────────────────────────────────────────────────────
  {
    patterns: ["usda loan", "rural loan", "usda mortgage"],
    response: () =>
      `USDA loans are a lesser-known gem — zero down payment, government-backed, and designed for eligible rural and suburban areas.\n\n**The basics:**\n• No down payment required\n• Competitive rates (government-backed)\n• Annual fee: 0.35% of loan balance (much lower than FHA MIP)\n• Income limits apply (typically 115% of area median income)\n\n**Area eligibility:** Don't assume "rural" means remote — many towns and suburbs of smaller cities qualify. You can check the USDA's eligibility map online.\n\n**Credit requirements:** Generally 640+ for streamlined processing, though lower scores may still qualify with manual underwriting.\n\n**Property requirements:** Must be your primary residence; certain property types (large acreage, income-producing properties) may not qualify.\n\nIf you're open to locations outside major urban cores, it's genuinely worth checking whether your target area qualifies — the zero-down feature is significant.`,
  },

  // ── Credit Inquiry ───────────────────────────────────────────────────────
  {
    patterns: ["credit inquiry", "hard pull", "credit check", "does applying hurt credit"],
    response: () =>
      `A hard credit inquiry (the kind that happens when you formally apply for credit) does affect your score — but for mortgages, the impact is minimized.\n\n**The key rule:** Multiple mortgage inquiries within a 14–45 day window (depending on the scoring model) are treated as a *single* inquiry by credit bureaus. This is specifically designed to encourage you to shop around for the best rate.\n\n**What actually happens to your score:** A single hard inquiry typically drops your score by 5 points or less — and the effect diminishes after about 12 months. It falls off your report entirely after 2 years.\n\n**What to avoid before applying:**\n• Applying for new credit cards, car loans, or other loans\n• Closing old accounts (can reduce your available credit)\n• Making large purchases on credit\n\n**What doesn't affect your score:**\n• Checking your own credit (soft inquiry)\n• Getting pre-qualification quotes without a hard pull\n• Lenders checking your rate based on a soft pull\n\nShopping multiple lenders in a short window is smart — don't let inquiry concerns stop you.`,
  },

  // ── Debt Payoff Before Buying ──────────────────────────────────────────
  {
    patterns: ["pay off debt first", "should i pay debt", "debt before buying", "pay down debt"],
    response: (ctx) => {
      const dti = dtiFromCtx(ctx);
      const extra = dti !== null && dti > 0.43
        ? `\n\nWith your current debt-to-income picture, reducing monthly obligations could meaningfully expand your qualifying range — even paying off one loan could shift things noticeably.`
        : dti !== null && dti < 0.36
        ? `\n\nYour debt-to-income looks manageable based on what you shared — you may not need to aggressively pay things down before buying.`
        : "";
      return `This is a genuinely nuanced question — and the honest answer is: it depends.\n\n**When paying debt first makes sense:**\n• Your DTI is above 43%, making qualification difficult\n• High-interest debt (credit cards at 20%+) is costing you more than a mortgage would save\n• Your credit score would benefit from lower utilization\n\n**When buying first can make sense:**\n• Your DTI is manageable and you qualify comfortably\n• You're in a rising-rate environment and waiting costs you more\n• Home values in your area are appreciating faster than your debt costs you\n• You have strong emergency reserves beyond the down payment\n\n**The middle path:** Pay down high-interest revolving debt specifically — it improves both your DTI and your credit score. But don't feel you need a zero-debt profile before buying a home.${extra}`;
    },
  },

  // ── What to Expect / Process ──────────────────────────────────────────────
  {
    patterns: ["home buying process", "steps to buying", "how does it work", "what to expect", "process", "how long does it take"],
    response: () =>
      `Here's the typical home-buying timeline from decision to keys:\n\n**Phase 1: Get Ready (1–6 months before)**\n• Check and improve your credit\n• Save for down payment and closing costs\n• Get pre-approved (when you're 1–3 months out)\n\n**Phase 2: Find a Home (weeks to months)**\n• Work with a buyer's agent (their commission is typically paid by the seller)\n• Make offers, negotiate terms\n• Once accepted: you're "under contract"\n\n**Phase 3: Under Contract (~30–45 days)**\n• Home inspection (hire independently)\n• Appraisal (ordered by lender)\n• Title search\n• Final loan underwriting and approval\n• Final walkthrough\n\n**Phase 4: Close**\n• Sign documents\n• Pay closing costs and down payment\n• Get keys\n\n**Total timeline:** 3–6 months from "serious decision" to closing is common, though the contract-to-close phase is typically 30–60 days. Faster is possible in some markets.`,
  },

  // ── Earnest Money ─────────────────────────────────────────────────────────
  {
    patterns: ["earnest money", "good faith deposit", "escrow deposit"],
    response: () =>
      `Earnest money is a deposit you make when your offer is accepted — it signals you're a serious buyer and gives the seller confidence.\n\n**Typical amount:** 1–3% of the purchase price, though it varies by market. In competitive markets, larger earnest money strengthens your offer.\n\n**Where it goes:** Held in escrow (by a title company, attorney, or escrow service) until closing. It's then applied to your down payment or closing costs.\n\n**Protecting your deposit:**\nContingencies in your contract protect your earnest money:\n• **Inspection contingency** — lets you back out if inspection reveals problems\n• **Financing contingency** — protects you if your loan falls through\n• **Appraisal contingency** — protects you if the home doesn't appraise\n\nIf you back out for a reason covered by a contingency, you get your earnest money back. If you back out without a valid contingency reason, the seller typically keeps it.`,
  },

  // ── Hello / Greeting ─────────────────────────────────────────────────────
  {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "how are you"],
    response: () =>
      `Hey! Good to hear from you. I'm your mortgage clarity guide — here to make the confusing stuff make sense.\n\nFeel free to ask about anything: rates, loan types, what affects your qualifying amount, how the process works, or any terms you've heard that you want explained plainly.\n\nWhat's on your mind?`,
  },

  // ── Market Predictions ───────────────────────────────────────────────────
  {
    patterns: [
      "will rates go down", "will rates drop", "will rates fall", "when will rates drop",
      "will rates go up", "will rates rise", "will rates increase",
      "where will rates be", "rate forecast", "rate prediction", "future rates",
      "should i wait for rates", "wait for lower rates",
    ],
    response: () =>
      `Rates move based on a complex mix of factors — inflation data, Federal Reserve policy, bond market demand, employment reports, and global economic conditions. No one has a reliable crystal ball on where they'll land.\n\n**What we do know historically:**\n• Rates have ranged from under 3% (2020–2021) to over 8% (late 2023) within just a few years\n• Waiting for the "perfect" rate has a real cost: every month of waiting is a month of rent paid, not equity built\n• The old saying holds up: "Marry the home, date the rate" — you can refinance later if rates improve\n\n**A useful framework instead of trying to time rates:**\n• What does your monthly payment look like at today's rate? Is it manageable?\n• How long do you plan to stay? Longer time horizons make rate timing less critical\n• What's your opportunity cost of waiting — rising prices, less inventory, continued renting?\n\nThe rate you get today can be refinanced. The home you pass on today may not come back.`,
  },
  {
    patterns: [
      "will home prices drop", "will prices fall", "housing market crash", "will market crash",
      "housing bubble", "home prices going down", "real estate crash", "prices going to drop",
      "when will housing", "housing market prediction", "home value prediction",
    ],
    response: () =>
      `Home price movements are shaped by supply and demand at the local level, interest rates, employment, population trends, and policy — and they vary enormously neighborhood by neighborhood.\n\n**What history tells us:**\n• Nationally, home values have risen over virtually every 10-year period on record\n• Short-term corrections do happen — 2008 was the most dramatic in modern history, driven by fundamentally different lending conditions than today\n• Local markets behave independently — a city with job growth and housing shortages behaves differently than one with declining population\n\n**The more useful question to ask yourself:**\n• How long do you plan to own? Longer horizons smooth out short-term volatility\n• What's your financial cushion if values dip temporarily?\n• Are you buying a home to live in, or purely as an investment? For primary residences, the "right" time has personal factors beyond just market timing\n\n**One thing that's consistent:** People who waited for a "crash" often waited years and paid more in rent than any dip would have saved them. That's not a prediction — it's just a pattern worth knowing.`,
  },
  {
    patterns: [
      "is now a good time to buy", "should i buy now", "good time to buy", "bad time to buy",
      "should i wait to buy", "should i buy or wait", "right time to buy", "buy now or later",
      "is it a buyer's market", "is it a seller's market", "market conditions",
    ],
    response: (ctx) => {
      const hasAnswers = ctx.income > 0 && ctx.creditScore;
      const personalNote = hasAnswers
        ? `\n\nBased on what you've shared — your income, credit, and what you're targeting — the financial fundamentals are what will drive whether *this moment* is the right one for *you*. Your estimate gives you a sense of the range you're working with.`
        : "";
      return `"Is now a good time to buy?" is one of the most personal questions in real estate — and the honest answer depends more on your situation than the market.\n\n**Personal factors that matter more than timing:**\n• Do you have stable income and job security?\n• Do you have enough for the down payment *and* an emergency fund?\n• Do you plan to stay in the area for at least 3–5 years?\n• Is your monthly payment comfortable, even if unexpected costs come up?\n\n**What market conditions actually tell us:**\n• High rates reduce purchasing power but often soften competition and prices\n• Low rates create competition and drive prices up — the "savings" from low rates often get absorbed into higher prices\n• These forces partially offset each other more than people expect\n\n**The question worth sitting with:**\nIf this home worked financially today, and you stayed 7+ years, would a temporary dip in value matter to you? For most people who plan to stay, the answer is no.${personalNote}`;
    },
  },
  {
    patterns: [
      "fed rate", "federal reserve", "fed meeting", "interest rate hike", "rate cut",
      "inflation mortgage", "inflation rate", "cpi mortgage",
    ],
    response: () =>
      `The Federal Reserve sets the federal funds rate — which influences short-term borrowing costs broadly — but mortgage rates are more directly tied to the 10-year Treasury bond yield.\n\n**How it connects:**\nWhen the Fed raises rates to fight inflation, bond yields often rise too, pushing mortgage rates up. When the Fed cuts, the opposite can happen — though the relationship isn't perfectly direct.\n\n**What this means practically:**\nMortgage rates have already priced in a lot of what the market *expects* the Fed to do. By the time a cut actually happens, rates may not move much — because lenders anticipated it.\n\n**The part that doesn't change regardless of the Fed:**\nYour credit score, down payment, loan type, and debt-to-income ratio are the levers you actually control. A strong profile gets you the best available rate in any environment — and that spread between a strong and weak profile can be 1–2%, which is often bigger than the Fed's moves over a year.\n\nFocus on what you can control. That's where the real leverage is.`,
  },
  {
    patterns: [
      "invest in real estate", "real estate investment", "rental property", "buy to rent",
      "appreciation", "will my home appreciate", "home as investment",
    ],
    response: () =>
      `Real estate has historically been one of the most accessible paths to wealth-building for everyday households — and understanding why helps set realistic expectations.\n\n**Why homes tend to appreciate over time:**\n• Land is finite; population generally grows\n• Inflation lifts the nominal value of hard assets\n• Demand in desirable areas tends to outpace new supply\n\n**What homeownership actually gives you financially:**\n• Forced savings through equity building with each payment\n• Leverage — you control a $400k asset with $40k down\n• Protection from rising rents\n• Potential appreciation on the full value, not just your down payment\n\n**The realistic picture:**\nHistorically, home values have appreciated roughly in line with inflation on a national average basis — around 3–4% annually over long periods, with significant variation by location. Some markets dramatically outperform; others underperform.\n\n**Primary home vs. pure investment:**\nA home you live in serves two purposes — housing and investment. Expecting it to perform like a growth stock isn't quite the right frame. Its value is in the combination: stability, equity, and appreciation over time.`,
  },

  // ── Thank You ────────────────────────────────────────────────────────────
  {
    patterns: ["thank you", "thanks", "that helps", "helpful", "that makes sense", "got it", "i understand"],
    response: () => {
      const responses = [
        "Happy to help! Mortgage stuff can feel like a different language — ask anything else that's on your mind.",
        "Glad that clicked. Feel free to keep the questions coming — the more you understand going in, the better positioned you'll be.",
        "Of course! The more clarity you have now, the more confident you'll feel about any decisions down the road. Anything else?",
        "That's what I'm here for. Keep asking — no question is too basic or too complex.",
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    },
  },

  // ── Stress / Overwhelm ───────────────────────────────────────────────────
  {
    patterns: ["overwhelmed", "confused", "don't understand", "don't know where", "too much", "complicated", "lost", "nervous", "scared", "worried"],
    response: () =>
      `That's a completely normal feeling — and it's actually a good sign that you're taking this seriously.\n\nHere's something that helps: you don't need to understand everything at once. The mortgage process has a logical sequence, and each step builds on the last.\n\nStart simple: What's the one thing that feels most confusing or most important to you right now? We can dig into just that — and go from there.\n\nYou've already made the right move by educating yourself before diving into paperwork. Most people do it the other way around.`,
  },
];

// Smart matching function
function findResponse(message: string, ctx: ResponseContext): string {
  const lower = message.toLowerCase().trim();

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      if (typeof pattern === "string") {
        if (lower.includes(pattern)) return rule.response(ctx);
      } else {
        if (pattern.test(lower)) return rule.response(ctx);
      }
    }
  }

  // Contextual fallback — warm, helpful, never pushy
  const fallbacks = [
    `Great question. Mortgage topics touch a lot of interconnected concepts — could you tell me a bit more specifically what you're wondering? For example, are you asking about how it affects your payment, your qualifying amount, or something else? The more specific you are, the more useful I can be.`,
    `I want to make sure I give you the most useful answer. Could you rephrase or expand a bit? I can go deep on almost any mortgage topic — rates, loan types, the qualification process, specific costs — just point me in the right direction.`,
    `That touches on an interesting area. The honest answer is it depends on a few factors. What's the specific part you're most curious about? I'm happy to explain any piece of it in plain terms.`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ─── Suggested Questions ─────────────────────────────────────────────────────

const suggestedQuestions = [
  "How does credit score affect my rate?",
  "What's the difference between FHA and conventional?",
  "How much will my monthly payment be?",
  "What are closing costs?",
  "Should I pay off debt before buying?",
  "What is PMI and can I avoid it?",
  "How does the home buying process work?",
  "What's the difference between 15 and 30 year loans?",
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function Chat() {
  const { chatHistory, addChatMessage, saveChatHistory, chatSaved, answers, selectedMortgageType, estimateResult } = useMortgage();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (chatHistory.length === 0) {
      addChatMessage({
        role: "ai",
        content: "Hi! I'm your mortgage clarity guide. Ask me anything — loan types, how rates work, what affects your qualifying amount, what all these terms mean. I'm here to make this understandable, not overwhelming.\n\nWhat's on your mind?",
      });
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  const buildContext = (): ResponseContext => ({
    income: answers.income,
    monthlyDebt: answers.monthlyDebt,
    creditScore: answers.creditScore,
    downPayment: answers.downPayment,
    homeValue: answers.homeValue,
    mortgageBalance: answers.mortgageBalance,
    mortgageType: selectedMortgageType,
    estimate: estimateResult,
    history: chatHistory.filter(m => m.role === "user").map(m => m.content),
  });

  const sendMessage = (text: string) => {
    if (!text.trim() || isTyping) return;
    addChatMessage({ role: "user", content: text.trim() });
    setInputValue("");
    setShowSuggestions(false);
    setIsTyping(true);

    const ctx = buildContext();
    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      const response = findResponse(text, ctx);
      setIsTyping(false);
      addChatMessage({ role: "ai", content: response });
    }, delay);
  };

  const handleTalkToLoanOfficer = () => {
    setLocation("/handoff");
  };

  return (
    <div className="h-[calc(100dvh-5rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link href="/results">
            <Button variant="ghost" size="icon" className="shrink-0" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Mortgage Guide</h1>
              <p className="text-xs text-muted-foreground">Powered by LoansBetter</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={saveChatHistory}
            disabled={chatHistory.filter(m => m.role === "user").length === 0}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 h-9 text-sm font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid="button-save-chat"
            title={chatSaved ? "Chat saved" : "Save chat so it's available on the summary page"}
          >
            {chatSaved
              ? <><BookmarkCheck className="w-3.5 h-3.5 text-primary" /> <span className="text-primary">Saved</span></>
              : <><Bookmark className="w-3.5 h-3.5" /> Save Chat</>
            }
          </button>
          <a
            href="tel:7144944172"
            data-testid="link-call-loan-officer"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 h-9 text-sm font-medium text-foreground hover:border-primary/50 hover:shadow-sm transition-all"
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            714-494-4172
          </a>
          <Button
            onClick={handleTalkToLoanOfficer}
            variant="outline"
            size="sm"
            className="hidden sm:flex"
            data-testid="button-talk-loan-officer"
          >
            Ready to Talk
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        {chatHistory.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${msg.role === "user" ? "ml-auto flex-row-reverse max-w-[80%]" : "mr-auto max-w-[85%]"}`}
          >
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted/50 border border-border mt-1">
              {msg.role === "user"
                ? <UserCircle2 className="w-5 h-5 text-muted-foreground" />
                : <Sparkles className="w-4 h-4 text-primary" />}
            </div>
            <div className={`p-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-line ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-secondary text-foreground rounded-tl-sm border border-border/50"
            }`}>
              {msg.content.split("\n").map((line, i) => {
                if (line.startsWith("**") && line.endsWith("**")) {
                  return <p key={i} className="font-semibold mt-3 mb-1 first:mt-0">{line.replace(/\*\*/g, "")}</p>;
                }
                if (line.match(/^\*\*.+\*\*/)) {
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  return (
                    <p key={i} className={line.startsWith("•") ? "ml-1 mb-1" : "mb-1"}>
                      {parts.map((part, j) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={j}>{part.replace(/\*\*/g, "")}</strong>
                          : part
                      )}
                    </p>
                  );
                }
                if (line.startsWith("• ")) {
                  return <p key={i} className="ml-2 mb-1 before:content-['•'] before:mr-2 before:text-primary/60">{line.slice(2)}</p>;
                }
                if (line === "") return <div key={i} className="h-2" />;
                return <p key={i} className="mb-1">{line}</p>;
              })}
              {msg.role === "ai" && idx > 0 && (
                <p className="text-[11px] text-muted-foreground/60 mt-3">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 mr-auto">
            <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-muted/50 border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="p-4 rounded-2xl bg-secondary rounded-tl-sm border border-border/50 flex items-center gap-1.5">
              <motion.div animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.55, delay: 0 }} className="w-2 h-2 bg-primary/40 rounded-full" />
              <motion.div animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.55, delay: 0.18 }} className="w-2 h-2 bg-primary/60 rounded-full" />
              <motion.div animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 0.55, delay: 0.36 }} className="w-2 h-2 bg-primary/80 rounded-full" />
            </div>
          </motion.div>
        )}

        {/* Suggested questions — only before user has asked anything */}
        <AnimatePresence>
          {showSuggestions && chatHistory.filter(m => m.role === "user").length === 0 && !isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="pt-2"
            >
              <p className="text-xs text-muted-foreground mb-3 ml-11">Common questions to get you started:</p>
              <div className="flex flex-wrap gap-2 ml-11">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-sm bg-card border border-border hover:border-primary/40 hover:bg-primary/5 text-foreground rounded-full px-4 py-1.5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile bar */}
      <div className="sm:hidden flex items-center justify-between gap-2 px-4 py-2 border-t border-border bg-secondary/30">
        <a href="tel:7144944172" className="flex items-center gap-1.5 text-sm text-primary font-medium">
          <Phone className="w-3.5 h-3.5" />
          714-494-4172
        </a>
        <div className="flex items-center gap-3">
          {chatHistory.filter(m => m.role === "user").length > 0 && (
            <button
              onClick={saveChatHistory}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {chatSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-primary" /> : <Bookmark className="w-3.5 h-3.5" />}
              {chatSaved ? "Saved" : "Save"}
            </button>
          )}
          <button onClick={handleTalkToLoanOfficer} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ready to Talk
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-background border-t border-border">
        <div className="max-w-4xl mx-auto relative">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(inputValue)}
            placeholder="Ask anything about mortgages..."
            className="pr-14 h-14 rounded-full bg-card shadow-sm border-border text-base"
            data-testid="input-chat"
          />
          <Button
            onClick={() => sendMessage(inputValue)}
            disabled={!inputValue.trim() || isTyping}
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-full"
            data-testid="button-send"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-3">
          Educational information only — not financial or legal advice.
        </p>
      </div>
    </div>
  );
}
