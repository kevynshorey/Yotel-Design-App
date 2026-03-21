/** v2 Equalized Financial Parameters — from sponsor directives.
 *  DO NOT use config.py FINANCIALS (stale: TDC=$32.5M, GOP=44%). */
export const FINANCIALS = {
  tdc: 40_000_000,
  hardCostPerSf: 350,
  totalGia_sf: 75_000,
  land: 3_500_000,

  // Revenue (Year 3 stabilised)
  yotelAdr: 195,
  yotelpadAdr: 270,
  yotelOcc: 0.78,
  yotelpadOcc: 0.75,

  // Operating
  gopMargin: 0.51,
  yotelFees: 0.155, // inclusive of all brand fees

  // Capital stack (indicative)
  seniorDebt: 24_000_000,
  seniorRate: 0.065,
  mezzDebt: 5_000_000,
  mezzRate: 0.11,
  lpEquity: 10_000_000,
  gpEquity: 1_000_000,

  // Exit
  exitCap: 0.085,

  // Revenue ramp (Year 1 → 5)
  yotelOccRamp: [0.55, 0.68, 0.78, 0.79, 0.79],
  yotelAdrRamp: [155, 175, 195, 203, 211],
  yotelpadOccRamp: [0.50, 0.63, 0.75, 0.76, 0.76],
  yotelpadAdrRamp: [220, 248, 270, 281, 292],

  // Ancillary
  /** F&B revenue — Caribbean resort benchmarks */
  fnb: {
    yotelPerNight: 78,       // transient business/leisure
    padPerNight: 45,         // longer-stay, lower F&B penetration
    // Weighted average for mixed portfolio ≈ $70/occupied room
  },
  otherPerOccupiedRoom: 12,
} as const
