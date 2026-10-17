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
            <h1>Built to hold<br />Engineered to last</h1>
            <p className="cap-p">A bolted-panel Zincalume Tank, designed, fabricated and installed by DPL Star. Scroll to take it apart.</p>
          </div>
        </div>

        <div className="cap cap-l" data-s=".17" data-e=".36">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>Corrosion Resistant Alloy Coating</h2>
            <p>Advanced alloy coating provides superior protection against rust and corrosion, ensuring longer lifespan.</p>
            <dl className="cap-specs">
              <div>
                <dt>43.5%</dt>
                <dd>ZINC</dd>
              </div>
              <div>
                <dt>55%</dt>
                <dd>ALUMINIUM</dd>
              </div>
              <div>
                <dt>1.5%</dt>
                <dd>SILICON</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="cap cap-r" data-s=".41" data-e=".61">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>Easy to Transport Simple to Assemble</h2>
            <p>Made from AZ150-coated sheets, Zincalume tanks are transported in individual panels and bolted together on-site for easy installation and reliable sealing.</p>
            <dl className="cap-specs">
              <div>
                <dt>AZ150</dt>
                <dd>Material</dd>
              </div>
              <div>
                <dt>HDG</dt>
                <dd>Bolts</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="cap cap-l" data-s=".66" data-e=".84">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>Long Design Life</h2>
            <p>The pre-fabrication technology used in the manufacturing of Zincalume Tanks gives it a long design life of 25+ years.</p>
          </div>
        </div>

        <div className="cap cap-end" data-s=".88" data-e="1.01">
          <div className="cap-in">
            <div className="cap-tag"></div>
            <h2>High Capacity <br/>Storage</h2>
            <p>The water capacity ranges from 5 KL to 5,000 KL.</p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button className="btn btn-p" onClick={() => goTo('products')}>
                Explore Storage Solutions <ArrowIcon />
              </button>
              <button className="btn btn-g" onClick={() => goTo('contact')}>Get Quote</button>
            </div>
          </div>
        </div>

        <div className="dot-nav"><i></i><i></i><i></i><i></i><i></i></div>
        <div className="scroll-cue">SCROLL</div>
      </div>
    </section>
  )
}
