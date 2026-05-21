import { useState, useEffect } from "react";

export interface RateEntry {
  rate: number;
  label: string;
  description: string;
}

export interface MortgageRates {
  rates: Record<string, RateEntry>;
  updatedAt: string;
  source: string;
  loading: boolean;
  error: boolean;
}

const FALLBACK_RATES: Record<string, RateEntry> = {
  "30-fixed": { rate: 6.75,  label: "30-Year Fixed",  description: "Stable payment for 30 years. Most popular choice." },
  "30-arm":   { rate: 6.375, label: "30-Year ARM",    description: "Lower rate for first 5 years, then adjusts with market." },
  "15-fixed": { rate: 6.125, label: "15-Year Fixed",  description: "Pay off faster and save on interest. Higher monthly payment." },
  "15-arm":   { rate: 5.875, label: "15-Year ARM",    description: "Lowest starting rate. Adjusts after initial fixed period." },
};

const CACHE_KEY = "lb_rates_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function loadLocalCache(): { rates: Record<string, RateEntry>; updatedAt: string; source: string } | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { data: { rates: Record<string, RateEntry>; updatedAt: string; source: string }; fetchedAt: number };
    if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function useMortgageRates(): MortgageRates {
  const cached = loadLocalCache();
  const [rates, setRates] = useState<Record<string, RateEntry>>(cached?.rates ?? FALLBACK_RATES);
  const [updatedAt, setUpdatedAt] = useState(cached?.updatedAt ?? "");
  const [source, setSource] = useState(cached?.source ?? "");
  const [loading, setLoading] = useState(!cached);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    fetch("/api/rates")
      .then(r => r.json())
      .then((data: { rates: Record<string, RateEntry>; updatedAt: string; source: string }) => {
        if (cancelled) return;
        setRates(data.rates);
        setUpdatedAt(data.updatedAt);
        setSource(data.source);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data, fetchedAt: Date.now() }));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { rates, updatedAt, source, loading, error };
}
