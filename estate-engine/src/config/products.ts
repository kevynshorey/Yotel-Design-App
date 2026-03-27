/**
 * Mt Brevitor Estates — Residential Products
 * Pricing validated against Vuemont (Mount Brevitor, St Peter) March 2026
 *
 * Vuemont comps:
 *   2-bed apt  1,135sf → USD $295K (BBD $590K) = BBD $520/sf
 *   2-bed villa 1,122sf → USD $350K (BBD $700K) = BBD $624/sf
 *   3-bed villa 1,218-1,560sf → USD $355K (BBD $710K) = BBD $456-582/sf
 *   5-bed plantation (Mt Brevitor) → USD $2.5M (BBD $5M)
 */

import type { ResidentialProduct } from '../types'

export const PRODUCTS: ResidentialProduct[] = [
  {
    id: 'condo_1bed',
    label: '1-Bed Condo',
    beds: 1,
    baths: 1,
    sizeSfMin: 600,
    sizeSfMax: 700,
    priceBBD: 370_000,           // REVISED DOWN from MBE 440K — must be below Vuemont 2-bed $/sf
    priceUSD: 185_000,
    units: 80,
    priceBBDPerSf: 569,          // 370K / 650sf mid
    color: '#3b82f6',
  },
  {
    id: 'townhouse_2bed',
    label: '2-Bed Townhouse',
    beds: 2,
    baths: 2,
    sizeSfMin: 850,
    sizeSfMax: 950,
    priceBBD: 560_000,           // VALIDATED — aligns with Vuemont 2-bed villa BBD 624/sf
    priceUSD: 280_000,
    units: 120,                   // INCREASED: 95 (A+B) + 25 (Cluster F)
    priceBBDPerSf: 622,          // 560K / 900sf mid
    color: '#6366f1',
  },
  {
    id: 'townhouse_3bed',
    label: '3-Bed Townhouse',
    beds: 3,
    baths: 2.5,
    sizeSfMin: 1100,
    sizeSfMax: 1200,
    priceBBD: 623_700,           // VALIDATED — within Vuemont 3-bed range BBD 456-582/sf
    priceUSD: 311_850,
    units: 120,                  // INCREASED: 85 (B+C) + 25 (Cluster F) + 10 (Cluster G)
    priceBBDPerSf: 542,          // 623.7K / 1150sf mid
    color: '#8b5cf6',
  },
  {
    id: 'home_4bed',
    label: '4-Bed Bungalow/Home',
    beds: 4,
    baths: 3,
    sizeSfMin: 1500,
    sizeSfMax: 1800,
    priceBBD: 880_000,           // KEPT — reasonable premium over 3-bed, no direct Vuemont comp
    priceUSD: 440_000,
    units: 80,                   // INCREASED: 55 (C+D) + 25 (Cluster G)
    priceBBDPerSf: 533,          // 880K / 1650sf mid
    color: '#a855f7',
  },
  {
    id: 'estate_5bed',
    label: '5-Bed Estate Home',
    beds: 5,
    baths: 4,
    sizeSfMin: 2200,
    sizeSfMax: 2800,
    priceBBD: 1_750_000,         // INCREASED from MBE 1.43M — Mt Brevitor Plantation 5-bed at $2.5M USD validates higher
    priceUSD: 875_000,
    units: 55,                   // INCREASED: 40 (Cluster E) + 15 (Cluster G)
    priceBBDPerSf: 700,          // 1.75M / 2500sf mid
    color: '#d946ef',
  },
]

// ── Computed Summary ───────────────────────────────────────────────────────

export const TOTAL_UNITS = PRODUCTS.reduce((sum, p) => sum + p.units, 0)  // 485 (435 + 50 Cluster G)

export const TOTAL_GDV_BBD = PRODUCTS.reduce((sum, p) => sum + (p.priceBBD * p.units), 0)
// = (370K×80) + (560K×120) + (623.7K×120) + (880K×80) + (1.75M×55)
// = 29.6M + 67.2M + 74.844M + 70.4M + 96.25M = BBD 338,294,000

export const TOTAL_GDV_USD = Math.round(TOTAL_GDV_BBD / 2)
// = USD 141,903,500
