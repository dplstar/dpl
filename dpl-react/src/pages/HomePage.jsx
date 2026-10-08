import HeroStory from '../components/HeroStory.jsx'
import StatsStrip from '../components/StatsStrip.jsx'
import IndustriesSection from '../components/IndustriesSection.jsx'
import SignatureProducts from '../components/SignatureProducts.jsx'
import StrengthsSection from '../components/StrengthsSection.jsx'
import ClientsMarquee from '../components/ClientsMarquee.jsx'
import CtaBand from '../components/CtaBand.jsx'
import FactoryLocation from '../components/FactoryLocation.jsx'
import { STRS } from '../data/siteData.js'

const HOME_PRODUCT_IMAGES = {
  za: '/img/Zincalume%20Tanks.png',
  gi: '/img/Color%20Coded%20Tank.png',
  fbe: '/img/Fusion%20Bond%20Epoxy%20Tanks.png',
  gfs: '/img/home-product-creative.png'
}

export default function HomePage({ active }) {
  return (
    <div className={`page${active ? ' active' : ''}`} data-page="home">
      <HeroStory />
      <StatsStrip />
      <IndustriesSection />
      <SignatureProducts homeImages={HOME_PRODUCT_IMAGES} />
      <StrengthsSection
        tag="Why DPL Star"
        heading="Seven things we don't compromise on"
        items={STRS}
      />
      <ClientsMarquee />
      <CtaBand heading="Tell us what you need to store." buttonLabel="Start a conversation" target="contact" />
      <FactoryLocation />
    </div>
  )
}
