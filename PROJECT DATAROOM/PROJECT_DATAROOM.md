# YOTEL + YOTELPAD Barbados | Project Dataroom

**Project:** YOTEL + YOTELPAD Carlisle Bay, Barbados
**Sponsor:** Coruscant Developments Limited
**Brand Partner:** YOTEL Group
**Site:** Second Line, Bay Street, Carlisle Bay, Bridgetown, Barbados
**Status:** Pre-funding / Pre-planning submission
**Date Established:** 2026-03-20

---

## Dataroom Structure

| Folder | Contents | Status |
|--------|----------|--------|
| `01_LEGAL_AND_PLANNING` | Barbados planning legislation, PDA, GDO, PDP, SDA, Tourism Dev Act, fire/safety | Populated from PLANNING LEGISLATION |
| `02_SITE_AND_SURVEY` | Survey plans, parcel geometry, legal descriptions, land records | **NEEDS: Woodside survey plan, cadastral data, coastal survey** |
| `03_BRAND_AND_DESIGN` | YOTEL/YOTELPAD feasibility guidelines, design briefs, brand standards | **NEEDS: YOTEL Feasibility Guidelines D01-C08 PDF** |
| `04_FINANCIAL_MODELS` | Pro forma, capex model, waterfall, treasury, burn rates | Populated from YOTEL PROJECT INFORMATION |
| `05_FUNDING_AND_INVESTORS` | Investor decks, DFI letters, Magnus proposal, fund structure docs | Populated from YOTEL PROJECT INFORMATION |
| `06_CONSULTANTS` | Acoustic, structural, MEP, coastal engineering, fire safety reports | **EMPTY - To be populated as consultants engaged** |
| `07_ENVIRONMENTAL_AND_COASTAL` | EIA screening, coastal survey, CZMU, ICZM, storm surge, drainage | **NEEDS: EIA screening, coastal survey commission** |
| `08_APPROVALS_AND_PERMITS` | Planning permission, building permits, occupancy certs, SDA approval, tourism designation | **EMPTY - Tracking only at this stage** |
| `09_CONSTRUCTION_AND_PROCUREMENT` | Modular procurement, contractor docs, programme | **EMPTY - Pre-construction** |
| `10_OPERATIONS_AND_BRAND_COMPLIANCE` | Brand compliance tracker, operator docs, licence to operate | **EMPTY - Pre-operations** |
| `11_IMAGES_AND_SITE_PHOTOS` | Site photos, aerial images, bay context | Populated from YOTEL PROJECT INFORMATION |
| `12_GEOSPATIAL_AND_GIS` | KML, KMZ, GeoJSON, shapefiles, georeferenced plans | **NEEDS: Georeferenced site boundary, parcel data** |
| `13_PROJECT_OUTPUTS` | Design options, massing outputs, compliance reports, exports | Populated from caro_client_export |
| `14_CORRESPONDENCE` | YOTEL CEO letters, DFI correspondence, govt correspondence | Populated from YOTEL PROJECT INFORMATION |
| `15_DUE_DILIGENCE` | Magnus verification checklist, counterparty checks, legal opinions | **In progress - see FINANCIAL_REVIEW.md** |

---

## Source Document Locations

Current project files are organized across three locations:

1. **`PLANNING LEGISLATION/`** - 21 PDFs covering Barbados planning law, PDP, SDA, tourism, and project-specific analysis
2. **`YOTEL PROJECT INFORMATION/`** - Financial models (3x XLSX), investor decks (6+ PDFs), site photos (10+ images), survey plan
3. **`caro_client_export/`** - Previous builder's codebase (Python backend + React/Vite frontend + Three.js 3D viewer)

---

## Key Management Documents

| Document | Purpose |
|----------|---------|
| [DOCUMENT_REGISTER.md](./DOCUMENT_REGISTER.md) | Every document classified by source tier with provenance tracking |
| [FINANCIAL_REVIEW.md](./FINANCIAL_REVIEW.md) | PE-grade financial model audit, burn rate tracking, assumption verification |
| [PLANNING_COMPLIANCE.md](./PLANNING_COMPLIANCE.md) | Regulatory workflow tracking from pre-app to occupancy certificate |
| [OPEN_ITEMS.md](./OPEN_ITEMS.md) | Unresolved questions that block reliable decisions |
| [RISK_REGISTER.md](./RISK_REGISTER.md) | Project risks classified by category and severity |

---

## Critical Path Items (as of 2026-03-20)

### Immediate (Weeks 1-4)
1. **Road classification confirmation** - Determines front setback (5.79m to 15.24m range)
2. **Coastal survey commission** - Fixes 30m HWM setback boundary relative to building footprint
3. **SDA boundary written confirmation** - Verify Carlisle Bay SDA includes the Woodside site
4. **Magnus Capital verification** - Complete steps 1-4 of verification checklist before data room access
5. **YOTEL Feasibility Guidelines D01-C08** - Obtain and ingest the source brand document

### Near-term (Weeks 4-12)
6. **Pre-application consultation** - Schedule with Planning and Development Board
7. **EIA screening** - Formal screening with authority (hotel >50 rooms = mandatory trigger)
8. **SDA approved developer application** - Begin in parallel with planning
9. **Tourism project designation application** - Begin in parallel with planning
10. **Geotechnical survey** - Commission before design finalization

### Medium-term (Months 3-6)
11. **EIA Terms of Reference agreement**
12. **Formal planning application submission**
13. **Fund structure finalization** (506C or alternative)
14. **Senior debt term sheet**
15. **Design development to planning submission standard**

---

## Project Seed Parameters (EQUALIZED v2 — 2026-03-20)

**Source:** `04_FINANCIAL_MODELS/CONFLICT_RESOLUTION_v2.md`

### Programme
| Parameter | Value | Source |
|-----------|-------|--------|
| Total keys | 130 | All sources consistent |
| YOTEL rooms | 100 | config.py, Financial Model |
| YOTELPAD units | 30 | config.py |
| Estimated GFA | ~75,000 sf | Building programme + 12.5% resort uplift |
| Site area (gross) | ~5,965 m2 | Dynamo export (site.py) |
| Site area (buildable) | ~3,599 m2 | site.py (after setbacks) |

### Planning
| Parameter | Value | Source |
|-----------|-------|--------|
| Max coverage | 50% | PDP 2023 (T1 Statutory) |
| Max plot ratio | 2.0 to 5.0 | PDP 2023 (urban core) |
| Max height | 25m / ~9 storeys | PDP + Carlisle Bay precedent |
| Resort uplift factor | 12.5% | Brand assumption |
| Construction type | Prefab modular on steel frame | config.py |

### Financial (Equalized v2)
| Parameter | Value | Source |
|-----------|-------|--------|
| Land price | $3,500,000 | Financial Model v2 |
| Hard cost | $350/sf | Sponsor directive, BCQS validated |
| Hard construction total | $26,250,000 | 75,000 sf × $350 |
| **TDC** | **$40,000,000** | Revised build-up |
| Cost per key | $307,692 | $40M / 130 |
| YOTEL ADR (stabilized Yr 3) | $195 | Financial Model v2 |
| YOTEL ADR (Year 1 ramp) | $155 | Financial Model v2 |
| ADR annual growth | 4% | Financial Model v2 |
| YOTELPAD ADR (stabilized) | $270 | config.py |
| Occupancy (stabilized Yr 3) | 78% YOTEL / 75% YOTELPAD | Financial Model v2 + config.py |
| Occupancy (Year 1 ramp) | 55% | Financial Model v2 |
| **GOP margin** | **51%** | Sponsor target |
| YOTEL total fees | 15.5% inclusive | Inclusive of all operational fees |
| **Stabilized Revenue (Yr 3)** | **$7,767,825** | Calculated |
| **Stabilized NOI (Yr 3)** | **$3,961,591** | Revenue × 51% GOP |
| **DSCR (stabilized)** | **2.54x** | NOI / $1.56M debt service |
| Build schedule | 16 months | Magnus Treasury Waterfall (Excel) |
| Target IRR | 17-21% | Levered |

### Capital Stack (Indicative — requires restructuring)
| Source | Amount | % |
|--------|--------|---|
| Senior Debt | $24,000,000 | 60% |
| Mezzanine | $5,000,000 | 12.5% |
| LP Equity | $10,000,000 | 25% |
| GP Co-invest | $1,000,000 | 2.5% |
| **Total** | **$40,000,000** | **100%** |

### Remaining Open Items
- Capital stack restructuring for $40M TDC
- Senior debt indicative terms
- Magnus RIA/SBLC verification (before NDA)
- Market study / STR comp set for ADR/occupancy validation
- Exit cap rate comparable transactions

---

*This dataroom index is maintained as the single source of truth for project document organization. Update whenever documents are added, removed, or reclassified.*
