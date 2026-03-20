/**
 * Colour palette — exact context design system tokens + YOTEL purple brand.
 *
 * context source: index-CooeX_rA.css, base.css, context-grid.css
 * context uses "--scenario-purple: #b37bfc" — we replace with YOTEL purple #7B2D8E
 * and darken programme hues slightly for richer architectural massing.
 *
 * context tokens reference:
 *   --background-color-surface-100 = white (#fff)
 *   --background-color-surface-200 = #f5f5f5
 *   --background-color-surface-250 = border/divider
 *   --text-color-medium-default    = #3c3c3c
 *   --text-color-light             = #808080
 *   --text-color-placeholder       = light grey
 *   --icon-color-medium            = #808080
 *   --border-color-divider-light   = rgba(60,60,60,.1)
 *   --border-color-divider-heavy   = rgba(60,60,60,.25)
 *   --context-box-shadow             = 0 3px 8px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.05)
 *   --scenario-purple              = #b37bfc → replaced with #7B2D8E
 *   --icon-color-selected-hover    = #0696d7
 *   Dark toolbar bg                = #535353
 *   Font                           = "Artifakt Element" → we use Inter
 */
const P = {
  // ── YOTEL brand purple (replaces context scenario-purple #b37bfc) ──
  purple:       "#7B2D8E",   // primary — deeper than context's lilac
  purpleDark:   "#5A1E6C",   // headings / strong emphasis
  purpleLight:  "#A35CB8",   // hover state
  purpleMid:    "#8C41A6",   // selected state (cf context #8c41ed)
  purpleFaint:  "rgba(123,45,142,.07)",  // 15% tint (cf #b37bfc26)
  purple30:     "rgba(123,45,142,.19)",  // 30% tint (cf #b37bfc4d)

  // ── Programme 3D hues (slightly darker than standard) ──
  hotel:    "#2E8A76",      // deep teal — YOTEL rooms
  extended: "#B8456A",      // dark rose — YOTELPAD
  amenity:  "#C47D1A",      // dark amber — Komyuniti, gym
  retail:   "#C47D1A",      // dark amber — F&B
  boh:      "#5E6878",      // cool slate — BOH
  ground:   "#7A9A70",      // olive sage — ground floor
  pool:     "#3688A8",      // ocean blue — water features
  outdoor:  "#4E8E3E",      // forest green — outdoor deck

  // ── 3D context & environment ──
  context:  "#A8AEB8",      // grey — existing buildings
  road:     "#7A7E86",      // asphalt
  water:    "#2C6878",      // deep Caribbean
  beach:    "#C4B590",      // warm sand
  terrain:  "#B0B8A4",      // muted olive ground

  // ── context UI surfaces ──
  bg:       "#F0F1F3",      // app background
  bgPanel:  "#FFFFFF",      // surface-100 (panels, cards)
  bgCard:   "#FFFFFF",      // card surface
  bgHover:  "#F5F5F5",      // surface-200 (hover, secondary)
  card:     "#FFFFFF",
  surface:  "#F5F5F5",      // surface-200
  surface250: "rgba(60,60,60,.1)",  // surface-250

  // ── context text ──
  text:     "#3C3C3C",      // text-color-medium-default
  textBold: "#1A1A1A",      // strong headings
  sub:      "#808080",      // text-color-light / icon-color-medium
  dim:      "#3C3C3CB3",    // text-color-placeholder (70% charcoal)
  label:    "#808080",      // form labels

  // ── context borders ──
  border:   "rgba(60,60,60,.1)",    // border-color-divider-light
  borderH:  "rgba(60,60,60,.25)",   // border-color-divider-heavy
  borderL:  "rgba(128,128,128,.2)", // lighter border (used on thumbnails)
  borderF:  "#7B2D8E",             // focus border = purple

  // ── Interactive / accent ──
  site:     "#CC3333",      // red site boundary
  offset:   "#2266BB",      // blue buildable zone
  selected: "#7B2D8E",      // selection = YOTEL purple
  accent:   "#7B2D8E",      // primary CTA
  accentAlt:"#2E8A76",      // secondary CTA = teal
  link:     "#006EAF",      // context link blue
  linkHover:"#0696D7",      // context icon-color-selected-hover
  success:  "#3E9A5C",      // positive
  warning:  "#C47D1A",      // caution
  danger:   "#B8456A",      // negative

  // ── context shadows (exact from CSS) ──
  shadow:    "0 3px 8px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.05)",
  shadowLg:  "0 0 16px rgba(0,0,0,.2)",
  shadowCard:"0 0 4px rgba(0,0,0,.2)",

  // ── Dark toolbar (context compass / scene tools) ──
  toolbar:  "#535353",
  toolbarText: "#F5F5F5",
};

export default P;
