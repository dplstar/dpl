import PageHero from '../components/PageHero.jsx'
import AboutStats from '../components/AboutStats.jsx'
// import ProcessSection from '../components/ProcessSection.jsx'
import StrengthsSection from '../components/StrengthsSection.jsx'
import CtaBand from '../components/CtaBand.jsx'
import CertificatesSection from '../components/CertificatesSection.jsx'
import LeadershipSection from '../components/LeadershipSection.jsx'
import { STRS } from '../data/siteData.js'
import LbrGroup from '../components/lbrGroup.jsx'
export default function AboutPage({ active }) {
  return (
    <div className={`page${active ? ' active' : ''}`} data-page="about">
      <PageHero
        tag="About DPL Star"
        heading="Engineered for Strength. Backed by Legacy."
        body={<>
          DPL Star is the storage solutions brand of DPL Global Private Limited and part of <a href="https://www.lbrgroup.co/"
      target="_blank"
      rel="noopener noreferrer">LBR Group</a>. We manufacture Zincalume Tanks, Colour Bonded Tanks, Fusion Bond Epoxy Tanks, and Glass Fused Steel Tanks, alongside ERW steel pipes and tube-well and pump fittings. With in-house engineering and manufacturing capabilities, we deliver dependable solutions for infrastructure, industry, and water storage.</>}
      >
        <AboutStats />
      </PageHero>

      {/* <ProcessSection /> */}
          <LbrGroup/>
      <StrengthsSection
        tag="Standards & quality"
        heading={
          <>
            The Strength You Can Trust<sup className="trademark">TM</sup>
          </>
        }
        note="Our trademarked tagline 'The Strength You Can Trust' reflects our commitment to quality, reliability, and lasting performance."
        items={STRS.slice(0, 4)}
      />

      <CertificatesSection />

      <LeadershipSection />
      <CtaBand heading="Build A Better Tomorrow, Today" buttonLabel="Explore Products" target="products" />

    </div>
  )
}
