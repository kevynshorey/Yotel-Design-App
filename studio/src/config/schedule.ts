/** Construction programme — calibrated for Barbados conditions.
 *  Accounts for hurricane season (Jun-Nov), Crop Over, shipping lead times. */
export const CONSTRUCTION_PROGRAMME = {
  phases: [
    { name: 'Pre-construction & EIA', months: 6, type: 'preconstruction' as const },
    { name: 'Site Prep & Utilities', months: 4, type: 'construction' as const },
    { name: 'Foundation & Structure', months: 10, type: 'construction' as const },
    { name: 'MEP & Envelope', months: 8, type: 'construction' as const },
    { name: 'Interiors & FF&E', months: 6, type: 'construction' as const },
    { name: 'Landscape & Externals', months: 4, type: 'construction' as const },
    { name: 'Commissioning & Handover', months: 2, type: 'construction' as const },
  ],
  totalMonths: 40, // 6 pre + 34 construction (with overlaps = ~28 net)
  netConstructionMonths: 28,
  hurricaneSeason: { startMonth: 6, endMonth: 11 }, // June-November
  hurricaneBuffer: 8, // weeks lost per season
  cropOverWeeks: 2, // Kadooment week + preparation
  firstYearOperatingDays: 210, // July-Dec partial year

  /** Phasing options */
  phasingOptions: {
    fullConcurrent: { yotelDelay: 0, padDelay: 0, label: 'Full concurrent opening' },
    roomsFirst: { yotelDelay: 0, padDelay: 6, label: 'YOTEL first, PAD +6 months' },
    modular: { yotelDelay: 0, padDelay: 12, label: 'Phased modular delivery' },
  },
} as const
