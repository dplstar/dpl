import './ContactDetails.css'

const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
)

const MailIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    <polyline points="22 6 12 13 2 6" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--signal)" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export default function ContactDetails() {
  return (
    <div>
      <div className="ct-block">
        <h4>Registered office</h4>
        <div className="foot-row">
          <PinIcon />
          <span>DPL Global Private Limited, A-58, Industrial Area, Sikandrabad, Bulandshahar, Uttar Pradesh – 203205</span>
        </div>
        <div className="foot-row"><PhoneIcon /><span>+91 92056 00125</span></div>
        <div className="foot-row"><MailIcon /><span>info@dplstar.com</span></div>
      </div>

      <div className="ct-block">
        <h4>Factory location</h4>
        <iframe
          className="map-fr"
          title="DPL Star factory"
          loading="lazy"
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.1137156403233!2d77.66366757346228!3d28.476121837593162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390cbd506a008249%3A0xe4cac1f93ce74d4d!2sA-58%20DPL%20GLOBAL%20PVT.%20LIMITED!5e0!3m2!1sen!2sin!4v1703922593707!5m2!1sen!2sin"
        ></iframe>
      </div>

      <div className="ct-block">
        <h4>What happens next</h4>
        <div className="foot-row"><CheckIcon /><span>Engineering reviews your capacity and site inputs</span></div>
        <div className="foot-row"><CheckIcon /><span>You get a tank type and rough spec within 2 working days</span></div>
        <div className="foot-row"><CheckIcon /><span>Site survey scheduled once the spec is confirmed</span></div>
      </div>
    </div>
  )
}
