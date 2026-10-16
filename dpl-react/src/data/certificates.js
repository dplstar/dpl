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
  },
  {
    id: 'iso-14001-2015',
    title: 'ISO 14001:2015',
    issuer: 'International Organization for Standardization',
    summary:
      'Our commitment to maintaining an effective environmental management system in accordance with ISO 14001:2015 standards.',
    details: [
      ['Scheme', 'ISO 14001:2015 Environmental Management System'],
      ['Enterprise', 'DPL Global Private Limited'],
      ['Udyam no.', 'UDYAM-UP-29-0001135'],
      ['Reference', 'ISO_14001_2015_1039477'],
      ['Pledged on', '27 September 2024']
    ],
    thumb: '/certificates/DPL - ISO 14001-2015.jpeg',
    image: '/certificates/DPL - ISO 14001-2015.jpeg',
    pdf: '/certificates/DPL - ISO 14001-2015.pdf',
    pdfSize: '1 MB',
    // page proportions, so the image keeps its shape while loading
    width: 595,
    height: 842
  },
  {
    id: 'iso-45001-2018',
    title: 'ISO 45001:2018',
    issuer: 'International Organization for Standardization',
    summary:
      'Our commitment to maintaining an effective occupational health and safety management system in accordance with ISO 45001:2018 standards.',
    details: [
      ['Scheme', 'ISO 45001:2018 Occupational Health and Safety Management System'],
      ['Enterprise', 'DPL Global Private Limited'],
      ['Udyam no.', 'UDYAM-UP-29-0001135'],
      ['Reference', 'ISO_45001_2018_1039477'],
      ['Pledged on', '27 September 2024']
    ],
    thumb: '/certificates/DPL - ISO 45001-2018.jpeg',
    image: '/certificates/DPL - ISO 45001-2018.jpeg',
    pdf: '/certificates/DPL - ISO 45001-2018.pdf',
    pdfSize: '0.5 MB',
    // page proportions, so the image keeps its shape while loading
    width: 595,
    height: 842
  },
  {
    id: 'iso-9001-2015',
    title: 'Certificate of Registration',
    issuer: 'International Organization for Standardization',
    summary:
      'Our commitment to maintaining an effective quality management system in accordance with ISO 9001:2015 standards.',
    details: [
      ['Scheme', 'ISO 9001:2015 Quality Management System'],
      ['Enterprise', 'DPL Global Private Limited'],
      ['Udyam no.', 'UDYAM-UP-29-0001135'],
      ['Reference', 'ISO_9001_2015_1039477'],
      ['Pledged on', '27 September 2024']
    ],
    thumb: '/certificates/DPL- ISO 9001-2015.jpeg',
    image: '/certificates/DPL- ISO 9001-2015.jpeg',
    pdf: '/certificates/DPL- ISO 9001-2015.pdf',
    pdfSize: '0.5 MB',
    // page proportions, so the image keeps its shape while loading
    width: 595,
    height: 842
  },
]
