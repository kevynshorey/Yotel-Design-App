# Mt Brevitor Estates — Full Masterplan Integration Design

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Wire the 120-acre Mt Brevitor Estates mixed-use masterplan into the Coruscant Development App as a first-class project alongside Carlisle Bay and Abbeville, with full financial dashboard, planning compliance, dataroom, and residential estate configuration.

**Architecture:** Extend the existing multi-project system with a new `ProjectType` discriminator (`hotel` vs `estate`) that lets the engine dispatch to the correct generator/cost/revenue pipeline per project. Mt Brevitor uses a cluster-based residential model (5 clusters, 355 units, 4 phases) with non-residential revenue streams (farm, golf, solar, commercial), replacing the hotel ADR/occupancy model with sale-price/absorption-rate/GDV projections.

**Tech Stack:** TypeScript, Next.js App Router, existing engine architecture, no new dependencies.

---

## 1. The Challenge

The existing engine speaks **hotel**: rooms → keys → ADR → occupancy → GOP → NOI → cap rate.

Mt Brevitor speaks **residential estate**: clusters → units → sale prices → absorption rate → GDV → development cost → net margin → IRR.

These are fundamentally different financial models:

| Concept | Hotel (CB/Abbeville) | Estate (Mt Brevitor) |
|---|---|---|
| Revenue driver | Nightly room revenue | Unit sale proceeds |
| Key metric | RevPAR, NOI/key | GDV, net margin, IRR |
| Time model | Perpetual operations | Sell-down over 4 phases |
| Unit types | Room categories (Premium, Twin, etc.) | Housing products (1-bed condo → 5-bed estate) |
| Occupancy | Nightly occupancy % | Absorption rate (units/year) |
| Recurring revenue | Room nights × ADR × 365 | Farm, golf, solar, commercial leasing |
| Cost model | $/m² construction + FFE/key | Phase-by-phase site development |

## 2. Design: Dual-Mode Engine

### 2.1 Type System Extension

Add `ProjectType` to discriminate between hotel and estate projects:

```typescript
// engine/types.ts additions
type ProjectType = 'hotel' | 'estate'

interface ResidentialCluster {
  id: string                    // 'A' through 'E'
  label: string                 // 'Entry/Mid', 'Mid-Range', etc.
  acres: number                 // 12-14
  units: number                 // 100-110
  products: ResidentialProduct[]
  targetBuyer: string
  density: number               // units/acre
  phase: number                 // 1-4
  color: string
}

interface ResidentialProduct {
  type: string                  // 'condo', 'townhouse', 'bungalow', 'estate_home'
  beds: number
  sizeSf: [number, number]      // [min, max]
  priceBBD: number
  priceUSD: number
  units: number
}

interface NonResidentialZone {
  id: string
  label: string                 // 'Agri-Estate', 'X Range Golf', etc.
  acres: number
  capexBBD: number
  annualRevenueBBD: number      // stabilised
  phase: number
}

interface MasterplanPhase {
  number: number                // 1-4
  period: string                // 'Q3 2025-Q2 2026'
  acres: number
  units: number
  revenueBBD: number
  components: string[]          // what gets built in this phase
}
```

### 2.2 Land Allocation Config

From MBE_A3_LandAllocationStrategy:

```typescript
interface LandAllocation {
  component: string
  acres: number
  pctOfSite: number
  phase: number | number[]
}
```

10 zones: Residential (55-60ac), Farm (15-17ac), X Range (6-8ac), Community (4-5ac), Green Infra (5-6ac), Roads (10-12ac), Green Buffer (12-15ac), Commercial (3-4ac), Reserve (5-8ac), Gully (22.5ac non-buildable).

### 2.3 Financial Model — Residential Sales

Replace the hotel revenue model with:

```
Phase Revenue = Σ (units_sold × sale_price) per product type
Total GDV = BBD 247,014,500 (USD 123.5M) residential
         + BBD 2,800,000/yr X Range (stabilised)
         + BBD 2,000,000/yr Farm (stabilised)
         + solar/commercial income TBC

Development Cost = USD 114.1M (BBD 228.2M)
Net Profit = USD 46.9M (BBD 93.8M)
Net Margin = 28%
Unlevered IRR = 18-25%
```

### 2.4 Absorption Rate Model

Three scenarios from MBE_B2:
- Conservative: 60-80 units/yr → 4.5-6 year sellout
- Base Case: 100-120 units/yr → 3-3.5 year sellout
- Optimistic: 130-150 units/yr → 2.5-3 year sellout

### 2.5 Generator Behaviour

For Mt Brevitor, the massing generator is **disabled**. The design page shows:
- Estate masterplan overview (cluster map, land allocation, phasing)
- Static metrics from config (not parametrically generated)
- Phase-by-phase delivery timeline

The 3D viewer shows a site plan layout rather than building massing.

### 2.6 Planning & Compliance

From MBE_F1 risk register and MBE_F3 sustainability brief:
- EIA mandatory (Schedule 1)
- Agricultural land conversion required (17ac)
- Hurricane rating required (all structures)
- 1-in-50-year drainage design
- EDGE Advanced or LEED Silver certification target
- 2-3 MW solar array, 500 kWh-1 MWh battery
- On-site water treatment (233K gal/day demand)

### 2.7 Dataroom Structure

15-category standard structure, pre-populated by sorting existing Mount_Brevitor_Project_Pack files into the correct categories.

## 3. Files to Create/Modify

### New Files
- `config/mt-brevitor/site.ts` — 120-acre site, land allocation, boundaries
- `config/mt-brevitor/programme.ts` — 5 clusters, unit mix, phasing
- `config/mt-brevitor/financials.ts` — GDV, costs, absorption, IRR
- `config/mt-brevitor/risks.ts` — 46 risks from register (4 critical, 16 high)
- `config/mt-brevitor/sustainability.ts` — EDGE/LEED targets, energy, water

### Modified Files
- `engine/types.ts` — Add ProjectType, ResidentialCluster, etc.
- `engine/generator.ts` — Route mt-brevitor to static config (no generation)
- `engine/cost.ts` — Add estate cost model (phase-based)
- `engine/revenue.ts` — Add residential GDV model
- `engine/validator.ts` — Add mt-brevitor site/planning rules
- `store/project-store.ts` — Seed Mt Brevitor project
- `config/projects.ts` — Already done ✅

## 4. Risk Flags from Documents

4 CRITICAL items that affect implementation:
1. **F-01:** 5% interest rate unverified (below Barbados 6-9% commercial)
2. **O-02:** X Range operator terms undocumented (capex/revenue are assumptions)
3. **T-03:** Planning timeline 12-18 months vs model assumption
4. **L-01:** SPV not yet incorporated

These should display as warnings in the finance/planning dashboards.

## 5. What We Don't Build (Yet)

- Parametric residential massing generator (future — when site plans are ready)
- YOTEL component config (TBC — waiting on brand confirmation)
- Interactive 3D site viewer for 120-acre estate (future)
- Mortgage calculator UI (future)
- Construction scheduling/Gantt (future)
