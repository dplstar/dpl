/*
 * Pipes page content. The four standards and their applications come from
 * dplstar.com/product; the product types (ERW, black/galvanised, hollow
 * sections, tubular poles) from the DPL Star company profile.
 *
 * Before launch, have DPL confirm and fill in their actual size ranges,
 * wall thicknesses / classes and finishes (add rows to `specs`).
 *
 * Images: same files as the Products page (public/img/products/),
 * copied from the live site by `node scripts/fetch-product-images.mjs`.
 */

const IMG = '/img/products/'

export const PIPES_RANGE = [
  {
    id: 'is-1239',
    code: 'IS 1239',
    title: 'Pipes for water & gas',
    standard: 'IS 1239 (Part 1): Steel tubes, tubulars and other wrought steel fittings',
    summary:
      'Mild steel ERW pipes for carrying water, gas and air through buildings, plants and utility networks. Supplied black or galvanised.',
    uses: ['Water supply lines', 'Gas lines', 'Plumbing & building services', 'Compressed air'],
    specs: [
      ['Standard', 'IS 1239 (Part 1)'],
      ['Type', 'Welded (ERW) mild steel tubes'],
      ['Finish', 'Black or galvanised'],
      ['Classes', 'Light, medium and heavy, as per standard']
    ],
    img: `${IMG}IS1239-Pipes-for-Water-Gas-Application-By-DPL-Star.jpg`
  },
  {
    id: 'is-4923',
    code: 'IS 4923',
    title: 'Structural tubes for infrastructure',
    standard: 'IS 4923: Hollow steel sections for structural use',
    summary:
      'Square and rectangular hollow sections for frames, trusses and supports, where a high strength-to-weight ratio keeps structures light and rigid.',
    uses: ['Building frames & trusses', 'Industrial sheds', 'Solar module structures', 'Fencing & railings'],
    specs: [
      ['Standard', 'IS 4923'],
      ['Type', 'Square and rectangular hollow sections'],
      ['Use', 'Structural and infrastructure']
    ],
    img: `${IMG}IS4923-for-Structural-Tubes-for-Infrastructures-by-DPL-Star.jpg`
  },
  {
    id: 'is-4270',
    code: 'IS 4270',
    title: 'Water well & casing pipes',
    standard: 'IS 4270: Steel tubes used for water wells',
    summary:
      'Casing pipes that line a borewell and hold it open, so water can be drawn reliably for years. Used in tube wells for drinking water and irrigation.',
    uses: ['Tube well casing', 'Drinking water borewells', 'Irrigation wells', 'Rural water supply'],
    specs: [
      ['Standard', 'IS 4270'],
      ['Type', 'Steel casing pipes for water wells'],
      ['Use', 'Tube wells and borewells']
    ],
    img: `${IMG}IS4270-for-Water-Well-and-Casing-Pipes-by-DPL-Star.jpg`
  },
  {
    id: 'is-2713',
    code: 'IS 2713',
    title: 'Swaged steel tubular poles',
    standard: 'IS 2713: Tubular steel poles for overhead power lines',
    summary:
      'Swaged-type poles built from steel tube sections of reducing diameter, for overhead power lines and street lighting.',
    uses: ['Overhead power distribution', 'Street lighting', 'Area & campus lighting'],
    specs: [
      ['Standard', 'IS 2713'],
      ['Type', 'Swaged-type steel tubular poles'],
      ['Use', 'Power lines and lighting']
    ],
    img: `${IMG}IS-2713-Steel-tubular-poles-by-DPL-Star.jpg`
  }
]
