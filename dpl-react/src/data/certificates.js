/*
 * Certificates shown in the Certificates section (About page).
 *
 * To add one: export the certificate as two images (600px and 1600px wide)
 * plus the PDF into public/certificates/, then add an entry below.
 * `details` rows appear in the order given; leave out any you don't need.
 */

export const CERTIFICATES = [
  {
    id: 'zed-pledge',
    title: 'MSME ZED Pledge',
    issuer: 'Ministry of Micro, Small & Medium Enterprises',
    summary:
      'Our pledge under the MSME Sustainable (ZED) Certification Scheme to work by Zero Defect, Zero Effect: environmentally sound, socially responsible processes and safe, high-quality products.',
    details: [
      ['Scheme', 'MSME Sustainable (ZED) Certification'],
      ['Enterprise', 'DPL Global Private Limited'],
      ['Udyam no.', 'UDYAM-UP-29-0001135'],
      ['Reference', 'ZED_02092026_1039477'],
      ['Pledged on', '2 September 2026']
    ],
    thumb: '/certificates/zed-pledge-600.webp',
    image: '/certificates/zed-pledge-1600.webp',
    pdf: '/certificates/DPL-Global-ZED-Pledge.pdf',
    pdfSize: '1.8 MB',
    // page proportions, so the image keeps its shape while loading
    width: 595,
    height: 842
  }
]
