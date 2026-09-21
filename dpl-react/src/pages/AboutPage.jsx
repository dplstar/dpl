import PageHero from '../components/PageHero.jsx'
import AboutStats from '../components/AboutStats.jsx'
import ProcessSection from '../components/ProcessSection.jsx'
import StrengthsSection from '../components/StrengthsSection.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { STRS } from '../data/siteData.js'

export default function AboutPage({ active }) {
  return (
    <div className={`page${active ? ' active' : ''}`} data-page="about">
      <PageHero
        tag="About DPL Star"
        heading="A tank manufacturer that keeps its engineering in-house."
        body="DPL Star is the brand name of DPL Global Private Limited, incorporated on 20 June 2008 and active in liquid storage manufacturing since 30 December 2019. We design, fabricate and install storage systems for clients who can't treat a tank as an afterthought."
      >
        <AboutStats />
      </PageHero>

      <ProcessSection />

      <StrengthsSection
        tag="Standards & quality"
        heading="ISO-certified processes, audited end to end"
        note="Certification isn't a badge on the homepage — it's the management system that governs every batch that leaves the factory."
        items={STRS.slice(0, 4)}
      />

      <CtaBand heading="Want the full capability deck?" buttonLabel="Request the brochure" target="contact" />
    </div>
  )
}
