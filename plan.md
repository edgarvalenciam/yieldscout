# Redito MVP — Implementation plan (stages & steps)

This document turns the **Redito Implementation Plan** and **Architecture Guide** into **stages** you can ship incrementally. Complete stages in order; within each stage, complete steps in order unless noted.

**MVP rule:** Features use **real data** (DeFiLlama, ExchangeRate API), not mocks. Demo-ready = live numbers.

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui, Vercel.

---

## How to use this file

- Check off **Done criteria** before moving on.
- **Blocked?** Fix the current step; do not skip “done” gates.
- **Out of MVP scope:** full test suite, backend DB, auth, wallet (see Architecture Guide post-MVP roadmap).

---

## Stage 0 — Project bootstrap

**Goal:** Repo runs locally with design tokens and folder skeleton.

**Estimated time:** 1–2 hours

### Steps

1. **Create Next.js app**  
   - `create-next-app` with TypeScript, Tailwind, App Router, `src/`, import alias `@/*`.  
   - **Done:** `npm run dev` opens without errors.

2. **Initialize shadcn/ui**  
   - Style: Default · Base: Neutral · CSS variables: Yes.

3. **Install UI & utilities**  
   - shadcn: `table`, `badge`, `button`, `card`, `dialog`, `input`, `tooltip`.  
   - npm: `posthog-js`, `clsx`, `tailwind-merge`.

4. **Create folder & file skeleton** (can be minimal placeholders)  
   - `src/app/` — `layout.tsx`, `page.tsx`, `api/feedback/route.ts`  
   - `src/components/` — listed in Implementation Plan (YieldTable, RiskBadge, Calculator, etc.) + `skeletons/TableSkeleton.tsx`  
   - `src/lib/` — `defillama.ts`, `exchangeRate.ts`, `riskScoring.ts`, `calculator.ts`, `constants.ts`  
   - `src/hooks/` — `useYields.ts`, `useExchangeRates.ts`, `useCurrency.ts`  
   - `src/types/index.ts`  
   - **Done:** Project builds; no need for full UI yet.

5. **Fonts in `layout.tsx`**  
   - Inter + Playfair Display as in plan; `lang="es"`, body classes.

6. **Tailwind design tokens**  
   - Extend `tailwind.config` with brand/surface/ink colors, fonts, shadows, `backgroundImage` (hero, highlight, pro, yield).

7. **Optional (Architecture Guide): PostHog**  
   - Add `posthog-js` init (e.g. provider or layout) when you have a key; can be **end of Stage 4** if preferred.

**Stage 0 done when:** `npm run dev` at `http://localhost:3000` with no errors; tokens apply (e.g. `bg-hero` works).

---

## Stage 1 — Types & constants

**Goal:** Single source of truth for TypeScript models and static benchmarks.

**Estimated time:** ~30 minutes  
**Depends on:** Stage 0

### Steps

1. **`src/types/index.ts`**  
   - Define: `Currency`, `RiskLevel`, `Pool`, `BenchmarkProduct`, `ExchangeRates`, `CalculatorResult`, `FeedbackData` (per Implementation Plan).

2. **`src/lib/constants.ts`**  
   - CETES vía API Banxico (`/api/cetes`) + `useCetes`; `LETRAS_BENCHMARK` (Letras 12M ES) con `apyAnnual` y `lastUpdated` actuales (revisar frente a Tesoro).  
   - `PROTOCOL_METADATA`, `CACHE_KEYS`, `CACHE_DURATION`, `CAPITAL_PRESETS`.

**Stage 1 done when:** `tsc` / IDE shows **no type errors** in `types` and `constants`.

---

## Stage 2 — Data layer (lib + hooks)

**Goal:** Real pools from DeFiLlama, FX rates, risk scoring, calculator; hooks with localStorage cache.

**Estimated time:** 2–3 hours  
**Depends on:** Stage 1

### Steps

1. **`src/lib/riskScoring.ts`**  
   - Implement `scorePool` (TVL, audits, yield type → `riskLevel`, `riskScore`, `riskSummary`, `riskDetailSections`).

2. **`src/lib/defillama.ts`**  
   - `fetchPools()`: filter stablecoins, allowed chains, TVL/APY bounds, transform, sort, top 50.  
   - Use `next: { revalidate: 1800 }` on fetch if used from server; client hook will call same function from browser.

3. **`src/lib/exchangeRate.ts`**  
   - `fetchExchangeRates()` with fallback rates and try/catch.

4. **`src/lib/calculator.ts`**  
   - `calculateReturn`, `formatCurrency` for MXN / EUR / USD.

5. **`src/hooks/useExchangeRates.ts`**  
   - Cache key `CACHE_KEYS.FX`, TTL `CACHE_DURATION.FX`.

6. **`src/hooks/useYields.ts`**  
   - Cache `CACHE_KEYS.YIELDS`, TTL `CACHE_DURATION.YIELDS`; background refresh when cache valid; stale flag when cache expired but used as fallback; error state.

7. **`src/hooks/useCurrency.ts`**  
   - Persist `CACHE_KEYS.CURRENCY`.

**Architecture rules:** Components **do not** call `fetch` directly for these APIs — only hooks/lib.

**Stage 2 done when:** In the browser, you can exercise `fetchPools()` (e.g. temporary test or console) and get **real** pools with `riskLevel`, `riskSummary` (tooltip breve) y `riskDetailSections` (detalle en modal); FX and calculator behave sensibly.

---

## Stage 3 — UI components

**Goal:** All presentational pieces compile and match design (Spanish copy, mobile-first).

**Estimated time:** 4–5 hours  
**Depends on:** Stage 2 (types + calculator + risk badge data)

### Steps (order flexible for parallel work, but YieldTable last among dependents)

1. **`RiskBadge.tsx`** — Tooltip + levels (low / medium / high).  
2. **`CurrencySelector.tsx`** — MXN / EUR / USD.  
3. **`TableSkeleton.tsx`** — Shimmer loading rows.  
4. **`Calculator.tsx`** — Capital input, presets, `onCapitalChange`.  
5. **`BenchmarkRow.tsx`** — CETES / Letras rows.  
6. **`FilterBar.tsx`** — All / low / low+medium counts.  
7. **`PoolDetailPanel.tsx`** — Modal: APY breakdown, TVL, risk, links.  
8. **`YieldTable.tsx`** — Benchmarks, separator, DeFi rows, filter, row click → panel.  
9. **`FeedbackWidget.tsx`** — POST `/api/feedback`.  
10. **`AlertCTA.tsx`** — Email UI + `localStorage` flag per plan.

**Stage 3 done when:** No TypeScript errors; no runtime errors on a test page that renders each component with mock/real props.

---

## Stage 4 — App shell: API route + home page + SEO

**Goal:** Single production page wired to hooks; feedback endpoint; legal disclaimer.

**Estimated time:** ~2 hours  
**Depends on:** Stages 2–3

### Steps

1. **`src/app/api/feedback/route.ts`**  
   - `POST`: parse JSON, log, optional `FEEDBACK_WEBHOOK_URL` proxy.

2. **`src/app/page.tsx`**  
   - Compose: `useYields`, `useExchangeRates`, `useCurrency`, state for `capital` and `riskFilter`, hero, `CurrencySelector`, `Calculator`, status line, error banner, `FilterBar`, `TableSkeleton` / `YieldTable`, `AlertCTA`, **disclaimer**, `FeedbackWidget`.

3. **`src/app/layout.tsx` metadata**  
   - `title`, `description`, `openGraph` as in Implementation Plan.

4. **PostHog (recommended, Architecture Guide)**  
   - Init PostHog; add captures for: `currency_changed`, `capital_entered` (range buckets only), `risk_filter_applied`, `pool_detail_opened`, `alert_cta_clicked`, `alert_email_submitted`, `feedback_opened`, `feedback_submitted`, protocol/defillama link clicks.  
   - **Optional for strict MVP:** defer to first polish pass.

**Stage 4 done when:** `localhost:3000` shows **live DeFiLlama data** in the table; currency switch updates amounts; disclaimer visible; feedback POST succeeds (200) and appears in server logs locally.

---

## Stage 5 — Deploy & QA

**Goal:** Production URL + manual QA checklist.

**Estimated time:** ~1 hour  
**Depends on:** Stage 4

### Steps

1. **Deploy to Vercel**  
   - Connect repo or `vercel` CLI; env: `FEEDBACK_WEBHOOK_URL` optional.

2. **Run QA checklist** (from Implementation Plan)  
   - [ ] ≥ 10 real pools; no infinite loading  
   - [ ] MXN / EUR / USD updates table values  
   - [ ] Risk tooltips readable Spanish  
   - [ ] CETES (MXN) and Letras (EUR) reference rows visible  
   - [ ] Calculator updates “Ganarías” / potential column  
   - [ ] Feedback submits (Vercel logs or Sheet)  
   - [ ] Alert CTA flow + localStorage  
   - [ ] Mobile ~375px, no bad horizontal scroll  
   - [ ] Disclaimer at bottom  
   - [ ] No console errors in production smoke test  

3. **Weekly ops**  
   - Verificar Letras en `LETRAS_BENCHMARK` (`constants.ts`); CETES sigue Banxico por API (token `BANXICO_TOKEN`).

**Stage 5 done when:** QA checklist passed on production URL.

---

## Dependency graph (quick reference)

```text
Stage 0 (bootstrap)
    → Stage 1 (types/constants)
        → Stage 2 (lib + hooks)
            → Stage 3 (components)
                → Stage 4 (page + API + SEO [+ PostHog])
                    → Stage 5 (deploy + QA)
```

---

## Global rules (do not skip)

| Rule | Detail |
|------|--------|
| Data | Real APIs; on failure, show error/stale/cached state — no fake APYs. |
| UI | Mobile-first (~375px). |
| Types | Strict TypeScript; avoid `any` — model API responses. |
| Backend | No extra backend; only `/api/feedback` server route. |
| Legal | Disclaimer always visible on home. |
| Language | User-facing strings Spanish; code comments Spanish per project convention. |

---

## After MVP (not in this checklist)

- Backend for emails / price history (e.g. Supabase).  
- React Query, Vitest/Testing Library.  
- Wallet / on-chain features (later phases per Architecture Guide).

---

*Derived from Redito Implementation Plan & Architecture Guide — for incremental delivery.*
