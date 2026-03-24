import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
} from '@react-pdf/renderer'
import type { DesignOption, CostEstimate, RevenueProjection } from '@/engine/types'

// ── Brand colours ─────────────────────────────────────────────────────
const NAVY = '#0f172a'
const SKY = '#0ea5e9'
const WHITE = '#ffffff'
const SLATE_100 = '#f1f5f9'
const SLATE_400 = '#94a3b8'
const SLATE_500 = '#64748b'
const SLATE_600 = '#475569'
const GREEN = '#15803d'
const RED = '#b91c1c'

// ── Formatters ────────────────────────────────────────────────────────
function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}
function fmtM(n: number): string {
  return `$${(n / 1_000_000).toFixed(1)}M`
}
function fmtK(n: number): string {
  return `$${(n / 1_000).toFixed(0)}k`
}
function fmtPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}
function fmtCur(n: number): string {
  return `$${fmt(Math.round(n))}`
}

const FORM_LABELS: Record<string, string> = {
  BAR: 'Linear Bar (E-W)',
  BAR_NS: 'Linear Bar (N-S)',
  L: 'L-Form',
  U: 'U-Form',
  C: 'Courtyard (C-Form)',
}

// ── Styles ────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: NAVY,
    backgroundColor: WHITE,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 50,
    right: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: SLATE_400,
  },
  // Cover
  coverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverConfidential: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 3,
    color: SKY,
    textTransform: 'uppercase' as const,
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 30,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    textAlign: 'center',
    marginBottom: 4,
  },
  coverSubtitle: {
    fontSize: 16,
    color: SLATE_500,
    textAlign: 'center',
    marginBottom: 24,
  },
  coverAccentLine: {
    width: 60,
    height: 2,
    backgroundColor: SKY,
    marginBottom: 24,
  },
  coverLocation: {
    fontSize: 10,
    color: SLATE_500,
    textAlign: 'center',
  },
  coverFooter: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  coverPrepared: {
    fontSize: 9,
    color: SLATE_400,
    textAlign: 'center',
  },
  coverDate: {
    fontSize: 9,
    color: SLATE_400,
    textAlign: 'center',
    marginTop: 3,
  },
  coverStrictly: {
    fontSize: 7,
    letterSpacing: 2,
    color: SLATE_400,
    textTransform: 'uppercase' as const,
    textAlign: 'center',
    marginTop: 16,
  },
  // Section headers
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
    color: SKY,
    textTransform: 'uppercase' as const,
    marginBottom: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: NAVY,
    marginBottom: 4,
  },
  sectionAccent: {
    width: 30,
    height: 2,
    backgroundColor: SKY,
    marginBottom: 20,
  },
  // Tables
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: NAVY,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: SLATE_100,
    paddingVertical: 3,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: SLATE_100,
    paddingVertical: 3,
    backgroundColor: SLATE_100,
  },
  tableTotalRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: NAVY,
    paddingTop: 5,
    marginTop: 2,
  },
  cellLabel: { flex: 2, color: SLATE_500, fontSize: 9 },
  cellValue: { flex: 2, fontFamily: 'Helvetica-Bold', fontSize: 9 },
  thLeft: { flex: 2, fontFamily: 'Helvetica-Bold', fontSize: 8 },
  thRight: { flex: 1, fontFamily: 'Helvetica-Bold', fontSize: 8, textAlign: 'right' },
  tdLeft: { flex: 2, fontSize: 9 },
  tdRight: { flex: 1, fontSize: 9, textAlign: 'right', fontFamily: 'Helvetica' },
  tdRightBold: { flex: 1, fontSize: 9, textAlign: 'right', fontFamily: 'Helvetica-Bold' },
  // Metric cards
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: SLATE_100,
    borderRadius: 4,
    padding: 10,
  },
  metricLabel: { fontSize: 7, color: SLATE_500, marginBottom: 2 },
  metricValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: NAVY },
  // Sub headers
  subHeader: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 1,
    color: NAVY,
    textTransform: 'uppercase' as const,
    marginBottom: 6,
    marginTop: 12,
  },
  // Disclaimer
  disclaimerText: {
    fontSize: 8,
    color: SLATE_600,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  // Badge
  badgePass: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: GREEN,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeFail: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: RED,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeInfo: {
    fontSize: 7,
    color: SLATE_600,
    backgroundColor: SLATE_100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  // Sustainability metric
  sustainRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: SLATE_100,
    paddingVertical: 5,
  },
})

// ── Reusable components ───────────────────────────────────────────────

interface PDFProps {
  option: DesignOption
  cost: CostEstimate
  projection: RevenueProjection
}

function PageFooter({ dateStr }: { dateStr: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>Confidential — Coruscant Developments Ltd — {dateStr}</Text>
      <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

function SectionHeader({ number, title }: { number: number; title: string }) {
  return (
    <View>
      <Text style={s.sectionLabel}>Section {number}</Text>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionAccent} />
    </View>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.tableRow}>
      <Text style={s.cellLabel}>{label}</Text>
      <Text style={s.cellValue}>{value}</Text>
    </View>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.metricCard}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={s.metricValue}>{value}</Text>
    </View>
  )
}

// ── Cost line items ───────────────────────────────────────────────────

const COST_LINES: { key: keyof CostEstimate['breakdown']; label: string }[] = [
  { key: 'construction', label: 'Construction' },
  { key: 'facade', label: 'Facade Systems' },
  { key: 'ffe', label: 'FF&E' },
  { key: 'technology', label: 'Technology & Systems' },
  { key: 'mep', label: 'MEP Systems' },
  { key: 'renewable', label: 'Renewable Energy' },
  { key: 'foundation', label: 'Foundation Engineering' },
  { key: 'outdoor', label: 'Outdoor / Amenities' },
  { key: 'siteWorks', label: 'Site Works' },
  { key: 'hurricaneUplift', label: 'Hurricane & Seismic Uplift' },
  { key: 'islandFactors', label: 'Island Factors (Import & Freight)' },
  { key: 'eiaAndPermits', label: 'EIA & Permits' },
  { key: 'softCosts', label: 'Soft Costs' },
  { key: 'contingency', label: 'Contingency' },
  { key: 'land', label: 'Land' },
]

// ══════════════════════════════════════════════════════════════════════
// PDF Document
// ══════════════════════════════════════════════════════════════════════

export function YotelPDFDocument({ option, cost, projection }: PDFProps) {
  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const { metrics, floors, amenities, validation } = option
  const floorCount = Math.round((metrics.buildingHeight - 4.5) / 3.2) + 1
  const yieldOnCost = cost.total > 0 ? projection.stabilisedNoi / cost.total : 0

  return (
    <Document
      title="YOTEL Barbados — Development Feasibility Study"
      author="Coruscant Developments Ltd"
      subject="Development Feasibility Study"
    >
      {/* ═══ PAGE 1: COVER ═══ */}
      <Page size="A4" style={[s.page, { paddingTop: 0, paddingBottom: 0 }]}>
        <View style={s.coverContainer}>
          <Text style={s.coverConfidential}>Confidential</Text>
          <Text style={s.coverTitle}>YOTEL BARBADOS</Text>
          <Text style={s.coverSubtitle}>Carlisle Bay</Text>
          <View style={s.coverAccentLine} />
          <Text style={[s.coverSubtitle, { fontSize: 13, marginBottom: 0 }]}>
            Development Feasibility Study
          </Text>
        </View>
        <View style={s.coverFooter}>
          <Text style={s.coverLocation}>Carlisle Bay  ·  Bridgetown  ·  Barbados</Text>
          <View style={{ height: 20 }} />
          <Text style={s.coverPrepared}>
            Prepared by: Coruscant Developments Ltd
          </Text>
          <Text style={s.coverDate}>Date: {dateStr}</Text>
          <Text style={s.coverStrictly}>Strictly Private & Confidential</Text>
        </View>
      </Page>

      {/* ═══ PAGE 2: EXECUTIVE SUMMARY ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={1} title="Executive Summary" />

        <Text style={s.subHeader}>Project Overview</Text>
        <InfoRow label="Location" value="Carlisle Bay, Bridgetown, Barbados" />
        <InfoRow label="Site Area" value={`${fmt(5965)} m\u00B2`} />
        <InfoRow label="Buildable Area" value={`${fmt(3599)} m\u00B2`} />
        <InfoRow label="Building Form" value={FORM_LABELS[option.form] ?? option.form} />
        <InfoRow
          label="Total Keys"
          value={`${metrics.totalKeys} (YOTEL ${metrics.yotelKeys} + YOTELPAD ${metrics.padUnits})`}
        />
        <InfoRow label="Building Height" value={`${metrics.buildingHeight.toFixed(1)}m (${floorCount} storeys)`} />
        <InfoRow label="GIA" value={`${fmt(Math.round(metrics.gia))} m\u00B2 (${metrics.giaPerKey.toFixed(1)} m\u00B2/key)`} />
        <InfoRow label="Site Coverage" value={fmtPct(metrics.coverage)} />

        <Text style={s.subHeader}>Key Financial Metrics</Text>
        <View style={s.metricsRow}>
          <MetricCard label="Total Development Cost" value={fmtM(cost.total)} />
          <MetricCard label="Cost per Key" value={fmtK(cost.perKey)} />
          <MetricCard label="Stabilised NOI" value={fmtM(projection.stabilisedNoi)} />
        </View>
        <View style={s.metricsRow}>
          <MetricCard label="GOP Margin" value={fmtPct(projection.gopMargin)} />
          <MetricCard label="Yield on Cost" value={fmtPct(yieldOnCost)} />
          <MetricCard label="RevPAR" value={fmtCur(projection.revPar)} />
        </View>

        <PageFooter dateStr={dateStr} />
      </Page>

      {/* ═══ PAGE 3: SITE OVERVIEW ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={2} title="Site Overview" />

        <InfoRow label="Gross Site Area" value={`${fmt(5965)} m\u00B2`} />
        <InfoRow label="Buildable Area" value={`${fmt(3599)} m\u00B2`} />
        <InfoRow label="Site Coverage" value={fmtPct(metrics.coverage)} />
        <InfoRow label="Max Permitted Height" value="22.0m" />
        <InfoRow label="Proposed Height" value={`${metrics.buildingHeight.toFixed(1)}m (${floorCount} storeys)`} />
        <InfoRow label="Building Form" value={FORM_LABELS[option.form] ?? option.form} />
        <InfoRow label="Corridor Type" value={metrics.corridorType === 'double_loaded' ? 'Double-Loaded' : 'Single-Loaded'} />
        <InfoRow label="Ground Floor Footprint" value={`${fmt(Math.round(metrics.footprint))} m\u00B2`} />
        <InfoRow label="Total GIA" value={`${fmt(Math.round(metrics.gia))} m\u00B2`} />
        <InfoRow label="GIA per Key" value={`${metrics.giaPerKey.toFixed(1)} m\u00B2/key`} />
        <InfoRow label="West (Beach) Facade" value={`${metrics.westFacade.toFixed(1)}m`} />
        <InfoRow label="Outdoor Amenity Area" value={`${fmt(Math.round(metrics.outdoorTotal))} m\u00B2`} />

        <Text style={[s.subHeader, { marginTop: 18 }]}>Planning Compliance</Text>
        {/* Compliance table */}
        <View style={s.tableHeader}>
          <Text style={[s.thLeft, { flex: 2 }]}>Regulation</Text>
          <Text style={[s.thRight, { flex: 1 }]}>Limit</Text>
          <Text style={[s.thRight, { flex: 1 }]}>Proposed</Text>
          <Text style={[s.thRight, { flex: 1 }]}>Status</Text>
        </View>
        <ComplianceTableRow
          rule="Max Site Coverage" limit="50.0%" actual={fmtPct(metrics.coverage)}
          pass={metrics.coverage <= 0.5}
        />
        <ComplianceTableRow
          rule="Max Building Height" limit="22.0m" actual={`${metrics.buildingHeight.toFixed(1)}m`}
          pass={metrics.buildingHeight <= 22.0}
        />
        <ComplianceTableRow
          rule="Max Footprint" limit={`${fmt(1800)} m\u00B2`}
          actual={`${fmt(Math.round(metrics.footprint))} m\u00B2`}
          pass={metrics.footprint <= 1800}
        />
        <ComplianceTableRow
          rule="Coastal Setback (CZMU)" limit="30m from HWM"
          actual="Compliant" pass={true}
        />

        {validation.violations.length > 0 && (
          <View style={{ marginTop: 10 }}>
            <Text style={[s.subHeader, { color: RED, marginTop: 0 }]}>Violations</Text>
            {validation.violations.map((v, i) => (
              <Text key={i} style={{ fontSize: 8, color: RED, marginBottom: 2 }}>
                {v.rule}: {String(v.actual)} (limit: {String(v.limit)})
              </Text>
            ))}
          </View>
        )}

        <PageFooter dateStr={dateStr} />
      </Page>

      {/* ═══ PAGE 4: FLOOR PROGRAMME ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={3} title="Floor Programme" />

        <View style={s.tableHeader}>
          <Text style={[s.thLeft, { flex: 1 }]}>Level</Text>
          <Text style={[s.thLeft, { flex: 2 }]}>Use</Text>
          <Text style={[s.thRight, { flex: 1 }]}>GIA (m{'\u00B2'})</Text>
          <Text style={[s.thRight, { flex: 1 }]}>Rooms</Text>
        </View>
        {floors.map((fl, i) => {
          const roomCount = fl.rooms.reduce((sum, r) => sum + r.count, 0)
          const useLabel =
            fl.use === 'FOH_BOH' ? 'FOH / BOH'
            : fl.use === 'YOTEL' ? 'YOTEL Rooms'
            : fl.use === 'YOTELPAD' ? 'YOTELPAD Units'
            : 'Rooftop'
          return (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tdLeft, { flex: 1 }]}>
                {fl.level === 0 ? 'Ground' : `Level ${fl.level}`}
              </Text>
              <Text style={[s.tdLeft, { flex: 2 }]}>{useLabel}</Text>
              <Text style={[s.tdRight, { flex: 1 }]}>{fmt(Math.round(fl.gia))}</Text>
              <Text style={[s.tdRight, { flex: 1 }]}>{roomCount > 0 ? roomCount : '-'}</Text>
            </View>
          )
        })}
        <View style={s.tableTotalRow}>
          <Text style={[s.tdLeft, { flex: 1, fontFamily: 'Helvetica-Bold' }]}>Total</Text>
          <Text style={[s.tdLeft, { flex: 2, fontFamily: 'Helvetica-Bold' }]}></Text>
          <Text style={[s.tdRightBold, { flex: 1 }]}>
            {fmt(Math.round(floors.reduce((sum, fl) => sum + fl.gia, 0)))}
          </Text>
          <Text style={[s.tdRightBold, { flex: 1 }]}>
            {floors.reduce((sum, fl) => sum + fl.rooms.reduce((rs, r) => rs + r.count, 0), 0)}
          </Text>
        </View>

        <View style={s.metricsRow}>
          <MetricCard label="Total Keys" value={String(metrics.totalKeys)} />
          <MetricCard label="YOTEL Rooms" value={String(metrics.yotelKeys)} />
          <MetricCard label="YOTELPAD Units" value={String(metrics.padUnits)} />
        </View>

        <PageFooter dateStr={dateStr} />
      </Page>

      {/* ═══ PAGE 5: COST BREAKDOWN ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={4} title="Development Cost Breakdown" />

        <View style={s.tableHeader}>
          <Text style={[s.thLeft, { flex: 3 }]}>Category</Text>
          <Text style={[s.thRight, { flex: 2 }]}>Amount (USD)</Text>
          <Text style={[s.thRight, { flex: 1 }]}>% of Total</Text>
        </View>
        {COST_LINES.map(({ key, label }, i) => {
          const amount = cost.breakdown[key]
          const pct = cost.total > 0 ? (amount / cost.total) * 100 : 0
          return (
            <View key={key} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tdLeft, { flex: 3 }]}>{label}</Text>
              <Text style={[s.tdRight, { flex: 2 }]}>{fmtCur(amount)}</Text>
              <Text style={[s.tdRight, { flex: 1 }]}>{pct.toFixed(1)}%</Text>
            </View>
          )
        })}
        <View style={s.tableTotalRow}>
          <Text style={[s.tdLeft, { flex: 3, fontFamily: 'Helvetica-Bold' }]}>
            Total Development Cost
          </Text>
          <Text style={[s.tdRightBold, { flex: 2 }]}>{fmtCur(cost.total)}</Text>
          <Text style={[s.tdRightBold, { flex: 1 }]}>100.0%</Text>
        </View>

        <View style={s.metricsRow}>
          <MetricCard label="Cost per Key" value={fmtK(cost.perKey)} />
          <MetricCard
            label="Cost per m\u00B2 GIA"
            value={fmtCur(metrics.gia > 0 ? cost.total / metrics.gia : 0)}
          />
        </View>

        <PageFooter dateStr={dateStr} />
      </Page>

      {/* ═══ PAGE 6: 5-YEAR REVENUE ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={5} title="Revenue Projection (5-Year)" />

        <View style={s.tableHeader}>
          <Text style={[s.thLeft, { flex: 1 }]}>Year</Text>
          <Text style={[s.thRight, { flex: 1 }]}>Revenue</Text>
          <Text style={[s.thRight, { flex: 1 }]}>GOP</Text>
          <Text style={[s.thRight, { flex: 1 }]}>NOI</Text>
          <Text style={[s.thRight, { flex: 1 }]}>YT Occ</Text>
          <Text style={[s.thRight, { flex: 1 }]}>YT ADR</Text>
          <Text style={[s.thRight, { flex: 1 }]}>PAD Occ</Text>
          <Text style={[s.thRight, { flex: 1 }]}>PAD ADR</Text>
        </View>
        {projection.years.map((yr, i) => (
          <View key={yr.year} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tdLeft, { flex: 1, fontFamily: 'Helvetica-Bold' }]}>
              Yr {yr.year}
            </Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtCur(yr.totalRevenue)}</Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtCur(yr.gop)}</Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtCur(yr.noi)}</Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtPct(yr.yotelOcc)}</Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtCur(yr.yotelAdr)}</Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtPct(yr.padOcc)}</Text>
            <Text style={[s.tdRight, { flex: 1, fontSize: 8 }]}>{fmtCur(yr.padAdr)}</Text>
          </View>
        ))}

        <View style={[s.metricsRow, { marginTop: 20 }]}>
          <MetricCard label="Stabilised NOI" value={fmtM(projection.stabilisedNoi)} />
          <MetricCard label="NOI per Key" value={fmtK(projection.stabilisedNoiPerKey)} />
          <MetricCard label="GOP Margin" value={fmtPct(projection.gopMargin)} />
          <MetricCard label="RevPAR" value={fmtCur(projection.revPar)} />
        </View>

        <View style={{ marginTop: 16, backgroundColor: SLATE_100, borderRadius: 4, padding: 12 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: NAVY, marginBottom: 4 }}>
            Key Assumptions
          </Text>
          <Text style={{ fontSize: 7, color: SLATE_600, lineHeight: 1.5 }}>
            {'\u2022'} YOTEL Stabilised ADR: $195 / YOTELPAD Stabilised ADR: $270{'\n'}
            {'\u2022'} GOP Margin: 51% / Brand Fees: 15.5% of revenue{'\n'}
            {'\u2022'} F&B: YOTEL $78/night, PAD $45/night / Other ancillary: $12{'\n'}
            {'\u2022'} 3-year ramp to stabilisation
          </Text>
        </View>

        <PageFooter dateStr={dateStr} />
      </Page>

      {/* ═══ PAGE 7: SUSTAINABILITY ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={6} title="Sustainability" />

        <Text style={s.subHeader}>Environmental Targets</Text>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>LEED Target</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>LEED v4.1 BD+C Hospitality — Gold</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>EDGE Certification</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>EDGE Advanced (target 40%+ savings)</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Net-Zero Strategy</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Net-Zero Operational Carbon by 2030</Text>
        </View>

        <Text style={s.subHeader}>Renewable Energy</Text>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>PV Array Capacity</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>
            {fmt(Math.round(metrics.footprint * 0.4 * 0.2))} kWp (est. rooftop)
          </Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Annual PV Generation</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>
            {fmt(Math.round(metrics.footprint * 0.4 * 0.2 * 1600))} kWh/yr
          </Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>PV Coverage</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>~40% of rooftop area</Text>
        </View>

        <Text style={s.subHeader}>Water & Waste</Text>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Water Recycling</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Greywater recycling for irrigation (target 40% reduction)</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Rainwater Harvesting</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Rooftop collection for cooling towers and landscaping</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Waste Diversion</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Target 75% construction waste diversion from landfill</Text>
        </View>

        <Text style={s.subHeader}>Resilience</Text>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Hurricane Rating</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Category 4 wind design (Barbados Building Code)</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Seismic Design</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Zone 3 seismic provisions</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 2 }]}>Sea Level Rise</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>FFE elevated 1.5m above 100-yr flood level</Text>
        </View>

        <PageFooter dateStr={dateStr} />
      </Page>

      {/* ═══ PAGE 8: DISCLAIMER & CONTACT ═══ */}
      <Page size="A4" style={s.page}>
        <SectionHeader number={7} title="Disclaimer & Contact" />

        <Text style={[s.subHeader, { marginTop: 4 }]}>Disclaimer</Text>
        <Text style={s.disclaimerText}>
          This Development Feasibility Study has been prepared by Coruscant Developments Ltd
          for internal evaluation purposes only. The financial projections, cost estimates,
          and revenue forecasts contained herein are based on assumptions derived from publicly
          available market data, industry benchmarks, and preliminary design parameters.
        </Text>
        <Text style={s.disclaimerText}>
          All figures are indicative and subject to change based on detailed design development,
          contractor pricing, market conditions, regulatory approvals, and financing terms.
          No representation or warranty, express or implied, is made as to the accuracy,
          completeness, or reliability of the information presented.
        </Text>
        <Text style={s.disclaimerText}>
          This document does not constitute investment advice, an offer to sell, or a solicitation
          of an offer to buy any interest in the proposed development. Prospective investors
          should conduct their own independent due diligence and seek professional advice
          before making any investment decision.
        </Text>
        <Text style={s.disclaimerText}>
          Construction cost estimates are based on 2025 Caribbean market benchmarks with a 4.31%
          annual escalation factor applied. Actual costs may vary significantly based on
          procurement strategy, market conditions, and contractor availability.
        </Text>

        <View style={{ height: 20 }} />
        <Text style={s.subHeader}>Contact</Text>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 1 }]}>Developer</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Coruscant Developments Ltd</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 1 }]}>Project</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>YOTEL Barbados — Carlisle Bay</Text>
        </View>
        <View style={s.sustainRow}>
          <Text style={[s.cellLabel, { flex: 1 }]}>Location</Text>
          <Text style={[s.cellValue, { flex: 2 }]}>Carlisle Bay, Bridgetown, Barbados</Text>
        </View>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <View style={[s.coverAccentLine, { marginBottom: 12 }]} />
          <Text style={{ fontSize: 8, color: SLATE_400, textAlign: 'center' }}>
            Generated by YOTEL Development Studio
          </Text>
          <Text style={{ fontSize: 8, color: SLATE_400, textAlign: 'center', marginTop: 2 }}>
            {dateStr}
          </Text>
        </View>

        <PageFooter dateStr={dateStr} />
      </Page>
    </Document>
  )
}

// ── Compliance table row (PDF) ────────────────────────────────────────

function ComplianceTableRow({
  rule,
  limit,
  actual,
  pass,
}: {
  rule: string
  limit: string
  actual: string
  pass: boolean
}) {
  return (
    <View style={s.tableRow}>
      <Text style={[s.tdLeft, { flex: 2 }]}>{rule}</Text>
      <Text style={[s.tdRight, { flex: 1, color: SLATE_500 }]}>{limit}</Text>
      <Text style={[s.tdRight, { flex: 1 }]}>{actual}</Text>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={pass ? s.badgePass : s.badgeFail}>
          {pass ? 'PASS' : 'FAIL'}
        </Text>
      </View>
    </View>
  )
}
