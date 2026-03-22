'use client'

import { useMemo } from 'react'
import {
  X,
  ChefHat,
  Shirt,
  Wrench,
  Briefcase,
  Users,
  Luggage,
  Music,
} from 'lucide-react'
import { BOH, FOH, calculateBohArea } from '@/config/construction'
import { PROGRAMME, AMENITY_BLOCK_SPACES } from '@/config/programme'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BohDashboardProps {
  isOpen: boolean
  onClose: () => void
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmtNum(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

/** Map of BOH keys to their areas for per-item display */
const BOH_ITEMS: Record<string, Record<string, number>> = {
  'Food & Beverage': {
    'Main Kitchen': BOH.mainKitchen,
    'Cold Room': BOH.coldRoom,
    'Dry Storage': BOH.dryStorage,
    'Bar Storage': BOH.barStorage,
    'Dishwash': BOH.dishwash,
    'Waste Handling': BOH.wasteHandling,
    'Staff Dining': BOH.staffDining,
  },
  'Housekeeping': {
    'Central Linen Store': BOH.housekeeping,
    'Laundry': BOH.laundry,
    'Linen Store': BOH.linenStore,
    'Cleaning Chemicals': BOH.cleaningChemicals,
    'Uniform Store': BOH.uniformStore,
  },
  'Engineering & Plant': {
    'Main Plant Room': BOH.mainPlantRoom,
    'Electrical Switchroom': BOH.electricalSwitchroom,
    'Generator Room': BOH.generatorRoom,
    'Water Treatment': BOH.waterTreatment,
    'Fire Pump': BOH.fireRepump,
    'Workshop': BOH.workshop,
    'Paint Store': BOH.paintStore,
  },
  'Administration': {
    'GM Office': BOH.generalManager,
    'Back Office': BOH.backOffice,
    'Security': BOH.securityOffice,
    'IT Server Room': BOH.itServerRoom,
    'Receiving Dock': BOH.receivingDock,
    'Loading Bay': BOH.loadingBay,
  },
  'Staff Facilities': {
    'Male Changing': BOH.maleChanging,
    'Female Changing': BOH.femaleChanging,
    'Break Room': BOH.staffBreakRoom,
    'Staff WC': BOH.staffWC,
    'Training Room': BOH.trainingRoom,
    'First Aid': BOH.firstAid,
  },
  'Guest Services': {
    'Luggage Store': BOH.luggageStore,
    'Lost & Found': BOH.lostAndFound,
    'Pool Equipment': BOH.poolEquipment,
    'Landscape Store': BOH.landscapeStore,
  },
  'Creative & Co-Working': Object.fromEntries(
    AMENITY_BLOCK_SPACES
      .filter(s => s.category === 'creative' || s.category === 'coworking' || s.category === 'entertainment' || s.category === 'retail')
      .map(s => [s.name, s.area])
  ),
}

const CATEGORY_STYLE: Record<string, { icon: typeof ChefHat; bg: string; text: string; ring: string }> = {
  'Food & Beverage':      { icon: ChefHat,   bg: 'bg-amber-500/20',   text: 'text-amber-400',   ring: 'ring-amber-500/30' },
  'Housekeeping':         { icon: Shirt,      bg: 'bg-violet-500/20',  text: 'text-violet-400',  ring: 'ring-violet-500/30' },
  'Engineering & Plant':  { icon: Wrench,     bg: 'bg-sky-500/20',     text: 'text-sky-400',     ring: 'ring-sky-500/30' },
  'Administration':       { icon: Briefcase,  bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
  'Staff Facilities':     { icon: Users,      bg: 'bg-rose-500/20',    text: 'text-rose-400',    ring: 'ring-rose-500/30' },
  'Guest Services':       { icon: Luggage,    bg: 'bg-cyan-500/20',    text: 'text-cyan-400',    ring: 'ring-cyan-500/30' },
  'Creative & Co-Working': { icon: Music,     bg: 'bg-fuchsia-500/20', text: 'text-fuchsia-400', ring: 'ring-fuchsia-500/30' },
}

const BAR_COLOURS: Record<string, string> = {
  'Food & Beverage':     '#f59e0b',
  'Housekeeping':        '#a78bfa',
  'Engineering & Plant': '#38bdf8',
  'Administration':      '#34d399',
  'Staff Facilities':    '#fb7185',
  'Guest Services':        '#22d3ee',
  'Creative & Co-Working': '#d946ef',
}

/* ------------------------------------------------------------------ */
/*  Category card                                                      */
/* ------------------------------------------------------------------ */

function CategoryCard({ name, area, items }: { name: string; area: number; items: Record<string, number> }) {
  const style = CATEGORY_STYLE[name] ?? CATEGORY_STYLE['Administration']
  const Icon = style.icon
  const maxItem = Math.max(...Object.values(items))
  const colour = BAR_COLOURS[name] ?? '#64748b'

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.bg} ring-1 ${style.ring}`}>
          <Icon size={18} className={style.text} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{name}</h3>
          <p className="text-xs text-slate-400">{area}m&sup2; total</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {Object.entries(items).map(([label, itemArea]) => {
          const pct = Math.max(6, (itemArea / maxItem) * 100)
          return (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className="w-[120px] shrink-0 truncate text-slate-400">{label}</span>
              <div className="flex-1">
                <div
                  className="h-4 rounded"
                  style={{ width: `${pct}%`, backgroundColor: colour, opacity: 0.6 }}
                />
              </div>
              <span className="w-12 shrink-0 text-right tabular-nums text-slate-300">{itemArea}m&sup2;</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Laundry detail section                                             */
/* ------------------------------------------------------------------ */

function LaundryDetail() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Laundry Operations Detail</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Commercial Laundry Area</span>
            <span className="font-medium text-white">55m&sup2;</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Daily Linen Volume</span>
            <span className="text-slate-300">~650kg <span className="text-slate-600">(130 keys &times; 5kg/key/day)</span></span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Water Usage</span>
            <span className="text-slate-300">~6,500 litres/day <span className="text-slate-600">(10L/kg)</span></span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Operating Hours</span>
            <span className="text-slate-300">06:00&ndash;22:00 (2 shifts)</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Staff</span>
            <span className="text-slate-300">4 attendants + 1 supervisor</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Annual Cost</span>
            <span className="font-medium text-white">~$185,000</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Equipment</p>
          <ul className="space-y-1">
            {[
              '4× washer-extractors (25kg)',
              '2× tumble dryers (30kg)',
              '1× flatwork ironer',
              '2× folding tables',
            ].map((eq) => (
              <li key={eq} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1 w-1 shrink-0 rounded-full bg-violet-500/60" />
                {eq}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Alternative</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Consider outsourced laundry service &mdash; saves 55m&sup2; BOH but adds ~$2.50/key/night operating cost
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Plant room detail section                                          */
/* ------------------------------------------------------------------ */

function PlantRoomDetail() {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Plant Room &amp; Engineering Detail</h3>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Main Plant Room</span>
            <span className="font-medium text-white">75m&sup2;</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Electrical Switchroom</span>
            <span className="text-slate-300">25m&sup2; <span className="text-slate-600">(1000 kVA transformer)</span></span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Generator Room</span>
            <span className="text-slate-300">30m&sup2; <span className="text-slate-600">(500 kW diesel)</span></span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Generator Fuel Tank</span>
            <span className="text-slate-300">1,000L capacity</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Auto-Transfer Switch</span>
            <span className="text-slate-300">Included</span>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Major Plant Equipment</p>
          <ul className="space-y-1">
            {[
              '2× chiller units (225 tonnes each)',
              '2× air handling units (AHU)',
              'BMS panel (building management)',
              'Hot water calorifiers',
              'Domestic water booster set',
              'Fire pump set',
              'Main distribution board',
              'Sub-distribution per floor',
            ].map((eq) => (
              <li key={eq} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1 w-1 shrink-0 rounded-full bg-sky-500/60" />
                {eq}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-sky-500/20 bg-sky-500/5 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sky-400">Note</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Generator sized for essential loads only &mdash; full hotel requires BL&amp;P grid connection
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Area efficiency summary                                            */
/* ------------------------------------------------------------------ */

function EfficiencySummary({ total }: { total: number }) {
  const totalKeys = PROGRAMME.totalKeys
  const bohPerKey = total / totalKeys
  // Approximate GIA from programme
  const giaEstimate = PROGRAMME.groundFloor.gia + PROGRAMME.yotelFloors.roomsPerFloor * 3 * 25 + PROGRAMME.yotelpadFloors.unitsPerFloor * 2 * 35 + PROGRAMME.rooftop.gia
  const bohPctOfGia = (total / giaEstimate) * 100

  // Approximate FOH area
  const fohArea = FOH.missionControl + FOH.komyuniti + FOH.komyunitiLounge + FOH.hub * 2 + FOH.gym + FOH.publicWC + FOH.luggage + FOH.recordingStudio + FOH.podcastStudio + FOH.simRacingRoom + FOH.businessCenter + FOH.grabAndGo // from FOH config

  // Approximate total staff
  const totalStaff = 34 + 5 + 8 + 12 + 6 + 4 // F&B + laundry + housekeeping + admin + maintenance + guest services

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-5">
      <h3 className="mb-4 text-sm font-semibold text-white">Area Efficiency Summary</h3>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">BOH / Key</p>
          <p className="mt-1 text-xl font-bold text-white">{bohPerKey.toFixed(1)}m&sup2;</p>
          <p className={`text-[10px] ${bohPerKey >= 4.5 && bohPerKey <= 6.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {bohPerKey >= 4.5 && bohPerKey <= 6.5 ? 'Within' : bohPerKey < 4.5 ? 'Below' : 'Above'} benchmark (4.5&ndash;6.5m&sup2;/key)
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">BOH % of GIA</p>
          <p className="mt-1 text-xl font-bold text-white">{bohPctOfGia.toFixed(1)}%</p>
          <p className={`text-[10px] ${bohPctOfGia >= 15 && bohPctOfGia <= 25 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {bohPctOfGia >= 15 && bohPctOfGia <= 25 ? 'Within' : bohPctOfGia < 15 ? 'Below' : 'Above'} benchmark (15&ndash;25%)
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">FOH : BOH Ratio</p>
          <p className="mt-1 text-xl font-bold text-white">{fmtNum(fohArea)} : {fmtNum(total)}</p>
          <p className="text-[10px] text-slate-500">1 : {(total / fohArea).toFixed(1)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Staff Capacity</p>
          <p className="mt-1 text-xl font-bold text-white">~{totalStaff}</p>
          <p className="text-[10px] text-slate-500">positions across all depts</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function BohDashboard({ isOpen, onClose }: BohDashboardProps) {
  const bohData = useMemo(() => calculateBohArea(), [])

  if (!isOpen) return null

  // Approximate GIA for header stat
  const giaEstimate = PROGRAMME.groundFloor.gia + PROGRAMME.yotelFloors.roomsPerFloor * 3 * 25 + PROGRAMME.yotelpadFloors.unitsPerFloor * 2 * 35 + PROGRAMME.rooftop.gia
  const bohPctOfGia = (bohData.total / giaEstimate) * 100

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-slate-200">Back of House Operations</h2>
          <div className="flex items-center gap-3 text-[10px] text-slate-500">
            <span>Total BOH: <span className="font-medium text-white">{fmtNum(bohData.total)}m&sup2;</span></span>
            <span className="h-3 w-px bg-slate-700" />
            <span>{bohPctOfGia.toFixed(1)}% of GIA</span>
            <span className="h-3 w-px bg-slate-700" />
            <span>Benchmark: 15&ndash;25% for resort hotels</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        >
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* 6 category cards in 2×3 grid */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {Object.entries(bohData.categories).map(([name, cat]) => (
              <CategoryCard
                key={name}
                name={name}
                area={cat.area}
                items={BOH_ITEMS[name] ?? {}}
              />
            ))}
          </div>

          {/* Laundry detail */}
          <LaundryDetail />

          {/* Plant room detail */}
          <PlantRoomDetail />

          {/* Area efficiency summary */}
          <EfficiencySummary total={bohData.total} />
        </div>
      </div>
    </div>
  )
}
