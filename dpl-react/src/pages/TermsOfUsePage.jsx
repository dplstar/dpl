import { useNavigation } from '../NavigationContext.jsx'
import PageHero from '../components/PageHero.jsx'
import './PrivacyPolicyPage.css'

export default function TermsOfUsePage({ active }) {
  const { goTo } = useNavigation()

  return (
    <div className={`page privacy-page${active ? ' active' : ''}`} data-page="terms-of-use">
      <PageHero
        tag="Terms of Use"
        heading="The terms that guide this website."
        body="Please read these Terms of Use carefully. They govern your access to and use of the DPL Global website."
      />

      <section className="privacy-content sec">
        <div className="shell">
          <div className="privacy-layout">
            <aside className="privacy-aside">
              <span className="privacy-label">DPL Global Private Limited</span>
              <p>These terms explain the rights, responsibilities and conditions that apply when you use our website.</p>
            </aside>

            <div className="privacy-copy">
              <p className="privacy-lead">By using our website, you agree to these Terms of Use. If you do not agree to them for any reason, please stop using the website.</p>

              <p>“We”, “us” and “our” mean DPL Global Private Limited. We may refer to you, or any person who uses our website, as “you”, “your” or a “user”. When we use the term “website”, we mean all individual URLs or internet address locations, sites and pages within our domain and the materials provided with our websites. This includes, without limitation, our applications, content, information, graphics, multimedia materials, code, logos, services and trademarks, designs, copyrightable or otherwise legally protectable items and elements, and all features, functions, tools and services in, on or associated with our website.</p>

              <p>These Terms of Use incorporate by reference and form part of our terms for all purposes, including our <a href="/privacy" onClick={(e) => { e.preventDefault(); goTo('privacy') }}>Privacy Policy</a> and any other terms we disclose or bring to your attention when you use or attempt to use our website.</p>

              <h2>License</h2>
              <p>Except as otherwise specifically permitted, under no circumstances may you use the website in a manner that exceeds the rights granted for your use. You may not use data mining, robots or similar data-gathering and extraction tools on the website. You are not authorised to duplicate this website or any page or database. Reproducing any content herein is not permitted by way of reprinting, redistributing, storing, publicly displaying or transmitting it in any manner.</p>

              <h2>Proprietary rights</h2>
              <p>You acknowledge and agree that the website is and shall remain the exclusive property of DPL Global Private Limited. All rights are reserved. DPL Global Private Limited owns the copyright in the contents of the website as its work. DPL Global Private Limited and all names, taglines, slogans, logos and icons identifying DPL Global Private Limited and its services are proprietary trademarks of DPL Global Private Limited. You are prohibited from using those marks without the express written permission of DPL Global Private Limited.</p>

              <h2>Third-party content and links</h2>
              <p>Certain areas of this site may feature or include content by third parties or links to third parties, including through embedded plug-ins, apps and social media sites. DPL Global Private Limited is not responsible for such content, which may be governed by the privacy policies of those parties.</p>

              <h2>No warranty</h2>
              <p>The information, services, products, software and materials available on this site are provided without any warranty. We exclude all express or implied warranties, including that the site or any content is free of defects or viruses, able to operate on an uninterrupted basis, or that any defect will be corrected. DPL Global Private Limited does not warrant or represent that this site will be error-free or uninterrupted, or that defects will be corrected. Nothing in this agreement is intended to affect any applicable rights you may have under local law.</p>

              <h2>Disclaimer</h2>
              <p>This website may include errors, omissions or other inaccuracies, and you assume the sole risk of making use of the website.</p>
              <p>DPL Global Private Limited may modify all or any part of this website at any time and for any reason. Changes are effective after we post them or notify you. If you use our website, you agree to be bound by these Terms of Use, including all changes we post. You are encouraged to check back here frequently for updates.</p>
              <p>DPL Global Private Limited has the right to discontinue, suspend or terminate this website or your use of it at any time if it determines that your use may violate these Terms of Use.</p>

              <h2>Disputes</h2>
              <p>These Terms of Use and your use of our website shall be construed, governed by and enforced under the substantive laws of India, without regard to its conflict-of-law provisions. You agree to submit to the exclusive personal jurisdiction of Delhi, India, for the purpose of litigating any and all disputes arising out of these Terms of Use or your use of the website.</p>

              <h2>Liability</h2>
              <p>We will not be liable to you for any lost profits, lost data or other consequential, special, indirect or incidental damages arising out of your use of this website or in connection with these Terms of Use.</p>

              <h2>Contact</h2>
              <p>For questions about these Terms of Use, contact us at <a href="tel:+919205600125">+91 92056 00125</a> or <a href="mailto:info@dplstar.com">info@dplstar.com</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}