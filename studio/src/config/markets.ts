/** Market profiles for Caribbean and UK hotel development.
 *  Costs, regulations, and environmental factors per jurisdiction.
 *  Barbados is the primary market; others are expansion targets. */

// ── Types ──────────────────────────────────────────────────────────────

export interface MarketProfile {
  id: string
  name: string
  region: 'Caribbean' | 'Europe'
  currency: string
  currencySymbol: string

  // Tax & import
  taxRate: number             // VAT/sales tax rate (0-1)
  dutyRate: number            // average import duty on construction materials (0-1)

  // Labour & cost
  labourRate: number          // USD/hour — skilled construction worker
  materialMultiplier: number  // cost multiplier vs US mainland baseline (1.0 = parity)

  // Regulatory
  planningAuthority: string
  buildingCode: string
  maxHeight: number           // metres
  maxCoverage: number         // site coverage ratio (0-1)

  // Environmental
  seismicZone: 'none' | 'low' | 'moderate' | 'high' | 'very_high'
  hurricaneCategory: 0 | 1 | 2 | 3 | 4 | 5
  climateZoneAshrae: string
  peakSunHours: number        // annual average for PV sizing

  // Construction logistics
  shippingPortDistance: number // km from nearest container port to typical site
  importLeadWeeks: number     // typical lead time for imported materials
}

// ── Market Data ────────────────────────────────────────────────────────

const BARBADOS: MarketProfile = {
  id: 'BB',
  name: 'Barbados',
  region: 'Caribbean',
  currency: 'BBD',
  currencySymbol: 'BDS$',
  taxRate: 0.175,             // 17.5% VAT
  dutyRate: 0.12,             // 12% average (some duty-free under TDA)
  labourRate: 18,             // USD/hr
  materialMultiplier: 1.35,   // 35% premium vs US mainland
  planningAuthority: 'Town & Country Development Planning Office',
  buildingCode: 'Barbados National Building Code (CUBiC-aligned)',
  maxHeight: 22.0,
  maxCoverage: 0.50,
  seismicZone: 'moderate',
  hurricaneCategory: 4,
  climateZoneAshrae: '1A',
  peakSunHours: 1650,
  shippingPortDistance: 5,
  importLeadWeeks: 8,
}

const JAMAICA: MarketProfile = {
  id: 'JM',
  name: 'Jamaica',
  region: 'Caribbean',
  currency: 'JMD',
  currencySymbol: 'J$',
  taxRate: 0.15,              // 15% GCT
  dutyRate: 0.15,             // 15% average CET
  labourRate: 12,
  materialMultiplier: 1.30,
  planningAuthority: 'National Environment and Planning Agency (NEPA)',
  buildingCode: 'Jamaica National Building Code (JNBC)',
  maxHeight: 30.0,
  maxCoverage: 0.60,
  seismicZone: 'high',
  hurricaneCategory: 4,
  climateZoneAshrae: '1A',
  peakSunHours: 1600,
  shippingPortDistance: 15,
  importLeadWeeks: 6,
}

const TRINIDAD: MarketProfile = {
  id: 'TT',
  name: 'Trinidad & Tobago',
  region: 'Caribbean',
  currency: 'TTD',
  currencySymbol: 'TT$',
  taxRate: 0.125,             // 12.5% VAT
  dutyRate: 0.10,
  labourRate: 15,
  materialMultiplier: 1.20,   // local steel and concrete production
  planningAuthority: 'Town & Country Planning Division',
  buildingCode: 'Trinidad & Tobago Building Code (ODPM)',
  maxHeight: 45.0,
  maxCoverage: 0.65,
  seismicZone: 'moderate',
  hurricaneCategory: 1,       // south of hurricane belt
  climateZoneAshrae: '1A',
  peakSunHours: 1550,
  shippingPortDistance: 10,
  importLeadWeeks: 4,
}

const BAHAMAS: MarketProfile = {
  id: 'BS',
  name: 'Bahamas',
  region: 'Caribbean',
  currency: 'BSD',
  currencySymbol: 'B$',
  taxRate: 0.10,              // 10% VAT
  dutyRate: 0.20,             // 20% — higher import costs
  labourRate: 22,
  materialMultiplier: 1.55,   // significant import premium
  planningAuthority: 'Department of Physical Planning',
  buildingCode: 'Bahamas Building Code (2003, updated 2018)',
  maxHeight: 25.0,
  maxCoverage: 0.45,
  seismicZone: 'low',
  hurricaneCategory: 5,       // direct hurricane exposure
  climateZoneAshrae: '1A',
  peakSunHours: 1700,
  shippingPortDistance: 8,
  importLeadWeeks: 6,
}

const CAYMAN: MarketProfile = {
  id: 'KY',
  name: 'Cayman Islands',
  region: 'Caribbean',
  currency: 'KYD',
  currencySymbol: 'CI$',
  taxRate: 0.0,               // no income tax, no VAT
  dutyRate: 0.22,             // 22% import duty (revenue mechanism)
  labourRate: 28,             // highest in Caribbean
  materialMultiplier: 1.65,
  planningAuthority: 'Central Planning Authority (CPA)',
  buildingCode: 'Cayman Islands Building Code (2017)',
  maxHeight: 40.0,            // 10-storey limit in Seven Mile Beach
  maxCoverage: 0.50,
  seismicZone: 'low',
  hurricaneCategory: 5,
  climateZoneAshrae: '1A',
  peakSunHours: 1680,
  shippingPortDistance: 3,
  importLeadWeeks: 8,
}

const UK: MarketProfile = {
  id: 'GB',
  name: 'United Kingdom',
  region: 'Europe',
  currency: 'GBP',
  currencySymbol: '\u00A3',
  taxRate: 0.20,              // 20% VAT
  dutyRate: 0.0,              // no import duty on most construction materials (post-Brexit tariff schedule)
  labourRate: 32,
  materialMultiplier: 1.10,   // close to mainland baseline
  planningAuthority: 'Local Planning Authority (LPA)',
  buildingCode: 'Building Regulations 2010 (England & Wales)',
  maxHeight: 0,               // varies by LPA — no national limit
  maxCoverage: 0,             // varies by LPA
  seismicZone: 'none',
  hurricaneCategory: 0,
  climateZoneAshrae: '4A',
  peakSunHours: 950,
  shippingPortDistance: 0,
  importLeadWeeks: 2,
}

// ── Exports ────────────────────────────────────────────────────────────

export const MARKETS: MarketProfile[] = [
  BARBADOS,
  JAMAICA,
  TRINIDAD,
  BAHAMAS,
  CAYMAN,
  UK,
]

/** Look up a market by its ISO-style ID (e.g. 'BB', 'JM'). */
export function getMarket(id: string): MarketProfile | undefined {
  return MARKETS.find((m) => m.id === id.toUpperCase())
}

/** Get the default market (Barbados). */
export function getDefaultMarket(): MarketProfile {
  return BARBADOS
}

/** Calculate total cost multiplier for a market vs US baseline.
 *  Combines material premium, duty, and labour differential. */
export function getMarketCostMultiplier(market: MarketProfile): number {
  const labourComponent = 0.40  // labour is ~40% of construction cost
  const materialComponent = 0.60

  const labourFactor = market.labourRate / 35  // US baseline ~$35/hr
  const materialFactor = market.materialMultiplier * (1 + market.dutyRate)

  return labourComponent * labourFactor + materialComponent * materialFactor
}
