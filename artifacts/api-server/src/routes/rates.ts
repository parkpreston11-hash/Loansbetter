import { Router, type IRouter } from "express";
import { logger } from "../lib/logger";

const router: IRouter = Router();

interface RateEntry {
  rate: number;
  label: string;
  description: string;
}

interface RatesPayload {
  rates: Record<string, RateEntry>;
  updatedAt: string;
  source: string;
}

let cache: { data: RatesPayload; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 6 * 24 * 60 * 60 * 1000; // 6 days

const FALLBACK: RatesPayload = {
  rates: {
    "30-fixed": { rate: 6.75,  label: "30-Year Fixed",  description: "Stable payment for 30 years. Most popular choice." },
    "30-arm":   { rate: 6.375, label: "30-Year ARM",    description: "Lower rate for first 5 years, then adjusts with market." },
    "15-fixed": { rate: 6.125, label: "15-Year Fixed",  description: "Pay off faster and save on interest. Higher monthly payment." },
    "15-arm":   { rate: 5.875, label: "15-Year ARM",    description: "Lowest starting rate. Adjusts after initial fixed period." },
  },
  updatedAt: "fallback",
  source: "fallback",
};

async function fetchFredSeries(seriesId: string): Promise<number | null> {
  const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const text = await res.text();
  const lines = text.trim().split("\n").filter(l => !l.startsWith("DATE"));
  for (let i = lines.length - 1; i >= 0; i--) {
    const parts = lines[i].split(",");
    const val = parseFloat(parts[1]);
    if (!isNaN(val)) return val;
  }
  return null;
}

async function fetchRates(): Promise<RatesPayload> {
  const [rate30, rate15] = await Promise.all([
    fetchFredSeries("MORTGAGE30US"),
    fetchFredSeries("MORTGAGE15US"),
  ]);

  if (rate30 === null || rate15 === null) {
    logger.warn("FRED fetch returned null — using fallback rates");
    return FALLBACK;
  }

  const round = (n: number) => Math.round(n * 1000) / 1000;

  return {
    rates: {
      "30-fixed": { rate: round(rate30),          label: "30-Year Fixed",  description: "Stable payment for 30 years. Most popular choice." },
      "30-arm":   { rate: round(rate30 - 0.375),  label: "30-Year ARM",    description: "Lower rate for first 5 years, then adjusts with market." },
      "15-fixed": { rate: round(rate15),           label: "15-Year Fixed",  description: "Pay off faster and save on interest. Higher monthly payment." },
      "15-arm":   { rate: round(rate15 - 0.25),   label: "15-Year ARM",    description: "Lowest starting rate. Adjusts after initial fixed period." },
    },
    updatedAt: new Date().toISOString().slice(0, 10),
    source: "Freddie Mac Primary Mortgage Market Survey via FRED",
  };
}

router.get("/rates", async (req, res) => {
  const now = Date.now();
  if (cache && now - cache.fetchedAt < CACHE_TTL_MS) {
    res.json(cache.data);
    return;
  }
  try {
    const data = await fetchRates();
    cache = { data, fetchedAt: now };
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch FRED rates");
    res.json(cache?.data ?? FALLBACK);
  }
});

export default router;
