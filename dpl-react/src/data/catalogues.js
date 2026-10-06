/*
 * Catalogues shown on the Catalogue page.
 *
 * Each page is a pre-rendered image of the PDF (see public/catalogue/<id>/).
 *   - `src`   1000px wide, used inside the flipbook
 *   - `large` 1800px wide, loaded only when someone opens the zoom reader
 *
 * To add a catalogue: export its pages as images at the same aspect ratio,
 * drop them in public/catalogue/<id>/ and add an entry below. A switcher
 * appears automatically once there is more than one catalogue.
 */

const page = (folder, n, alt) => {
  const num = String(n).padStart(2, '0')
  return {
    src: `/catalogue/${folder}/page-${num}-1000.webp`,
    large: `/catalogue/${folder}/page-${num}-1800.webp`,
    alt
  }
}

export const CATALOGUES = [
  {
    id: 'zincalume',
    title: 'Zincalume Tanks',
    summary: 'Specifications, accessories, installations and clients for DPL Star Zincalume tanks.',
    pdf: '/catalogue/zincalume/DPL-Star-Zincalume-Tanks-Catalogue.pdf',
    pdfSize: '8.3 MB',
    // Page proportions of the source PDF (665 × 945 pt)
    pageWidth: 665,
    pageHeight: 945,
    pages: [
      page('zincalume', 1, 'Cover: DPL Star Zincalume Tanks, 1000+ successful installations'),
      page('zincalume', 2, 'About DPL Star, key features of Zincalume tanks and association with Jal Jeevan Mission'),
      page('zincalume', 3, 'Comparison table of DPL Star Zincalume tanks against MS, RCC, SS and PVC tanks'),
      page('zincalume', 4, 'Specifications: tank basic details, tank wall and roof sheet'),
      page('zincalume', 5, 'Specifications: tank liner, nozzles, nuts and bolts, fasteners'),
      page('zincalume', 6, 'Specifications: tank accessories and optional additional items'),
      page('zincalume', 7, 'Benefits of Zincalume tanks'),
      page('zincalume', 8, 'Map of installation locations across India, grouped by tank capacity'),
      page('zincalume', 9, 'Trusted clients'),
      page('zincalume', 10, 'Types of products: Zincalume tanks, grain storage silos, GFS/GLS tanks and FBEC tanks'),
      page('zincalume', 11, 'Photograph of an installed DPL Star Zincalume tank on an elevated platform'),
      page('zincalume', 12, 'Back cover with website, phone, email, factory and office addresses')
    ],
    // Jump-to list. `page` is the zero-based page index.
    sections: [
      { label: 'Cover', page: 0 },
      { label: 'Key features', page: 1 },
      { label: 'Tank comparison', page: 2 },
      { label: 'Specifications', page: 3 },
      { label: 'Benefits', page: 6 },
      { label: 'Installations', page: 7 },
      { label: 'Clients', page: 8 },
      { label: 'Product range', page: 9 },
      { label: 'Contact details', page: 11 }
    ]
  }
]
