/*
 * Pipes and fittings shown on the Products page, below the storage tanks.
 * Content mirrors dplstar.com/product.
 *
 * Images live in public/img/products/ under the same file names as on the
 * current site. Run `node scripts/fetch-product-images.mjs` once to copy them
 * from dplstar.com into the project.
 *
 * Each section's primary button opens the Catalogue page.
 */

const IMG = '/img/products/'

export const PRODUCT_CATEGORIES = [
  {
    id: 'pipes',
    tone: 'dark',
    tag: 'Product range / Pipes',
    title: 'Pipes',
    intro: 'A full range of pipes for water, gas and structural applications.',
    codeNames: true, // item names are IS standard codes
    items: [
      { name: 'IS 1239', link: ['pipes', 'is-1239'], desc: 'Water and gas applications', img: `${IMG}IS1239-Pipes-for-Water-Gas-Application-By-DPL-Star.jpg` },
      { name: 'IS 4923', link: ['pipes', 'is-4923'], desc: 'Structural tubes for infrastructure', img: `${IMG}IS4923-for-Structural-Tubes-for-Infrastructures-by-DPL-Star.jpg` },
      { name: 'IS 4270', link: ['pipes', 'is-4270'], desc: 'Water well and casing pipes', img: `${IMG}IS4270-for-Water-Well-and-Casing-Pipes-by-DPL-Star.jpg` },
      { name: 'IS 2713', link: ['pipes', 'is-2713'], desc: 'Swaged-type steel tubular poles', img: `${IMG}IS-2713-Steel-tubular-poles-by-DPL-Star.jpg` }
    ],
    cta: {
      title: 'Need technical specifications?',
      body: 'Browse our catalogue for detailed technical information, specifications and application guides.',
      primary: 'View catalogue',
      secondary: 'Request a quote'
    }
  },
  {
    id: 'tube-well-fittings',
    tone: 'light',
    tag: 'Product range / Tube well fittings',
    title: 'Tube Well Fittings',
    intro: 'Quality fittings for reliable, efficient tube well systems.',
    items: [
      { name: 'MS Ring', desc: 'Durable and reliable', img: `${IMG}MS-Ring-Tube-Well-Fittings.jpg` },
      { name: 'MS Tube Well Assembly Support', desc: 'Sturdy construction', img: `${IMG}MS-Tube-Well-Fittings-by-DPL-Star.jpg` },
      { name: 'MS Bail Plug-Hook', desc: 'Secure fastening', img: `${IMG}MS-Bail-Tube-Well-Fittings.jpg` },
      { name: 'MS Centre Guide', desc: 'Precise alignment', img: `${IMG}MS-Center-Guide-Tube-Well-Fittings.jpg` },
      { name: 'MS Well Cap', desc: 'Protective covering', img: `${IMG}MS-Well-Cap-Tube-Well-Fittings-by-DPL-Star.jpg` },
      { name: 'MS Clamp', desc: 'Secure connection', img: `${IMG}MS-Clamp-Tube-Well-Fittings.jpg` },
      { name: 'MS Reducer', desc: 'Diameter transition', img: `${IMG}MS-Reducer-Tube-Well-Fittings.jpg` }
    ],
    cta: {
      title: 'Complete tube well solutions',
      body: 'Find technical specifications and details for our tube well fittings in the catalogue.',
      primary: 'View catalogue',
      secondary: 'Get a custom quote'
    }
  },
  {
    id: 'pump-fittings',
    tone: 'dark',
    tag: 'Product range / Pump fittings',
    title: 'Pump Fittings',
    intro: 'High-performance fittings for pump systems and fluid transfer.',
    items: [
      { name: 'MS Spool Pipe Double Flanged', desc: 'Durable connection', img: `${IMG}Ms-Spool-Pipe-Double-Flanged.jpg` },
      { name: 'DI Equal Tee', desc: 'Three-way connection', img: `${IMG}DI-Equal-Tee-Pump-Fittings-by-DPL-Star.jpg` },
      { name: 'DI Elbow', desc: 'Direction change', img: `${IMG}DI-Elbow-Pump-Fittings-by-DPL-Star.jpg` },
      { name: 'GI Interlocking Strip', desc: 'Secure fastening system', img: `${IMG}GI-Interlocking-Strip-Pump-Fittings-by-DPL-Star.jpg` },
      { name: 'HDG Fasteners', desc: 'Corrosion-resistant', img: `${IMG}HDG-Fastners-Pump-Fittings-by-DPL-Star.jpg` },
      { name: 'Rubber Gasket', desc: 'Leak-proof sealing', img: `${IMG}Rubber-Gasket-Pump-Fittings-by-DPL-Star.jpg` },
      { name: 'MS Clamp', desc: 'Secure pipe connection', img: `${IMG}Ms-Clamp-Pump-Fittings-by-DPL-Star.jpg` },
      { name: 'MS Dum Dum', desc: 'Specialised fitting', img: `${IMG}Ms-Dum-Dum-Pump-Fittings-by-DPL-Star.jpg` }
    ],
    cta: {
      title: 'Complete pump system solutions',
      body: 'Explore our full range of pump fittings and accessories, with detailed specifications in the catalogue.',
      primary: 'View catalogue',
      secondary: 'Request pricing'
    }
  }
]
