import { useRef } from 'react'
import { useNavigation } from '../NavigationContext.jsx'
import { useTankScene } from '../hooks/useTankScene.js'
import './HeroStory.css'

const ArrowIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
)

export default function HeroStory() {
  const { goTo } = useNavigation()
  const stageRef = useRef(null)
  const glRef = useRef(null)

  useTankScene(stageRef, glRef)

  return (
    <section className="story" id="story" ref={stageRef}>
      <div className="story-pin">
        <div id="gl" ref={glRef}></div>

        <div className="cap cap-hero" data-s="0" data-e=".13">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h1>Built to hold.<br />Engineered to last.</h1>
            <p>A bolted-panel steel tank, drawn, fabricated and installed by one team. Scroll to take it apart.</p>
          </div>
        </div>

        <div className="cap cap-l" data-s=".17" data-e=".36">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>Forty-two ridges of coated steel.</h2>
            <p>Every panel is corrugated for stiffness and coated in AZ150 aluminium-zinc alloy before it ever meets
              water. The profile carries the hoop load; the coating carries the years.</p>
            <dl className="cap-specs">
              <div>
                <dt>AZ150</dt>
                <dd>Alloy coating class</dd>
              </div>
              <div>
                <dt>IS 3396</dt>
                <dd>Design standard</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="cap cap-r" data-s=".41" data-e=".61">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>Ships flat. Bolts together on site.</h2>
            <p>Three tiers, eight panels each, one roof. The whole tank leaves the factory on a single truck and goes
              up without welding — every seam a bolted, gasket-sealed joint that can be inspected and re-torqued.</p>
            <dl className="cap-specs">
              <div>
                <dt>24</dt>
                <dd>Wall panels</dd>
              </div>
              <div>
                <dt>0</dt>
                <dd>Site welds</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="cap cap-l" data-s=".66" data-e=".84">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>Every outlet is a flanged joint.</h2>
            <p>Nozzles are flanged, gasketed and bolted to the panel, not cut into it after the fact — so a pump swap
              or a pipe re-route never means a new tank.</p>
          </div>
        </div>

        <div className="cap cap-end" data-s=".88" data-e="1.01">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>From 5,000 to<br />5,00,000 litres.</h2>
            <p>Sized to the site, not the catalogue.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-p" onClick={() => goTo('products')}>
                View storage tanks <ArrowIcon />
              </button>
              <button className="btn btn-g" onClick={() => goTo('contact')}>Talk to engineering</button>
            </div>
          </div>
        </div>

        <div className="dot-nav"><i></i><i></i><i></i><i></i><i></i></div>
        <div className="scroll-cue">SCROLL</div>
      </div>
    </section>
  )
}
