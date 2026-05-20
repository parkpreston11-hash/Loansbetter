import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Pure topic response engine (no personal context) ─────────────────────────

type Rule = { patterns: (string | RegExp)[]; response: () => string };

function matches(input: string, patterns: (string | RegExp)[]): boolean {
  const lower = input.toLowerCase();
  return patterns.some(p =>
    typeof p === "string" ? lower.includes(p) : p.test(lower)
  );
}

const rules: Rule[] = [
  {
    patterns: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "how are you", "what can you"],
    response: () =>
      `Hey! I'm here to help you understand mortgages — no jargon, no pressure, just clear answers.\n\nAsk me anything: how rates work, what affects your qualifying amount, the difference between loan types, what closing costs actually are, or anything else on your mind.\n\nWhat would you like to know?`,
  },
  {
    patterns: ["down payment", "how much to put down", "how much down", "downpayment"],
    response: () =>
      `A down payment is the upfront cash you bring to closing — separate from the loan itself.\n\n**Common down payment tiers:**\n• **3–3.5%** — FHA and some conventional programs for first-time buyers\n• **5–10%** — Common entry range; PMI typically applies\n• **20%+** — Avoids PMI entirely; often unlocks better rates\n\n**What is PMI?** Private Mortgage Insurance protects the lender if you stop paying. On a $300k loan it adds roughly $100–375/month — but it falls away once you hit 20% equity.\n\n**The tradeoff to think about:** Putting down more lowers your payment and avoids PMI, but it means less cash on hand. Keeping liquidity has real value too — many financial advisors suggest not draining your reserves for a bigger down payment.`,
  },
  {
    patterns: ["pmi", "private mortgage insurance", "mortgage insurance"],
    response: () =>
      `PMI protects the *lender* — not you — if you stop making payments. It's required on most conventional loans when your down payment is under 20%.\n\n**What it costs:** Typically 0.2–1.5% of the loan amount per year, depending on your credit score and loan size. On a $300k loan, expect $50–375/month.\n\n**How to eliminate it:**\n• Automatically cancels at 78% LTV (Loan-to-Value)\n• You can request cancellation at 80% LTV\n• Refinancing once you have 20% equity is another route\n\n**FHA vs. conventional PMI:** FHA loans have their own version called MIP (Mortgage Insurance Premium), which works differently — it often stays for the life of the loan unless you refinanced into conventional once you hit 20% equity.`,
  },
  {
    patterns: ["credit score", "fico", "credit history", "credit report", "bad credit", "good credit", "improve credit"],
    response: () =>
      `Credit score is one of the biggest levers you control heading into a mortgage. Even a 20-point difference can mean thousands over the life of a loan.\n\n**Rate tiers by score:**\n• 760+: Best available rates\n• 720–759: Very competitive\n• 680–719: Good, minor premium\n• 640–679: Fair, moderate premium\n• 580–639: Limited options, higher rates\n• Below 580: FHA/specialty programs (down to 500 with 10% down)\n\n**What actually moves the needle:**\n• Paying every bill on time (biggest factor — 35% of your score)\n• Keeping credit card balances below 30% of limits\n• Not opening new accounts right before applying\n• Disputing any errors on your report (free at annualcreditreport.com)\n\nA few focused months can meaningfully improve your score and your rate.`,
  },
  {
    patterns: ["interest rate", "mortgage rate", "what rate", "current rate", "apr", "annual percentage", "rate today", "rate right now", "how are rates"],
    response: () =>
      `Mortgage rates change daily — sometimes multiple times a day — based on bond markets, inflation data, and Federal Reserve signals.\n\n**Fixed vs. Adjustable:**\n• **Fixed rate** — locked for the loan's life (15 or 30 years). Predictable, great for stability.\n• **ARM (Adjustable)** — starts lower, adjusts after an initial period (5/1, 7/1, 10/1). Can make sense if you plan to sell or refinance within that window.\n\n**What affects YOUR rate:**\n• Credit score (biggest lever you control)\n• Loan-to-value ratio (more down = better rate)\n• Loan type (conventional, FHA, VA, jumbo)\n• Loan term (15-year rates run lower than 30-year)\n• Market conditions\n\n**APR vs. Rate:** The rate is your interest cost. APR includes fees and closing costs — it's a truer picture of total loan cost. Always compare APR when shopping lenders.`,
  },
  {
    patterns: ["loan type", "fha loan", "va loan", "usda", "conventional loan", "jumbo", "types of mortgage", "what kind of loan", "loan options"],
    response: () =>
      `Here's a plain-English breakdown of the main mortgage types:\n\n**Conventional** — Not government-backed. Requires 620+ credit, 3% minimum down. Best rates for strong profiles.\n\n**FHA** — Government-backed. Credit scores down to 500 with 10% down; 3.5% down with 580+. More flexible on debt-to-income. Requires mortgage insurance (MIP) for the life of the loan in most cases.\n\n**VA** — For veterans, active-duty service members, and eligible spouses. No down payment, no PMI, competitive rates. One of the best programs available if you qualify.\n\n**USDA** — For rural and some suburban areas. No down payment required. Income limits apply. Worth checking if you're open to those areas.\n\n**Jumbo** — For loan amounts above conforming limits (~$766,550 in most areas, higher in expensive markets). Stricter requirements, often 10–20% down.`,
  },
  {
    patterns: ["refinance", "refi", "refinancing", "should i refinance", "when to refinance"],
    response: () =>
      `Refinancing replaces your existing mortgage with a new one — usually to get a lower rate, reduce your payment, shorten your term, or switch from ARM to fixed.\n\n**The break-even calculation:**\nDivide closing costs by monthly savings. If you'd save $250/month and closing costs are $5,000, break-even is 20 months. Stay past that, and refinancing pays off.\n\n**When refinancing makes sense:**\n• Rates are at least 0.5–1% below your current rate\n• You plan to stay past the break-even point\n• Your credit has improved significantly\n• You want to switch from 30-year to 15-year\n\n**When to be cautious:**\n• You're close to paying off the loan\n• Resetting to a 30-year adds more interest over time\n• Closing costs consume your savings too quickly`,
  },
  {
    patterns: ["cash out", "cash-out", "home equity", "tap equity", "borrow against home", "access equity"],
    response: () =>
      `A cash-out refinance lets you replace your mortgage with a larger one and pocket the difference as cash — a way to access equity you've built up.\n\n**How it works:**\nIf your home is worth $400k and you owe $200k, you have $200k in equity. Lenders typically let you access up to 80% of your home's value ($320k), meaning you could take out up to $120k cash.\n\n**Common uses:** Home renovations, debt consolidation, large expenses.\n\n**The tradeoff:** Your mortgage balance rises, your payment likely increases, and your home is collateral.\n\n**Alternatives:**\n• **HELOC** — A line of credit against your equity; more flexible, often lower closing costs\n• **Home equity loan** — A second loan, fixed rate, doesn't touch your first mortgage`,
  },
  {
    patterns: ["reverse mortgage", "hecm", "home equity conversion"],
    response: () =>
      `A reverse mortgage lets homeowners 62+ convert part of their home equity into cash — without monthly mortgage payments.\n\n**How it works:**\nInstead of you paying the lender, the lender makes payments to you (or provides a lump sum or credit line). The balance grows over time and is repaid when you sell, move out, or pass away.\n\n**Key requirements:**\n• Must be 62 or older\n• Home must be your primary residence\n• Must maintain the home and pay property taxes and insurance\n\n**Payment options:** Lump sum, monthly payments, line of credit, or a combination.\n\n**The HECM** (Home Equity Conversion Mortgage) is the most common type and is federally insured. It comes with required counseling — actually a useful step to understand all the details.`,
  },
  {
    patterns: ["dti", "debt to income", "debt-to-income", "how much debt", "qualify with debt"],
    response: () =>
      `DTI (Debt-to-Income ratio) compares your monthly debt obligations to your gross monthly income — it's one of the core numbers lenders look at.\n\n**Two types:**\n• **Front-end DTI** — Just housing costs ÷ monthly income. Lenders prefer under 28–31%.\n• **Back-end DTI** — All monthly debts (housing + car + student loans + cards) ÷ monthly income. Most programs prefer under 43%.\n\n**By loan type:**\n• Conventional: Typically up to 43–45%\n• FHA: Up to 50% with strong compensating factors\n• VA: Flexible, 41% is a benchmark but not a hard cap\n\n**How to improve it:**\nPay down or pay off existing debts before applying. Even eliminating one car payment can meaningfully shift your qualifying range.`,
  },
  {
    patterns: ["afford", "how much can i", "how much house", "what can i qualify", "how much mortgage", "buying power", "qualify for"],
    response: () =>
      `Affordability is driven by four main levers:\n\n1. **Income** — Lenders typically allow housing costs up to 28–31% of your gross monthly income\n2. **Existing debt** — Every dollar of monthly debt reduces your qualifying power\n3. **Down payment** — Reduces the loan amount you need\n4. **Credit score** — Determines the rate you get, which directly impacts monthly payments\n\n**Quick rule of thumb:** Most people can qualify for roughly 3–5× their gross annual income in home price, depending on their debt load and down payment.\n\n**What the lender actually looks at:**\n• Can you comfortably make the monthly payment?\n• Is your DTI within their guidelines?\n• Do you have reserves after closing?\n\nThe best way to get a real number is to go through the questionnaire — it'll generate a personalized estimate based on your actual figures.`,
  },
  {
    patterns: ["monthly payment", "how much per month", "what will i pay monthly", "mortgage payment", "payment calculation", "piti"],
    response: () =>
      `Your monthly mortgage payment has several components — often called PITI:\n\n• **P**rincipal — Reduces your actual loan balance\n• **I**nterest — The lender's cost\n• **T**axes — Property taxes, collected monthly and held in escrow\n• **I**nsurance — Homeowner's insurance, also escrowed\n\nPlus potentially PMI (if down payment < 20%) and HOA fees.\n\n**Quick example:**\nFor a $300k loan at 7% on a 30-year:\n• Principal & interest: ~$1,996/month\n• Add property taxes (~$250–400/month)\n• Add insurance (~$100–150/month)\n• **Total: often $2,300–2,550/month all in**\n\nFor a 15-year loan at the same amount: principal & interest jumps to ~$2,696/month, but you pay dramatically less total interest.`,
  },
  {
    patterns: ["pre-approval", "preapproval", "pre approval", "pre-qualify", "prequalify", "get approved", "mortgage approval"],
    response: () =>
      `Pre-approval and pre-qualification are different — and that difference matters when making offers.\n\n**Pre-qualification:** A quick, informal estimate based on self-reported info. No hard credit pull. Good for early exploration.\n\n**Pre-approval:** A formal process — the lender reviews your actual documents, credit, and assets. Results in a letter stating how much you're approved to borrow. Sellers take this seriously.\n\n**What you'll need for pre-approval:**\n• W-2s and tax returns (last 2 years)\n• Recent pay stubs\n• Bank statements (last 2–3 months)\n• Photo ID\n• Authorization for a hard credit pull\n\n**Smart move:** Get pre-approvals from 2–3 lenders within a 14–45 day window. Multiple mortgage inquiries in that window count as a single inquiry on your credit — it won't hurt your score.`,
  },
  {
    patterns: ["closing cost", "closing fees", "how much to close", "what are closing costs"],
    response: () =>
      `Closing costs are the fees to finalize a mortgage — beyond the down payment. They typically run **2–5% of the loan amount**.\n\n**Common costs:**\n• Loan origination fee (0.5–1%)\n• Appraisal ($300–700)\n• Title search and insurance ($1,000–2,500)\n• Attorney or escrow fees (varies by state)\n• Prepaid items: insurance, property tax escrow, prepaid interest\n• Credit report fee, recording fees\n\n**Ways to reduce them:**\n• **Seller concessions** — Ask the seller to cover some costs\n• **Lender credits** — Accept a slightly higher rate in exchange for the lender covering costs\n• **No-closing-cost loans** — Costs rolled into the rate; useful if you're short on cash now`,
  },
  {
    patterns: ["escrow", "property tax escrow", "insurance escrow", "impound account"],
    response: () =>
      `Escrow accounts hold funds on your behalf to pay property taxes and homeowner's insurance when they come due.\n\n**How it works:** Your lender estimates your annual taxes and insurance, divides by 12, and adds that to your monthly mortgage payment. They hold it and pay the bills directly.\n\n**Why lenders require it:** It protects their collateral — if taxes go unpaid, the government can lien the property.\n\n**Annual escrow analysis:** Once a year, your lender reviews the account. If they collected too much, you get a refund. If taxes or insurance rose, your payment adjusts.\n\nSome lenders allow you to waive escrow if you have significant equity (typically 20%+) — you'd then pay taxes and insurance directly when due.`,
  },
  {
    patterns: ["amortization", "amortize", "how does a mortgage work", "how loans work", "principal vs interest"],
    response: () =>
      `Amortization describes how your payments split between interest and principal over time — and the pattern surprises most people.\n\n**Early in the loan:** Most of your payment goes to interest. On a $300k, 30-year loan at 7%, your first payment might be ~$1,996 — but only about $246 reduces your actual balance. The rest is interest.\n\n**Over time:** The balance slowly drops, so less interest accrues. More of each payment chips away at principal.\n\n**What this means:**\n• Early years = slow equity building through payments\n• Even $100–200 extra/month toward principal can shave years off the loan and save tens of thousands in interest\n• A 15-year mortgage builds equity dramatically faster\n• Home appreciation often builds equity faster than payments do in early years`,
  },
  {
    patterns: ["15 year", "30 year", "loan term", "15 vs 30", "shorter term", "longer term"],
    response: () => {
      const loan = 300000;
      const r30 = 0.07 / 12, r15 = 0.065 / 12;
      const p30 = Math.round(loan * (r30 * Math.pow(1 + r30, 360)) / (Math.pow(1 + r30, 360) - 1));
      const p15 = Math.round(loan * (r15 * Math.pow(1 + r15, 180)) / (Math.pow(1 + r15, 180) - 1));
      const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
      const int30 = Math.round(p30 * 360 - loan);
      const int15 = Math.round(p15 * 180 - loan);
      return `This is one of the most impactful decisions in a mortgage — cash flow vs. total cost.\n\n**30-Year:**\n• Lower monthly payment\n• More flexibility each month\n• More total interest paid over time\n\n**15-Year:**\n• Higher monthly payment (~30–50% more)\n• Lower interest rate (typically 0.5–0.75% less)\n• Dramatically less total interest\n• Faster equity building\n\n**On a $300k loan (illustrative):**\n• 30-year at ~7%: ~${fmt(p30)}/mo → ${fmt(int30)} total interest\n• 15-year at ~6.5%: ~${fmt(p15)}/mo → ${fmt(int15)} total interest\n\nDifference: ~${fmt(int30 - int15)} less interest on the 15-year.\n\nNeither is universally better. It depends on your goals, income stability, and what you'd do with the payment difference.`;
    },
  },
  {
    patterns: ["points", "discount point", "buy down rate", "buying down", "mortgage points"],
    response: () =>
      `Mortgage points are upfront fees paid to lower your interest rate — sometimes called "buying down" the rate.\n\n**One point = 1% of the loan amount.** On a $300k loan, one point costs $3,000 and typically reduces your rate by ~0.25%.\n\n**The math:** If one point costs $3,000 and saves you $50/month, break-even is 60 months (5 years). If you stay longer, points pay off.\n\n**Temporary buydowns:** Programs like 2-1 buydowns (rate 2% lower year 1, 1% lower year 2, then full rate after) are sometimes seller-paid — good for early cash flow.\n\n**When comparing lenders:** Always compare at the same rate *and* same points — that's the only true apples-to-apples comparison.`,
  },
  {
    patterns: ["heloc", "home equity line", "line of credit", "home equity loan"],
    response: () =>
      `A HELOC and home equity loan both let you tap equity without replacing your existing mortgage.\n\n**HELOC (Home Equity Line of Credit):**\n• Works like a credit card — draw, repay, draw again\n• Variable rate (usually tied to prime)\n• Draw period (~10 years) then repayment period\n• Great for ongoing or uncertain costs\n\n**Home Equity Loan:**\n• Lump sum, fixed rate, fixed payments\n• Predictable — you know exactly what you owe\n• Better for one-time large expenses\n\n**vs. Cash-Out Refinance:**\nBoth keep your original mortgage intact. If your first mortgage has a great rate, these let you access equity without disturbing it — usually at lower closing costs than a full refi.\n\nTypically, your first mortgage + HELOC combined shouldn't exceed 80–90% of your home's value.`,
  },
  {
    patterns: ["first time buyer", "first time home", "first home", "first-time", "buying for the first time"],
    response: () =>
      `There's genuine support designed for first-time buyers — you're not navigating this alone.\n\n**Programs to know:**\n• **FHA loans** — 3.5% down, flexible credit (580+ standard)\n• **Conventional 97** — 3% down, requires strong credit\n• **State programs** — Almost every state has first-time buyer assistance: down payment grants, below-market rates, closing cost help. Amounts and eligibility vary widely.\n• **HUD-approved counseling** — Free or low-cost independent guidance\n\n**Common mistakes to avoid:**\n• Opening new credit before closing\n• Making large undocumented deposits\n• Changing jobs during the process\n• Skipping the home inspection\n• Forgetting to budget for closing costs\n\n**The honest truth:** The process feels overwhelming at the start and much more manageable by the time you close. You're already ahead by learning before you leap.`,
  },
  {
    patterns: ["property tax", "real estate tax", "tax on home", "home taxes"],
    response: () =>
      `Property taxes are set locally and vary enormously — from under 0.3% of home value in some states to over 2.5% in others. The national average is around 1–1.2%.\n\n**Why they matter for your mortgage:**\nTaxes are typically added to your monthly payment and held in escrow. A high-tax area can add $300–800+/month to your total housing cost on a mid-priced home.\n\n**Research tip:** Look up specific property tax records for any home you're seriously considering — it's public information. This gives you the real number, not a rough estimate.\n\n**What affects the amount:** Tax rate × assessed value. The assessed value can differ from market value depending on local rules, and some areas have caps on how fast assessed values can rise.`,
  },
  {
    patterns: ["homeowner insurance", "home insurance", "hazard insurance", "insurance cost"],
    response: () =>
      `Homeowner's insurance is required by all mortgage lenders — they need to know their collateral is protected.\n\n**Average cost:** $1,000–$2,500/year nationally (~$80–200/month). Varies by location, home size, and coverage.\n\n**What it covers:** Structure, personal property, liability, additional living expenses.\n\n**What it usually doesn't cover:** Flood damage, earthquake damage, normal wear and tear (all require separate policies).\n\n**Shopping tip:** Get at least 3 quotes. Rates vary significantly. Bundling with auto insurance often unlocks meaningful discounts. Your credit score can also affect premiums.`,
  },
  {
    patterns: ["hoa", "homeowners association", "condo fees", "association fees"],
    response: () =>
      `HOA fees apply to many condos, townhomes, and some single-family communities. They cover shared amenities, maintenance, landscaping, and building insurance for condos.\n\n**Range:** $100–$1,000+/month depending on community and amenities.\n\n**Why they matter for mortgages:**\nHOA fees count in your debt-to-income calculation — a $400/month HOA meaningfully affects how much home you can qualify for.\n\n**Before buying in an HOA:**\n• Review the HOA's financials (reserve fund, pending special assessments)\n• Read the CC&Rs (rules and restrictions)\n• Understand what's covered vs. your responsibility\n• Check for pending litigation\n\nA healthy, well-funded HOA is an asset. An underfunded one can lead to large unexpected special assessments.`,
  },
  {
    patterns: ["appraisal", "appraised value", "appraise"],
    response: () =>
      `An appraisal is a professional assessment of a home's market value, required by your lender before finalizing a loan.\n\n**Why lenders require it:** They won't lend more than the appraised value — they want to confirm the property is worth what they're lending you.\n\n**If it comes in low:**\n• Negotiate a lower price with the seller\n• Bring extra cash to cover the gap\n• Challenge the appraisal (with solid comparable sales data)\n• Walk away if you have an appraisal contingency\n\n**Cost:** Typically $300–700, usually paid by the buyer.\n\n**For refinances:** The appraisal determines your current equity — which affects your rate and whether you qualify for certain programs.`,
  },
  {
    patterns: ["rate lock", "lock rate", "lock in rate", "float rate", "floating rate"],
    response: () =>
      `A rate lock is an agreement with your lender to hold your interest rate for a set period — typically 30, 45, or 60 days — while your loan processes.\n\n**Why lock?** Rates can move daily. Locking protects you if rates rise before closing.\n\n**The tradeoff:** If rates drop after you lock, you're stuck at the higher rate — unless you have a float-down option.\n\n**Float-down option:** Lets you capture a lower rate if rates fall during the lock period. Available from some lenders for a fee — worth asking about.\n\n**When to lock:** Most buyers lock once they have a signed purchase contract and have completed their application.\n\n**Extensions:** If closing is delayed past the lock expiration, extending usually costs 0.1–0.25% of the loan amount per week.`,
  },
  {
    patterns: ["va loan", "veteran", "military", "active duty", "service member", "gi bill mortgage"],
    response: () =>
      `VA loans are one of the most powerful mortgage programs available — exclusively for those who've served.\n\n**Eligibility:** Veterans, active-duty service members, eligible surviving spouses, and qualifying National Guard/Reserve members.\n\n**Key benefits:**\n• No down payment required\n• No PMI — ever\n• Competitive interest rates\n• Flexible credit requirements\n• Limits on closing costs\n\n**VA Funding Fee:** Instead of PMI, there's a one-time funding fee (typically 1.25–3.3% of loan amount). Can be financed into the loan. Disabled veterans are often exempt.\n\nIf you or your spouse has served, this is almost always worth exploring — the no-PMI and no-down-payment combination is exceptional.`,
  },
  {
    patterns: ["usda loan", "rural loan", "usda mortgage"],
    response: () =>
      `USDA loans are a lesser-known gem — zero down payment, government-backed, designed for eligible rural and suburban areas.\n\n**Key features:**\n• No down payment required\n• Competitive rates\n• Annual fee: 0.35% of loan balance (much lower than FHA)\n• Income limits apply (~115% of area median income)\n\n**Area eligibility:** "Rural" doesn't mean remote — many towns and suburbs of smaller cities qualify. The USDA eligibility map is worth checking online.\n\n**Credit:** Generally 640+ for streamlined processing; lower scores may qualify with manual underwriting.\n\nIf you're open to locations outside major urban cores, it's worth seeing if your target area qualifies.`,
  },
  {
    patterns: ["credit inquiry", "hard pull", "credit check", "does applying hurt credit", "shopping lenders"],
    response: () =>
      `A hard credit inquiry does affect your score — but for mortgages, the impact is deliberately minimized.\n\n**The key rule:** Multiple mortgage inquiries within a 14–45 day window count as a *single* inquiry — credit bureaus specifically designed this to encourage you to shop rates.\n\n**Impact on your score:** Typically 5 points or less. Diminishes after 12 months. Falls off entirely after 2 years.\n\n**What to avoid before applying:**\n• Applying for new credit cards or car loans\n• Closing old accounts\n• Making large purchases on credit\n\n**Bottom line:** Shop multiple lenders in a short window. Don't let inquiry concerns stop you — rate comparison is one of the highest-value moves you can make.`,
  },
  {
    patterns: ["pay off debt first", "should i pay debt", "debt before buying", "pay down debt"],
    response: () =>
      `This is genuinely nuanced — and the honest answer is: it depends.\n\n**When paying debt first makes sense:**\n• Your DTI is above 43%, making qualification difficult\n• High-interest debt (credit cards at 20%+) costs more than a mortgage would save\n• Your credit score would benefit from lower utilization\n\n**When buying first can make sense:**\n• Your DTI is manageable and you qualify comfortably\n• You're in a rising-rate environment and waiting costs you more\n• Home values are appreciating faster than your debt costs you\n• You have strong emergency reserves beyond the down payment\n\n**The middle path:** Pay down high-interest revolving debt specifically — it improves both DTI and credit score. But you don't need a zero-debt profile before buying.`,
  },
  {
    patterns: ["home buying process", "steps to buying", "how does it work", "what to expect", "process", "how long does it take", "timeline"],
    response: () =>
      `Here's the typical home-buying journey from decision to keys:\n\n**Phase 1: Get Ready (1–6 months before)**\n• Check and improve your credit\n• Save for down payment and closing costs\n• Get pre-approved (when you're 1–3 months out)\n\n**Phase 2: Find a Home (weeks to months)**\n• Work with a buyer's agent (commission typically paid by seller)\n• Make offers, negotiate, get under contract\n\n**Phase 3: Under Contract (~30–45 days)**\n• Home inspection (hire independently)\n• Appraisal (ordered by your lender)\n• Title search and final underwriting\n• Final walkthrough\n\n**Phase 4: Close**\n• Sign documents, pay closing costs and down payment\n• Get keys\n\n**Total timeline:** 3–6 months from serious decision to closing is common.`,
  },
  {
    patterns: ["earnest money", "good faith deposit", "escrow deposit"],
    response: () =>
      `Earnest money is a deposit you make when your offer is accepted — it signals you're a serious buyer.\n\n**Typical amount:** 1–3% of the purchase price. In competitive markets, more strengthens your offer.\n\n**Where it goes:** Held in escrow until closing, then applied to your down payment or closing costs.\n\n**Protecting your deposit — contingencies:**\n• **Inspection contingency** — back out if inspection reveals problems\n• **Financing contingency** — protects you if your loan falls through\n• **Appraisal contingency** — protects you if the home doesn't appraise\n\nBack out with a valid contingency → you get your money back. Back out without one → seller typically keeps it.`,
  },
  {
    patterns: [
      "will rates go down", "will rates drop", "rate forecast", "rate prediction", "future rates",
      "should i wait for rates", "when will rates",
    ],
    response: () =>
      `No one reliably predicts where rates are heading — not economists, not banks, not the Federal Reserve itself.\n\n**What history shows:**\n• Rates ranged from under 3% (2020–2021) to over 8% (late 2023) in just a few years\n• Waiting for the "perfect" rate has a real cost: every month is rent paid, not equity built\n• "Marry the home, date the rate" holds up — you can refinance later if rates drop\n\n**A more useful framework:**\n• Is the monthly payment at today's rate manageable for you?\n• How long do you plan to stay? Longer time horizons make rate timing less critical.\n• What's your opportunity cost of waiting?\n\nThe rate you get today can always be refinanced. A home you pass on may not come back.`,
  },
  {
    patterns: [
      "will home prices drop", "housing market crash", "housing bubble", "home prices going down",
      "real estate crash", "housing market prediction",
    ],
    response: () =>
      `Home price movements depend on local supply and demand, interest rates, employment, and population trends — and they vary enormously by neighborhood.\n\n**What history consistently shows:**\n• Nationally, home values have risen over virtually every 10-year period on record\n• Short-term corrections happen — 2008 was the most dramatic in modern history, driven by fundamentally different lending conditions than today\n• Local markets are independent — high-growth cities behave nothing like declining-population areas\n\n**The questions worth sitting with:**\n• How long do you plan to own? Longer holds smooth out short-term volatility.\n• Are you buying to live in it, or purely as an investment?\n• What's your financial cushion if values dip temporarily?\n\nThese are the real inputs to your decision — not a prediction that no one can reliably make.`,
  },
  {
    patterns: [
      "is now a good time to buy", "should i buy now", "good time to buy", "bad time to buy",
      "should i wait to buy", "buy now or later", "market conditions",
    ],
    response: () =>
      `"Is now a good time to buy?" is one of the most personal questions in real estate. The honest answer depends more on your situation than the market.\n\n**Personal factors that matter more than timing:**\n• Do you have stable income and job security?\n• Do you have enough for the down payment *and* an emergency fund?\n• Do you plan to stay in the area for at least 3–5 years?\n• Is the monthly payment comfortable, even with unexpected costs?\n\n**An often-overlooked dynamic:**\n• High rates reduce purchasing power but soften competition and prices\n• Low rates increase competition and drive prices up\n• These forces partially offset each other more than people expect\n\n**The question worth sitting with:**\nIf this home worked financially today and you stayed 7+ years, would a temporary dip in value matter? For most people who plan to stay, the answer is no.`,
  },
  {
    patterns: ["fed rate", "federal reserve", "inflation mortgage", "inflation rate", "cpi mortgage"],
    response: () =>
      `The Federal Reserve sets the federal funds rate — which influences short-term borrowing broadly — but mortgage rates are more directly tied to the 10-year Treasury bond yield.\n\n**How it connects:**\nWhen the Fed raises rates to fight inflation, bond yields often rise too, pushing mortgage rates up. When the Fed cuts, rates can ease — though the relationship isn't perfectly direct.\n\n**What this means practically:**\nMortgage rates already price in what the market *expects* the Fed to do. By the time a cut actually happens, rates may not move much — lenders anticipated it.\n\n**The part you control:**\nYour credit score, down payment, and loan type are the levers that matter. The spread between a strong and weak profile can be 1–2% — often bigger than the Fed's moves over a year.`,
  },
  {
    patterns: ["invest", "rental property", "buy to rent", "appreciation", "home as investment"],
    response: () =>
      `Real estate as an investment has genuine merit — but it helps to think through it clearly.\n\n**As a primary residence:**\n• You build equity through appreciation and payments\n• No capital gains tax on the first $250k ($500k married) of profit when you sell (if it's been your primary residence 2 of the last 5 years)\n• Forced savings — your monthly payment builds ownership\n• But: real returns after inflation, maintenance, taxes, and transaction costs are more modest than the headline price appreciation suggests\n\n**As a rental property:**\n• Rental income + appreciation potential\n• Mortgage interest and expenses are deductible\n• Requires active management or a property manager\n• Carries real risk: vacancies, maintenance surprises, difficult tenants\n\n**Honest perspective:** Real estate can be an excellent long-term wealth-builder, but it's not a get-rich-quick vehicle. The best approach usually starts with owning where you live.`,
  },
];

function getResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const rule of rules) {
    if (matches(lower, rule.patterns)) return rule.response();
  }
  return `Great question. Here's what I can tell you about that in the mortgage context:\n\nMortgages touch a lot of ground — rates, loan types, qualifying factors, costs, timelines, and more. If you can give me a bit more context about what you're trying to understand, I can give you a more targeted answer.\n\nOr try asking about any of these: down payments, interest rates, loan types (FHA, VA, conventional), how credit score affects your rate, closing costs, refinancing, or the home buying process. I'm here for all of it.`;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
      return <p key={i} className="font-semibold text-foreground mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      }
      return <span key={j}>{part}</span>;
    });
    if (line.startsWith("• ")) {
      return <li key={i} className="ml-4 list-none flex gap-2"><span className="text-primary mt-0.5 shrink-0">•</span><span>{rendered.map((r, j) => j === 0 ? <span key={j}>{(r as React.ReactElement).props.children?.slice(2)}</span> : r)}</span></li>;
    }
    if (line === "") return <div key={i} className="h-2" />;
    return <p key={i}>{rendered}</p>;
  });
}

// ─── Topic categories ─────────────────────────────────────────────────────────

const TOPICS = [
  { label: "Basics", chips: ["How does a mortgage work?", "What is amortization?", "What is PMI?", "What is escrow?"] },
  { label: "Rates", chips: ["How do interest rates work?", "What is APR vs rate?", "What are mortgage points?", "What is a rate lock?"] },
  { label: "Loan Types", chips: ["What is an FHA loan?", "What is a VA loan?", "15 vs 30 year — which is better?", "What is a USDA loan?"] },
  { label: "Qualifying", chips: ["What is debt-to-income ratio?", "How does credit score affect my rate?", "What do I need for pre-approval?", "How much can I afford?"] },
  { label: "Costs", chips: ["What are closing costs?", "How much should I put down?", "What are property taxes?", "What does homeowner's insurance cost?"] },
  { label: "Process", chips: ["What is the home buying process?", "What is earnest money?", "What is a home appraisal?", "What is an HOA?"] },
];

interface Message { role: "ai" | "user"; text: string }

export default function Learn() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Ask me anything about mortgages — rates, loan types, qualifying, costs, the process. I'm here to make the confusing stuff make sense.\n\nWhat would you like to understand?" },
  ]);
  const [input, setInput] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = { role: "user", text: trimmed };
    const aiMsg: Message = { role: "ai", text: getResponse(trimmed) };
    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput("");
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-[calc(100dvh-5rem)] bg-background flex flex-col">
      {/* Page header */}
      <div className="border-b border-border bg-secondary/30 px-4 py-5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-xl text-foreground leading-tight">Mortgage Learning Center</h1>
            <p className="text-muted-foreground text-sm">Ask any question about mortgages — no account, no pressure.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4">
        {/* Topic chips */}
        <div className="py-4 border-b border-border/50">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {TOPICS.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(i)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {TOPICS[activeCategory].chips.map(chip => (
              <button
                key={chip}
                onClick={() => send(chip)}
                className="text-sm bg-background border border-border rounded-full px-4 py-1.5 text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 py-6 space-y-5 overflow-y-auto">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 text-sm leading-relaxed space-y-0.5 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "bg-secondary text-foreground rounded-tl-sm"
                  }`}
                >
                  {msg.role === "ai"
                    ? renderMarkdown(msg.text)
                    : <p>{msg.text}</p>
                  }
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="py-4 border-t border-border">
          <div className="flex gap-3 items-center bg-secondary/60 rounded-full border border-border px-5 py-2 focus-within:border-primary transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send(input)}
              placeholder="Ask anything about mortgages..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              size="icon"
              className="w-8 h-8 rounded-full shrink-0"
              disabled={!input.trim()}
              onClick={() => send(input)}
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Educational information only — not financial or legal advice.
          </p>
        </div>
      </div>
    </div>
  );
}
