
import { useEffect, useRef } from 'react'

export default function DiwaliFireworks({ duration = 12000 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let rockets = []
    let particles = []
    let frameId
    let lastLaunch = 0
    let running = true

    const startTime = performance.now()

    const colors = [
      '#FFD76A',
      '#FFF4CE',
      '#FFB347',
      '#FF7043',
      '#F8D477'
    ]

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function launchRocket() {
      const x = window.innerWidth * (0.1 + Math.random() * 0.8)

      rockets.push({
        x,
        y: window.innerHeight + 5,
        oldX: x,
        oldY: window.innerHeight,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -(8 + Math.random() * 3),
        targetY: window.innerHeight * (0.15 + Math.random() * 0.4),
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    function explode(x, y, color) {
      const count = 100

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.5 + Math.random() * 4.5

        particles.push({
          x, y,
          oldX: x,
          oldY: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          gravity: 0.045,
          drag: 0.982,
          life: 1,
          decay: 0.006 + Math.random() * 0.009,
          color,
          size: 0.8 + Math.random() * 1.5
        })
      }
    }

    function animate(now) {
      if (!running) return

      // Fade old frames to create light trails
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.globalCompositeOperation = 'lighter'

      // Launch rockets for the configured duration
      if (
        now - lastLaunch > 600 + Math.random() * 400 &&
        now - startTime < duration
      ) {
        launchRocket()
        lastLaunch = now
      }

      rockets = rockets.filter(rocket => {
        rocket.oldX = rocket.x
        rocket.oldY = rocket.y

        rocket.x += rocket.vx
        rocket.y += rocket.vy
        rocket.vy += 0.035

        ctx.beginPath()
        ctx.moveTo(rocket.oldX, rocket.oldY)
        ctx.lineTo(rocket.x, rocket.y)
        ctx.strokeStyle = rocket.color
        ctx.lineWidth = 2
        ctx.stroke()

        if (rocket.y <= rocket.targetY || rocket.vy >= 0) {
          explode(rocket.x, rocket.y, rocket.color)
          return false
        }

        return true
      })

      particles = particles.filter(p => {
        p.oldX = p.x
        p.oldY = p.y

        p.x += p.vx
        p.y += p.vy
        p.vx *= p.drag
        p.vy = p.vy * p.drag + p.gravity
        p.life -= p.decay

        if (p.life <= 0) return false

        ctx.globalAlpha = p.life
        ctx.strokeStyle = p.color
        ctx.lineWidth = p.size * p.life
        ctx.lineCap = 'round'

        ctx.beginPath()
        ctx.moveTo(p.oldX, p.oldY)
        ctx.lineTo(p.x, p.y)
        ctx.stroke()

        return true
      })

      ctx.globalAlpha = 1
      ctx.globalCompositeOperation = 'source-over'

      if (
        now - startTime >= duration &&
        rockets.length === 0 &&
        particles.length === 0
      ) {
        running = false
        window.removeEventListener('resize', resize)
        return
      }

      frameId = requestAnimationFrame(animate)
    }

    resize()
    window.addEventListener('resize', resize)
    frameId = requestAnimationFrame(animate)

    return () => {
      running = false
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
    }
  }, [duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  )
}
