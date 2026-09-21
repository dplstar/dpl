import './PageHero.css'

export default function PageHero({ tag, heading, body, children }) {
  return (
    <section className="pg-hero">
      <div className="shell">
        <div className="hero-tag">{tag}</div>
        <h1>{heading}</h1>
        <p>{body}</p>
        {children}
      </div>
    </section>
  )
}
