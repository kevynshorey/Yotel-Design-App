# Mt Brevitor Estates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the 120-acre Mt Brevitor Estates masterplan into the app with full config, financial model, store seeding, and 15-category dataroom.

**Architecture:** Config-driven estate project using real data from 8 project documents. Engine routes to static estate config rather than parametric generation. Financial model uses residential GDV/absorption instead of hotel ADR/occupancy.

**Tech Stack:** TypeScript, Next.js, existing engine architecture.

---

### Task 1: Extended Type System

**Files:**
- Modify: `studio/src/engine/types.ts`

- [ ] Step 1: Add ProjectType, ResidentialCluster, ResidentialProduct, NonResidentialZone, MasterplanPhase, LandAllocation, AbsorptionScenario types
- [ ] Step 2: Verify types compile with `npx tsc --noEmit`

### Task 2: Site Config (from Site_Reconciliation.md + Plot Plan)

**Files:**
- Create: `studio/src/config/mt-brevitor/site.ts`

- [ ] Step 1: Define SITE constant with 120ac total, 110ac developable, land allocation zones
- [ ] Step 2: Define LAND_ALLOCATION array (10 zones with acreage and phases)
- [ ] Step 3: Define PHASING array (4 phases with periods, acres, components)

### Task 3: Programme Config (from MBE_B2 + MBE_A3)

**Files:**
- Create: `studio/src/config/mt-brevitor/programme.ts`

- [ ] Step 1: Define CLUSTERS (A-E) with units, products, pricing, target buyers
- [ ] Step 2: Define UNIT_MIX with all 5 product types (condo through estate home)
- [ ] Step 3: Define PROGRAMME summary (355 units, 5 clusters, 4 phases)

### Task 4: Financial Config (from MBE_E2 + MBE_B2)

**Files:**
- Create: `studio/src/config/mt-brevitor/financials.ts`

- [ ] Step 1: Define FINANCIALS with GDV, costs, margins, IRR targets
- [ ] Step 2: Define ABSORPTION_SCENARIOS (conservative/base/optimistic)
- [ ] Step 3: Define PHASE_REVENUE (BBD revenue per phase)
- [ ] Step 4: Define NON_RESIDENTIAL_REVENUE (farm, golf, solar, commercial)
- [ ] Step 5: Define COST_BREAKDOWN (USD 114.1M total development cost)
- [ ] Step 6: Define RISK_FLAGS (4 critical items for dashboard display)

### Task 5: Sustainability Config (from MBE_F3)

**Files:**
- Create: `studio/src/config/mt-brevitor/sustainability.ts`

- [ ] Step 1: Define SUSTAINABILITY targets (EDGE Advanced, solar, water, carbon)

### Task 6: Engine Wiring

**Files:**
- Modify: `studio/src/engine/generator.ts`
- Modify: `studio/src/engine/cost.ts`
- Modify: `studio/src/engine/revenue.ts`
- Modify: `studio/src/engine/validator.ts`

- [ ] Step 1: Add mt-brevitor route in getProjectConfig() returning static estate config
- [ ] Step 2: Add estate cost model branch in estimateCost()
- [ ] Step 3: Add residential GDV model branch in projectRevenue()
- [ ] Step 4: Add mt-brevitor planning rules in validator

### Task 7: Seed Project in Store

**Files:**
- Modify: `studio/src/store/project-store.ts`

- [ ] Step 1: Add createMtBrevitorProject() factory function
- [ ] Step 2: Add to DEFAULT_PROJECTS array

### Task 8: Dataroom Structure + File Sort

**Files:**
- Create: 15 dataroom category folders
- Move/copy: existing project pack files into correct categories

- [ ] Step 1: Create 15-category folder structure in PROJECT DATAROOM
- [ ] Step 2: Sort existing Mount_Brevitor_Project_Pack files into categories

### Task 9: Save Project Memory

- [ ] Step 1: Write memory file for Mt Brevitor Estates project
