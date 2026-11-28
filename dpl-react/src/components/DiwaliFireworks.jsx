
import { useEffect, useRef } from 'react'

export default function WinterAnimation() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let animationFrame
    let running = true
    let width = window.innerWidth
    let height = window.innerHeight

    const SNOW_COUNT = 65
    const SPARKLE_COUNT = 25

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr

      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const snowflakes = Array.from({ length: SNOW_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speed: 0.25 + Math.random() * 0.8,
      drift: Math.random() * 0.3 - 0.15,
      opacity: 0.2 + Math.random() * 0.5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.01
    }))

    const sparkles = Array.from({ length: SPARKLE_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5,
      speed: Math.random() * 0.3 + 0.1
    }))

    function drawSnowflake(flake) {
      ctx.save()

      ctx.translate(flake.x, flake.y)
      ctx.rotate(flake.rotation)

      ctx.strokeStyle = `rgba(255,255,255,${flake.opacity})`
      ctx.lineWidth = 1
      ctx.lineCap = 'round'

      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3)

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(0, -flake.radius * 2.5)
        ctx.stroke()

        if (flake.radius > 1.8) {
          ctx.beginPath()
          ctx.moveTo(0, -flake.radius * 1.5)
          ctx.lineTo(-flake.radius * 0.6, -flake.radius * 2)

          ctx.moveTo(0, -flake.radius * 1.5)
          ctx.lineTo(flake.radius * 0.6, -flake.radius * 2)

          ctx.stroke()
        }
      }

      ctx.restore()
    }

    function drawSparkle(sparkle, time) {
      const pulse =
        0.3 + Math.abs(Math.sin(time * 0.001 + sparkle.x)) * 0.5

      ctx.beginPath()

      ctx.arc(
        sparkle.x,
        sparkle.y,
        sparkle.radius,
        0,
        Math.PI * 2
      )

      ctx.fillStyle = `rgba(255,255,255,${sparkle.opacity * pulse})`
      ctx.fill()
    }

    function animate(time) {
      if (!running) return

      ctx.clearRect(0, 0, width, height)

      const wind = Math.sin(time * 0.0003) * 0.25

      // Snowfall animation
      snowflakes.forEach((flake) => {
        flake.y += flake.speed
        flake.x += flake.drift + wind

        flake.rotation += flake.rotationSpeed

        if (flake.y > height + 10) {
          flake.y = -10
          flake.x = Math.random() * width
        }

        if (flake.x > width + 10) {
          flake.x = -10
        }

        if (flake.x < -10) {
          flake.x = width + 10
        }

        drawSnowflake(flake)
      })

      // Glowing sparkle animation
      sparkles.forEach((sparkle) => {
        sparkle.y += sparkle.speed

        if (sparkle.y > height) {
          sparkle.y = 0
          sparkle.x = Math.random() * width
        }

        drawSparkle(sparkle, time)
      })

      animationFrame = requestAnimationFrame(animate)
    }

    resize()

    window.addEventListener('resize', resize)

    animationFrame = requestAnimationFrame(animate)

    return () => {
      running = false

      cancelAnimationFrame(animationFrame)

      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="winter-animation"
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
