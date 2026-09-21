/* ═══════════════════ DATA ═══════════════════
   Shared across all pages. Loaded as a plain (non-module) script so every
   page can reference these consts without a build step or a local server. */

const PRODS = [
  {
    id: "za",
    v: "za",
    name: "Zincalume Tanks",
    tl: "The everyday workhorse for large-volume storage",
    body: "Bolted panels in aluminium-zinc alloy coated steel, built for sites that need capacity without a long lead time.",
    mat: "Corrugated Zincalume® steel panel",
    coat: "AZ150 aluminium–zinc alloy",
    cap: "5,000 – 5,00,000 L",
    std: "IS 3396 / AWWA D103",
    img: "img/Zincalume.png",
    imgAlt: "Zincalume Tanks"
  },
  {
    id: "gi",
    v: "gi",
    name: "GI Tanks",
    tl: "A liner does the sealing, the panel does the holding",
    body: "Galvanised steel panels paired with a PVC or EPDM liner, so the structure and the watertightness are two separate, serviceable jobs.",
    mat: "Galvanised iron panel + liner",
    coat: "Hot-dip galvanised, 275 g/m²",
    cap: "5,000 – 4,00,000 L",
    std: "IS 3396",
    img: "img/Product Creatives DPL website.jpg",
    imgAlt: "GI Tanks"
  },
  {
    id: "fbe",
    v: "fbe",
    name: "Fusion Bond Epoxy Tanks",
    tl: "A modular system for chemically demanding sites",
    body: "Steel panels coated in fusion-bonded epoxy before assembly, giving corrosion resistance that survives the bolting and handling.",
    mat: "FBE-coated steel panel",
    coat: "Fusion-bonded epoxy, 250 µm",
    cap: "10,000 – 10,00,000 L",
    std: "AWWA D103",
    img: "img/Fusion-Tank.png",
    imgAlt: "Fusion Bond Epoxy Tanks"
  },
  {
    id: "gfs",
    v: "gfs",
    name: "Glass Fused Steel Tanks",
    tl: "Built for decades, not just a warranty period",
    body: "Vitreous enamel fused to steel at high temperature on both faces — the closest thing to a maintenance-free tank in the range.",
    mat: "Glass-fused-to-steel panel",
    coat: "Dual-sided vitreous enamel",
    cap: "50,000 – 50,00,000 L",
    std: "EN ISO 28765",
    img: "img/Glass-Tank.png",
    imgAlt: "Glass Fused Steel Tanks"
  }
];

const INDS = [
  { n: "Agriculture & Irrigation", c: "Water and fertiliser storage sized for field-level demand." },
  { n: "Food Processing", c: "Hygienic tanks built to hold food-safety compliance." },
  { n: "Oil & Gas", c: "Containment rated for petroleum products and process chemicals." },
  { n: "Chemical & Pharma", c: "Corrosion-resistant linings for sensitive compounds." },
  { n: "Municipal Water Storage", c: "City-scale supply reserves for utilities and boards." },
  { n: "Fire Water Storage", c: "Standby capacity built for rapid draw-down when it matters." },
  { n: "Grain Storage", c: "Sealed silos that keep out moisture, pests and spoilage." },
  { n: "Waste Water Treatment", c: "Process and containment tanks for treatment trains." },
  { n: "Industrial Utilities", c: "Compressed air, steam and process water vessels." },
  { n: "Infrastructure & EPC", c: "Storage scoped into larger EPC and infrastructure builds." }
];

const STRS = [
  { n: "In-house Design & Engineering", c: "One team owns the drawing from concept to fabrication, so nothing is lost in translation." },
  { n: "High-Precision Manufacturing", c: "Panels are cut and formed to tolerances that make assembly predictable on site." },
  { n: "Stringent Quality Inspection", c: "Checks run at every stage, not just before the tank leaves the factory." },
  { n: "Installation Teams Across India", c: "Certified crews on the ground, so timelines don't depend on a single base location." },
  { n: "Long Service Life & Guaranteed Performance", c: "Engineered for a service life backed by a stated performance guarantee." },
  { n: "Best-in-Class Material Selection", c: "Sourcing decisions made for corrosion resistance first, cost second." },
  { n: "ISO Certified Processes", c: "Management systems audited against recognised international benchmarks." }
];

const PIPES = [
  { code: "IS 1239", use: "Pipes for water and gas applications" },
  { code: "IS 4270", use: "Water well and casing pipes" },
  { code: "IS 2713", use: "Steel tubular poles" },
  { code: "IS 4923", use: "Structural tubes for infrastructure" }
];

const FITS = [
  "MS Ring", "MS Reducer", "MS Clamp", "MS Well Cap", "MS Centre Guide",
  "MS Bail Plug-Hook", "MS Tube Well Assembly Support", "MS Nipple",
  "MS Enlarger", "MS Ringa", "MS Dum Dum", "DI Elbow", "DI Equal Tee",
  "Rubber Gasket", "HDG Fasteners", "GI Interlocking Strip",
  "MS Spool Pipe — Double Flanged"
];

// Client logos live in /clients
const CLIENTS = [
  { name: "Voltas — Tata Enterprise", logo: "clients/Voltas-Logo.png" },
  { name: "Reliance Industries", logo: "clients/Reliance-Logo.png" },
  { name: "Punjab Agro", logo: "clients/Punjab Agro.png" },
  { name: "Powergrid", logo: "clients/Power-Grid-Logo.png" },
  { name: "PNC Infratech", logo: "clients/PNC-Logo.png" },
  { name: "NTPC", logo: "clients/NTPC-Logo.png" },
  { name: "NCC Limited", logo: "clients/NCC-Logo.png" },
  { name: "NBCC", logo: "clients/NBCC-Logo.png" },
  { name: "Larsen & Toubro", logo: "clients/Larsen-Toubro-Logo.png" },
  { name: "MP Jal Nigam", logo: "clients/Jal_Nigam_Logo.png" },
  { name: "HP Jal Shakti", logo: "clients/Jal-Logo.png" },
  { name: "UP Jal Nigam", logo: "clients/Jal-Jivan.png" },
  { name: "Indian Railways", logo: "clients/India-Railways.png" },
  { name: "Indian Oil", logo: "clients/Indian-Oil.png" },
  { name: "Delhi Metro", logo: "clients/Delhi-Metro.png" },
  { name: "BHEL", logo: "clients/Bhel.png" },
  { name: "Airports Authority of India", logo: "clients/Airports-India.png" },
  { name: "Adani", logo: "clients/Adani-Logo.png" },
  { name: "NKG Infrastructure", logo: "clients/pic5-1.png" },
  { name: "NCRTC", logo: "clients/pic3-1.png" }
];

const PROC = [
  { n: "Design & Engineering", c: "Site load, capacity and standards drawn up in-house before a panel is cut." },
  { n: "Precision Fabrication", c: "Panels formed and coated to the tolerances the design calls for." },
  { n: "Quality Inspection", c: "Multi-stage checks through the production run, not just at dispatch." },
  { n: "Installation", c: "Certified crews assemble and commission the tank on your site." }
];
