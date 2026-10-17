import { NavigationProvider, useNavigation } from './NavigationContext.jsx'
import Nav from './components/Nav.jsx'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import CataloguePage from './pages/CataloguePage.jsx'
import ContactPage from './pages/ContactPage.jsx'
import ZincalumePage from './pages/ZincalumePage.jsx'
import PipesPage from './pages/PipesPage.jsx'
// import GITanksPage from './pages/GITanksPage.jsx'
import ColourBondedPage from './pages/ColourBonded.jsx'
import FusionBondEpoxyTanksPage from './pages/FusionBondEpoxyTanks.jsx'
import GlassFusedSteelTanksPage from './pages/GlassFusedSteelTanks.jsx'
import ChannelPartnerPage from './pages/ChannelPartnerPage.jsx'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage.jsx'
import TermsOfUsePage from './pages/TermsOfUsePage.jsx'

function Pages() {
  const { page } = useNavigation()

  return (
    <main>
      <HomePage active={page === 'home'} />
      <AboutPage active={page === 'about'} />
      <ProductsPage active={page === 'products'} />
      <CataloguePage active={page === 'catalogue'} />
      <ZincalumePage active={page === 'zincalume'} />
      <PipesPage active={page === 'pipes'} />
      {/* <GITanksPage active={page === 'gi'} /> */}
      <ColourBondedPage active={page === 'colour-bonded'} />
      <FusionBondEpoxyTanksPage active={page === 'fusion-bond'} />
      <GlassFusedSteelTanksPage active={page === 'glass-fused'} />
      <ChannelPartnerPage active={page === 'channel-partner'} />
      <ContactPage active={page === 'contact'} />
      <PrivacyPolicyPage active={page === 'privacy'} />
      <TermsOfUsePage active={page === 'terms-of-use'} />
    </main>
  )
}

export default function App() {
  return (
    <NavigationProvider>
      <Nav />
      <Pages />
      <Footer />
    </NavigationProvider>
  )
}
