'use client'

import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

const COLORS = ['#7c3aed', '#3b82f6', '#06b6d4', '#10b981', '#a78bfa']

export function Particles({
  count = 60,
  className = '',
}: {
  count?: number
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef<number>(0)

  const makeParticle = (w: number, h: number): Particle => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.4 - 0.1,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: 0,
    maxLife: Math.random() * 300 + 150,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const { width: w, height: h } = canvas
    particlesRef.current = Array.from({ length: count }, () => makeParticle(w, h))

    const draw = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      particlesRef.current.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.life++

        const fade = Math.sin((p.life / p.maxLife) * Math.PI)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity * fade
        ctx.fill()

        if (p.life >= p.maxLife || p.y < -5 || p.x < -5 || p.x > width + 5) {
          particlesRef.current[i] = makeParticle(width, height)
        }
      })

      ctx.globalAlpha = 1
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [count])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
