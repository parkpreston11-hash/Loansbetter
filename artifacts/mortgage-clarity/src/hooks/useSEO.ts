import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

const BASE_TITLE = "LoansBetter | NMLS# 2641696";

export function useSEO({ title, description, canonical }: SEOProps) {
  useEffect(() => {
    document.title = `${title} | ${BASE_TITLE}`;

    if (description) {
      let el = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (el) el.setAttribute("content", description);
    }

    if (canonical) {
      let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!el) {
        el = document.createElement("link");
        el.rel = "canonical";
        document.head.appendChild(el);
      }
      el.href = canonical;
    }
  }, [title, description, canonical]);
}
