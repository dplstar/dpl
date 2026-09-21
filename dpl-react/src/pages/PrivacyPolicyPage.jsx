import PageHero from '../components/PageHero.jsx'
import './PrivacyPolicyPage.css'

export default function PrivacyPolicyPage({ active }) {
  return (
    <div className={`page privacy-page${active ? ' active' : ''}`} data-page="privacy">
      <PageHero
        tag="Privacy Policy"
        heading="Your information, handled responsibly."
        body="How DPL Global Private Limited collects, uses, protects and manages personal information across our website and services."
      />

      <section className="privacy-content sec">
        <div className="shell">
          <div className="privacy-layout">
            <aside className="privacy-aside">
              <span className="privacy-label">DPL Global Private Limited</span>
              <p>Clear, transparent data practices for everyone who visits, contacts or works with us.</p>
            </aside>

            <div className="privacy-copy">
              <p className="privacy-lead">You entrust us with your personal information when you use our services. We recognise that this is a significant duty, and we work hard to protect the data we use to provide better services, keep them functioning properly and resolve issues you report.</p>

              <h2>What this policy covers</h2>
              <p>This Privacy Policy explains the kind of information we collect, why we gather it and how we manage it. It covers DPL operations involving the collection, use, disclosure and other processing of personal information on this website, when managing relationships with the public and when interacting with:</p>
              <ul>
                <li>Visitors to our website</li>
                <li>Individuals who share information while contacting DPL</li>
                <li>Individuals who request information or resources</li>
              </ul>

              <p>At DPL, we are committed to being clear and transparent about how we process personal information. We will not collect more personal information than is needed to accomplish the purposes described in this policy, and will not retain it longer than necessary to fulfil those purposes.</p>

              <h2>Information we collect</h2>
              <p>We may collect browser type, IP address, operating system, the date and time of visits, pages visited, time spent viewing the site and return visits. We use this information to understand website usage, analyse trends and optimise the website experience. We also store IP addresses for fraud detection and prevention.</p>

              <h2>How we use information you provide</h2>
              <p>When visitors provide personal information, such as contact information, we may use it to:</p>
              <ul>
                <li>Communicate with and respond to inquiries and requests</li>
                <li>Provide updates by email</li>
                <li>Conduct surveys</li>
              </ul>

              <p>We do not rent, sell, share or otherwise make personal information available to third parties for advertising or marketing purposes. We may disclose information if required by law, or to service providers helping us resolve a complaint.</p>

              <h2>Third parties</h2>
              <p>This website contains links to other websites and apps not owned or managed by DPL. We are not responsible for the privacy practices of those, or any other, websites or apps.</p>

              <h2>Data safety</h2>
              <p>We use all reasonable available procedures to protect personal information. However, we cannot guarantee the security of our databases or that information provided to us will not be intercepted while being transmitted over the internet.</p>
              <p>DPL Global Private Limited is an Indian company following Indian law. Personal information transmitted to us by service providers in jurisdictions where we do not operate may not receive the same level of privacy protection available to you there. By sharing information with us, you acknowledge any such transfer, storage or use.</p>

              <h2>Changes to this policy</h2>
              <p>As our company and services evolve, this Privacy Policy may be revised from time to time. We reserve the right to amend it at any time and for any reason. Whenever we change this policy, we post the changes here.</p>

              <h2>Queries</h2>
              <p>For questions about this Privacy Policy, contact us at <a href="mailto:info@dplstar.com">info@dplstar.com</a> or <a href="tel:+919205600125">+91 92056 00125</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}