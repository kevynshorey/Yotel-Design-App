import type { RoomType } from '@/engine/types'

/**
 * Mt Brevitor Estates — Programme & Financials (Studio adapter)
 * Source: estate-engine/src/config/products.ts, financials.ts
 *         MBE_B2_ResidentialConfiguration_v2.0, MBE_E2_InvestmentMemorandum_v2.0
 *
 * Mt Brevitor is a residential sales estate — NOT a hotel.
 * Unit types are mapped into the studio's RoomType shape so the generator can
 * operate on them. Interpret 'nia' as gross internal area per unit (m²),
 * 'bayWidth' as approximate unit frontage, 'pct' as target mix fraction.
 *
 * All currency in USD unless noted. BBD = USD × 2 (fixed peg since 1975).
 */

// ── Residential Unit Types (mapped to RoomType) ────────────────────────────

export const MBE_UNITS: Record<string, RoomType> = {
  Condo1Bed: {
    label: '1-Bed Condo',
    nia:      56,    // ~600 sf in m² (mid of 600-700 sf range)
    bayWidth:  6.1,  // ~20 ft frontage
    bays:      1,
    pct:       0.165, // 80/485
    color:     '#3b82f6',
  },
  Townhouse2Bed: {
    label: '2-Bed Townhouse',
    nia:      84,    // ~900 sf mid
    bayWidth:  7.0,
    bays:      1,
    pct:       0.247, // 120/485
    color:     '#6366f1',
  },
  Townhouse3Bed: {
    label: '3-Bed Townhouse',
    nia:     107,    // ~1 150 sf mid
    bayWidth:  8.5,
    bays:      2,
    pct:       0.247, // 120/485
    color:     '#8b5cf6',
  },
  Home4Bed: {
    label: '4-Bed Home',
    nia:     153,    // ~1 650 sf mid
    bayWidth: 10.5,
    bays:      2,
    pct:       0.165, // 80/485
    color:     '#a855f7',
  },
  EstateHome5Bed: {
    label: '5-Bed Estate Home',
    nia:     232,    // ~2 500 sf mid
    bayWidth: 14.0,
    bays:      3,
    pct:       0.113, // 55/485
    color:     '#d946ef',
  },
}

// ── Programme Summary ───────────────────────────────────────────────────────

export const PROGRAMME = {
  totalUnits:        485,
  clusters:          7,         // A-G
  phases:            4,         // 2025–2028+
  site_acres:        120,
  yotelTbc:          true,      // Small YOTEL in Community Hub — TBC
  groundFloorUse:    'RESIDENTIAL' as const,
  rooftop:           false,
  floorToFloor:      3.2,
  groundFloorHeight: 3.0,
  maxStoreys:        3,
} as const

// ── Financial Parameters (USD, sourced from estate-engine financials.ts) ───

export const FINANCIALS = {
  // Land
  land:                    4_625_000,   // USD total land cost (lots 1C/1D + A-K)

  // Construction cost rates (USD per m²)
  hardCostPerM2Townhouse:  1_600,       // BBD 3 200 / m² residential construction
  hardCostPerM2Home:       1_700,       // BBD 3 400 / m² — larger footprint premium
  hardCostPerM2Estate:     1_900,       // BBD 3 800 / m² — high-spec finishes

  // Soft costs and uplifts
  softCostPct:             0.138,       // 13.8% professional fees (same as Abbeville)
  contingencyPct:          0.07,        // 7%
  hurricaneSeismicUplift:  0.18,        // 18% — hurricane-rated structures
  islandFactorsPct:        0.12,        // 12% import duty + freight uplift

  // FF&E per unit (USD)
  ffePerUnit:              12_000,      // residential fit-out (lower than hotel)
  mepPerM2:                280,         // USD/m² — residential MEP

  // Revenue model (residential sales — not hotel operations)
  // Weighted average sale price across mix (USD per unit)
  avgSalePriceUSD:         293_000,     // USD weighted avg across 485 units
  avgSalePriceBBD:         586_000,     // BBD equivalent

  // GDV (from estate-engine products.ts)
  totalGDV_BBD:            338_294_000,
  totalGDV_USD:            169_147_000, // rounded: BBD/2

  // NOI proxy for studio revenue engine (annual rental income if retained)
  // Studio revenue engine expects hotel-style metrics — these provide a
  // plausible proxy: assume 5% gross yield on GDV if units were held.
  residentialYield:        0.05,
  proxyADR:                200,         // USD/night — conservative long-stay yield proxy
  proxyOccupancy:          0.85,        // long-stay occupancy proxy
  gopMargin:               0.60,        // residential sales margin proxy

  // Absorption (from estate-engine financials.ts base case)
  annualUnitsMin:          100,
  annualUnitsMax:          120,
  selloutYears:            3.5,

  // Other income
  otherIncome:             200_000,     // commercial leasing (stabilised, USD/yr)
  retailNNN:               0,           // no dedicated retail in unit count
  staffFTE:                25,          // estate management, security, maintenance
  ftePerKey:               0.05,
} as const
