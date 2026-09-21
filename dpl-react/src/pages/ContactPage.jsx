import PageHero from '../components/PageHero.jsx'
import ContactForm from '../components/ContactForm.jsx'
import ContactDetails from '../components/ContactDetails.jsx'
import './ContactPage.css'

export default function ContactPage({ active }) {
  return (
    <div className={`page${active ? ' active' : ''}`} data-page="contact">
      <PageHero
        tag="Contact"
        heading="Build a better tomorrow, today."
        body="Send site details and rough capacity — our engineering team responds with a tank recommendation, not a sales script."
      />

      <section className="sec">
        <div className="shell">
          <div className="ct-grid">
            <div>
              <ContactForm />
            </div>
            <ContactDetails />
          </div>
        </div>
      </section>
    </div>
  )
}
