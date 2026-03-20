# Financial Conflict Resolution | YOTEL + YOTELPAD Barbados
# VERSION: NEW (Reconciled from Excel Model Audit)

**Classification:** Confidential | PE-Grade Financial Reconciliation
**Prepared for:** Coruscant Developments Limited
**Date:** 2026-03-20
**Status:** RECONCILED — All conflicts resolved to source-backed values

---

## Purpose

This document resolves every known financial conflict between CLAUDE.md seed values, config.py (previous builder), the three Excel financial models, and the Magnus proposal documents. Every resolved value cites its source. Where the source is unreliable, it is flagged.

**Rule:** No number enters the application build unless it appears in this document with a resolution status of RESOLVED or FLAGGED-USE-WITH-CAVEAT.

---

## 1. Land Price

| Source | Value | Date |
|--------|-------|------|
| CLAUDE.md | $2,250,000 | Unknown origin |
| config.py | $3,500,000 | Previous builder |
| Financial Model v2 (Assumptions sheet) | $3,500,000 | Active model |
| Magnus Treasury Waterfall | $3,500,000 | Fund model |

**RESOLVED: $3,500,000**
**Source:** Financial Model v2, Assumptions sheet — confirmed in 3 of 4 sources.
**Note:** The $2.25M in CLAUDE.md has no supporting document. It may be an earlier indicative price or negotiation target. The active financial model uses $3.5M. **CLAUDE.md must be updated.**

---

## 2. Total Development Cost (TDC)

| Source | Value |
|--------|-------|
| config.py | $32,500,000 |
| Magnus Treasury Waterfall | $32,500,000 |
| Magnus Waterfall Explainer PDF | $32,500,000 |
| Magnus Capital Proposal Review PDF | $32,500,000 |
| Financial Model v2 | $32,500,000 (implied from capital stack) |
| CLAUDE.md | $33,320,000 |

**RESOLVED: $32,500,000**
**Source:** Consistent across all Excel models and proposal documents.
**Note:** The $33.32M in CLAUDE.md (= $256,311 × 130 keys) appears to be a derived calculation that doesn't match any source model. **CLAUDE.md must be updated.**

---

## 3. YOTEL ADR (Average Daily Rate)

| Source | Value | Context |
|--------|-------|---------|
| config.py | $195 | Single stabilized figure |
| CLAUDE.md | $245–$300 | "Range depending on season/positioning" |
| Financial Model v2 — Year 1 | $155 | Ramp-up |
| Financial Model v2 — Year 2 | $175 | Ramp-up |
| Financial Model v2 — Year 3 (stabilized) | $195 | Matches config.py |
| Financial Model v2 — Year 5 | $211 | With 4% annual growth |
| Financial Model v2 — Year 10 | $257 | With 4% annual growth |

**RESOLVED: $195 stabilized (Year 3), ramping from $155 (Year 1)**
**Source:** Financial Model v2, 10-Year Proforma sheet.
**Note:** The $245-$300 range in CLAUDE.md does NOT appear in any financial model. The Year 10 blended ADR reaches ~$257 with 4% annual growth, which touches the low end of the CLAUDE.md range — but that is Year 10, not stabilized. **CLAUDE.md must be updated to reflect the ramp schedule.**

**BCQS Market Context:** Caribbean average ADR is $437.02 (2025 BCQS report). At $195 stabilized, the YOTEL positioning is well below Caribbean luxury average, consistent with the YOTEL brand's accessible premium positioning. However, this also means there may be upside if the resort performs at a higher tier.

---

## 4. YOTELPAD ADR

| Source | Value |
|--------|-------|
| config.py | $270 (stabilized) |
| Financial Model v2 | Not separately broken out — blended with YOTEL |

**RESOLVED: $270 stabilized (from config.py)**
**Status:** FLAGGED-USE-WITH-CAVEAT — The proforma does not separate YOTEL from YOTELPAD revenue streams. The $270 figure comes only from config.py. Need separate YOTELPAD revenue line in the updated model.

---

## 5. Stabilized Occupancy

| Source | Value | Context |
|--------|-------|---------|
| CLAUDE.md | 72% | Seed parameter |
| config.py | 78% (YOTEL), 75% (YOTELPAD) | Stabilized |
| Financial Model v2 — Year 1 | 55% | Ramp-up |
| Financial Model v2 — Year 2 | 72% | Ramp-up — matches CLAUDE.md |
| Financial Model v2 — Year 3 | 78% | Stabilized — matches config.py |
| Financial Model v2 — Year 5 | 79% | Mature |
| Financial Model v2 — Year 10 | 80% | Mature |

**RESOLVED: 78% stabilized (Year 3), ramping from 55% (Year 1)**
**Source:** Financial Model v2, 10-Year Proforma sheet.
**Note:** Both numbers exist in the same model at different years. 72% is Year 2 (ramp), 78% is Year 3+ (stabilized). There is no conflict — CLAUDE.md was citing the Year 2 ramp figure as if it were stabilized. **CLAUDE.md must be updated.**

**BCQS Market Context:** Caribbean hotel average occupancy is 66.6% (2025 BCQS report). The 78% stabilized assumption is 11.4 points ABOVE the Caribbean average. This is achievable for a well-positioned branded resort but requires market validation via STR comp study.

---

## 6. GOP Margin

| Source | Value | Context |
|--------|-------|---------|
| config.py | 44% | Single figure |
| CLAUDE.md | 48% | Seed parameter |
| Financial Model v2 — Year 1 | ~17% | Ramp-up (low occupancy, full fixed costs) |
| Financial Model v2 — Year 3 | ~20% | Below either cited figure |
| Financial Model v2 — Year 5 | ~22.5% | Still below either cited figure |
| Financial Model v2 — Year 10 | ~25% | Never reaches 44% or 48% |

**RESOLVED: 17%–25% per the actual 10-year proforma**
**Status:** CRITICAL FLAG — Neither the 44% (config.py) nor 48% (CLAUDE.md) appears anywhere in the Financial Model v2 proforma. The actual model shows GOP margins of 17-25% across 10 years.

**Possible Explanations:**
1. The 44%/48% may refer to a different, earlier model version that is not in the dataroom
2. The 44%/48% may refer to "departmental GOP" (rooms department only) before undistributed expenses
3. The proforma may have structural issues — YOTEL fees of 15.5% of revenue (7.5% management + 5% royalty + 3% tech) are extremely aggressive and suppress margins

**Action Required:** This is the single biggest discrepancy in the entire financial model suite. A 44% GOP on ~$7M revenue = ~$3.08M NOI. A 22% GOP on ~$7M revenue = ~$1.54M NOI. This $1.5M difference changes the entire investment case — debt serviceability, exit valuation, and returns. **Must determine which GOP is correct and rebuild the proforma accordingly.**

---

## 7. Year 5 NOI and Exit Valuation

| Source | Value | Context |
|--------|-------|---------|
| Financial Model v2 — Year 5 proforma NOI | $1,542,165 | From 10-Year Proforma sheet |
| Magnus Treasury Waterfall — "Stabilised Year 5 NOI" | $3,864,055 | Used for exit valuation |
| Implied exit at 8.5% cap rate on $3.86M | ~$45,459,471 | Magnus exit assumption |
| Implied exit at 8.5% cap rate on $1.54M | ~$18,143,118 | Using actual proforma NOI |

**RESOLVED: $1,542,165 per the actual proforma**
**Status:** CRITICAL FLAG — There is a $2.32M gap between the actual proforma Year 5 NOI and the "stabilised NOI" used in the Magnus waterfall for exit valuation. The Magnus waterfall exit of ~$45.5M is based on a NOI figure ($3.86M) that is 2.5x what the proforma produces.

If the exit is recalculated using the actual proforma NOI:
- Gross exit value: ~$18.1M (vs ~$45.5M)
- After senior debt ($20M): **negative equity**
- The project would not return capital to equity holders under this scenario

**This discrepancy MUST be resolved before any investor presentation.** Either:
1. The proforma understates revenue/overstates costs (fix the proforma), OR
2. The Magnus exit NOI is fabricated/aspirational (fix the waterfall), OR
3. There is a separate "stabilised" model with different assumptions that produces $3.86M NOI (find and audit it)

---

## 8. DSCR (Debt Service Coverage Ratio)

| Source | Value | Context |
|--------|-------|---------|
| CLAUDE.md | 1.7x – 2.3x | Seed parameter |
| Financial Model v2 — Year 1 | 0.21x | Deep below 1.0x |
| Financial Model v2 — Year 3 | 0.55x | Still below 1.0x |
| Financial Model v2 — Year 5 | 0.83x | Still below 1.0x |
| Financial Model v2 — Year 9 | ~1.05x | First year above 1.0x |
| Financial Model v2 — Year 10 | ~1.10x | Marginal coverage |

**Annual debt service (I/O on $20M at 6.5%):** $1,300,000 + mezz service

**RESOLVED: 0.21x → 1.10x over 10 years per actual proforma**
**Status:** CRITICAL FLAG — The DSCR does not reach 1.0x until Year 9. The 1.7x-2.3x in CLAUDE.md is not achievable under the current proforma. No commercial lender will fund a project with sub-1.0x DSCR through Year 8.

**This is directly linked to the GOP margin issue (#6).** If actual GOP were 44% instead of 22%, NOI would approximately double, and DSCR would be in the 1.5x-2.0x range from Year 3 onwards.

---

## 9. Build Schedule

| Source | Duration |
|--------|----------|
| Magnus Treasury Waterfall (Excel) | 16 months (Aug 2026 – Nov 2027) |
| Magnus Waterfall Explainer (PDF) | 24 months |
| Funding Projections (Excel) | Pre-dev Apr–Jul 2026, construction start implied Aug 2026 |

**RESOLVED: 16 months per the Excel model (controls)**
**Note:** The PDF explainer uses 24 months for illustration, producing higher APR payments ($723K vs $490K). The Excel model — which is the actual calculation — uses 16 months. This is a significant difference for treasury economics.

---

## 10. Pre-Development Funding Gap

| Item | Amount |
|------|--------|
| Total pre-dev budget (Funding Projections) | $703,450 |
| Magnus facility requested | $400,000 |
| **Shortfall** | **$303,450** |
| Monthly burn rate | ~$175,863 |
| Runway at $400K facility | ~2.3 months |
| Runway needed | 4 months |

**Status:** FLAGGED — The pre-dev budget exceeds the requested facility by $303K. Either the budget must be trimmed or additional pre-dev funding sourced. Key cost drivers: Architect retainer ($137K), EIA screening ($30K), Coruscant management ($60K at $15K/mo).

---

## 11. Construction Cost Validation (BCQS Benchmark)

| Metric | Project Assumption | BCQS 2025 Benchmark | Status |
|--------|-------------------|---------------------|--------|
| Hard cost per sf | ~$200/sf (implied) | $240–$400/sf (Three Star) | **BELOW RANGE** |
| Hard cost per sf | ~$200/sf (implied) | $380–$620/sf (Five Star) | **FAR BELOW** |
| Escalation rate | Not applied | 4.31% (Barbados 2024-2025) | **NOT APPLIED** |
| Import duty | Not broken out | 20% on building materials | **NOT BROKEN OUT** |
| General conditions | Not broken out | 10% | **NOT BROKEN OUT** |

**Status:** FLAGGED — The implied hard cost per sf is below even the Three Star hotel range in the BCQS 2025 report. The modular prefab approach may explain some cost savings, but $200/sf for a Caribbean resort hotel requires contractor validation. Escalation of 4.31% and 20% import duty must be explicitly modeled.

---

## 12. YOTEL Fee Structure Impact

| Fee | Rate | Annual on $7M Revenue | 10-Year Total |
|-----|------|----------------------|---------------|
| Management Fee | 7.5% | $525,000 | $5,250,000 |
| Royalty Fee | 5.0% | $350,000 | $3,500,000 |
| Technology Fee | 3.0% | $210,000 | $2,100,000 |
| **Total** | **15.5%** | **$1,085,000** | **$10,850,000** |

**Status:** FLAGGED — 15.5% total fee load is extremely aggressive. Industry standard for a franchise/management deal is typically 8-12% (3-5% royalty + 3-5% management + 1-2% tech/marketing). This 15.5% fee structure is a major contributor to the suppressed GOP margins. **This must be negotiated with YOTEL before the model is finalized.**

---

## Summary: Reconciled Seed Values for Application Build

| Parameter | Old CLAUDE.md Value | **Reconciled Value** | Source |
|-----------|--------------------|--------------------|--------|
| Land price | $2,250,000 | **$3,500,000** | Financial Model v2 |
| TDC | $33,320,000 | **$32,500,000** | All models consistent |
| Cost per key | $256,311 | **$250,000** | $32.5M / 130 keys |
| YOTEL ADR (stabilized, Year 3) | $245–$300 | **$195** | Financial Model v2 |
| YOTEL ADR (Year 1 ramp) | — | **$155** | Financial Model v2 |
| YOTEL ADR (Year 5) | — | **$211** | Financial Model v2, 4% growth |
| ADR annual growth | — | **4%** | Financial Model v2 |
| YOTELPAD ADR (stabilized) | — | **$270** | config.py (only source) |
| Occupancy (stabilized, Year 3) | 72% | **78%** | Financial Model v2 |
| Occupancy (Year 1 ramp) | — | **55%** | Financial Model v2 |
| GOP margin | 48% | **⚠️ 17–25% per proforma** | Financial Model v2 — CRITICAL: see #6 |
| Year 5 NOI | — | **⚠️ $1,542,165 per proforma** | Financial Model v2 — CRITICAL: see #7 |
| Exit NOI (Magnus) | — | **⚠️ $3,864,055 — UNRECONCILED** | Magnus Waterfall — CRITICAL: see #7 |
| DSCR range | 1.7x–2.3x | **⚠️ 0.21x–1.10x per proforma** | Financial Model v2 — CRITICAL: see #8 |
| Annual debt service | $1,916,000 | **$1,300,000** (senior I/O only) | $20M × 6.5% |
| Build schedule | — | **16 months** | Magnus Treasury Waterfall (Excel) |
| Total keys | 130 | **130** | Consistent |
| Senior debt | $20,000,000 | **$20,000,000** | Consistent |
| Mezz debt | $5,000,000 | **$5,000,000** | Consistent |
| LP equity | $7,000,000 | **$7,000,000** | Consistent |
| GP co-invest | $500,000 | **$500,000** | Consistent |
| YOTEL total fees | — | **15.5% of revenue** | Financial Model v2 |

---

## Critical Actions Before Application Build

1. **RESOLVE GOP DISCREPANCY** — Determine whether actual GOP is 22% (proforma) or 44% (config.py). This single variable changes the entire investment case. Find the source of the 44%/48% figure.

2. **RESOLVE EXIT NOI** — The $2.3M gap between proforma NOI ($1.54M) and Magnus exit NOI ($3.86M) must be explained. If proforma is correct, the project has negative equity at exit under current capital structure.

3. **NEGOTIATE YOTEL FEES** — 15.5% total fee load suppresses GOP to levels that make the project unfinanceable. Industry standard is 8-12%.

4. **VALIDATE CONSTRUCTION COSTS** — $200/sf implied hard cost is below BCQS Three Star benchmark ($240-$400/sf). Get contractor pricing.

5. **COMMISSION MARKET STUDY** — ADR of $195 and occupancy of 78% need STR comp set validation. Caribbean average occupancy is 66.6%.

---

*This document supersedes all prior conflict flags in FINANCIAL_REVIEW.md. Update as new information is received. Every change must cite source and date.*
