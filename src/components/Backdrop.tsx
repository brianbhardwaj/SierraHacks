import { useEffect, useRef } from 'react'

export type BackdropMode = 'meadow' | 'wetland' | 'field' | 'letters' | 'alert' | 'garden' | 'chat'

type Mouse = { x: number; y: number; on: boolean }
type Ripple = { x: number; y: number; r: number; life: number }
type Dot = { x: number; y: number; vx: number; vy: number; r: number; a: number; ph: number; rot: number; vr: number; hue: number }

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

function makeDots(n: number, w: number, h: number, rMin: number, rMax: number): Dot[] {
  return Array.from({ length: n }, () => ({
    x: rnd(0, w), y: rnd(0, h), vx: rnd(-0.2, 0.2), vy: rnd(-0.5, -0.1),
    r: rnd(rMin, rMax), a: rnd(0.25, 0.8), ph: rnd(0, 6.28), rot: rnd(0, 6.28), vr: rnd(-0.02, 0.02), hue: rnd(0, 1),
  }))
}

/** Interactive animated canvas. Each page passes a different mode. */
export function Backdrop({ mode }: { mode: BackdropMode }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0, h = 0, raf = 0, t = 0
    const mouse: Mouse = { x: -999, y: -999, on: false }
    let ripples: Ripple[] = []
    let petals: Dot[] = []
    let dots: Dot[] = []

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const small = w < 700
      const count = { meadow: 70, wetland: 36, field: 0, letters: 14, alert: 0, garden: 46, chat: 30 }[mode]
      const sizes: Record<BackdropMode, [number, number]> = {
        meadow: [1.5, 4], wetland: [3, 12], field: [1, 2], letters: [16, 28], alert: [1, 2], garden: [5, 10], chat: [6, 26],
      }
      dots = makeDots(small ? Math.round(count * 0.6) : count, w, h, ...sizes[mode])
    }

    const move = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.on = true }
    const leave = () => { mouse.on = false; mouse.x = mouse.y = -999 }
    const down = (e: PointerEvent) => {
      const el = e.target as HTMLElement
      if (el.closest('a,button,input,textarea,select,summary,label')) return
      ripples.push({ x: e.clientX, y: e.clientY, r: 4, life: 1 })
      if (mode === 'meadow' || mode === 'garden') {
        for (let i = 0; i < 14; i++) {
          const a = rnd(0, 6.28), s = rnd(1, 3.5)
          petals.push({ x: e.clientX, y: e.clientY, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, r: rnd(4, 8), a: 1, ph: 0, rot: a, vr: rnd(-0.1, 0.1), hue: Math.random() })
        }
      }
    }

    const petal = (d: Dot, fill: string) => {
      ctx.save()
      ctx.translate(d.x, d.y)
      ctx.rotate(d.rot)
      ctx.fillStyle = fill
      ctx.beginPath()
      ctx.ellipse(0, 0, d.r, d.r * 0.55, 0, 0, 6.28)
      ctx.fill()
      ctx.restore()
    }

    const push = (d: Dot, radius: number, force: number, attract = false) => {
      const dx = d.x - mouse.x, dy = d.y - mouse.y
      const dist = Math.hypot(dx, dy)
      if (dist < radius && dist > 0.01) {
        const f = ((radius - dist) / radius) * force * (attract ? -1 : 1)
        d.vx += (dx / dist) * f
        d.vy += (dy / dist) * f
      }
    }

    const wrap = (d: Dot, pad = 30) => {
      if (d.x < -pad) d.x = w + pad
      if (d.x > w + pad) d.x = -pad
      if (d.y < -pad) d.y = h + pad
      if (d.y > h + pad) d.y = -pad
    }

    const drawRipples = (col: string) => {
      ripples = ripples.filter((r) => r.life > 0)
      for (const r of ripples) {
        r.r += 3
        r.life -= 0.012
        ctx.strokeStyle = col
        ctx.globalAlpha = Math.max(r.life, 0) * 0.6
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, 6.28)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }

    const frame = () => {
      t += 0.016
      ctx.clearRect(0, 0, w, h)

      if (mode === 'meadow') {
        // soft glowing blobs
        for (let i = 0; i < 3; i++) {
          const x = w * (0.2 + 0.3 * i) + Math.sin(t * 0.3 + i * 2) * 80
          const y = h * (0.3 + 0.2 * Math.sin(i)) + Math.cos(t * 0.25 + i) * 60
          const g = ctx.createRadialGradient(x, y, 0, x, y, 320)
          g.addColorStop(0, i === 1 ? 'rgba(255,226,140,0.30)' : 'rgba(120,214,160,0.28)')
          g.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.fillStyle = g
          ctx.fillRect(0, 0, w, h)
        }
        for (const d of dots) {
          d.ph += 0.02
          d.vx += Math.sin(d.ph) * 0.004
          push(d, 170, 0.06, true)
          d.vx *= 0.985; d.vy = d.vy * 0.985 + -0.002
          d.x += d.vx; d.y += d.vy
          wrap(d)
          const glow = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4)
          const warm = d.hue > 0.5
          glow.addColorStop(0, warm ? 'rgba(255,214,100,0.9)' : 'rgba(255,255,255,0.95)')
          glow.addColorStop(1, 'rgba(255,255,255,0)')
          ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(d.ph * 2))
          ctx.fillStyle = glow
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 4, 0, 6.28); ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      if (mode === 'wetland') {
        const layers = [
          { y: 0.62, a: 22, f: 0.006, s: 0.8, c: 'rgba(120,206,196,0.20)' },
          { y: 0.72, a: 30, f: 0.005, s: -0.6, c: 'rgba(90,190,170,0.22)' },
          { y: 0.82, a: 24, f: 0.007, s: 0.5, c: 'rgba(60,170,140,0.22)' },
          { y: 0.92, a: 18, f: 0.009, s: -0.9, c: 'rgba(47,158,99,0.20)' },
        ]
        for (const L of layers) {
          ctx.fillStyle = L.c
          ctx.beginPath()
          ctx.moveTo(0, h)
          for (let x = 0; x <= w; x += 12) {
            const near = mouse.on ? Math.max(0, 1 - Math.abs(x - mouse.x) / 220) * 26 * Math.sin(t * 4 + x * 0.04) : 0
            ctx.lineTo(x, h * L.y + Math.sin(x * L.f + t * L.s) * L.a + near)
          }
          ctx.lineTo(w, h)
          ctx.closePath()
          ctx.fill()
        }
        for (const d of dots) {
          d.ph += 0.03
          d.x += Math.sin(d.ph) * 0.4 + d.vx
          d.y += d.vy * 0.8
          push(d, 120, 0.12)
          d.vx *= 0.98
          if (d.y < -20) { d.y = h + 20; d.x = rnd(0, w) }
          ctx.strokeStyle = 'rgba(255,255,255,0.9)'
          ctx.fillStyle = 'rgba(255,255,255,0.25)'
          ctx.globalAlpha = d.a
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28); ctx.fill(); ctx.stroke()
        }
        ctx.globalAlpha = 1
        drawRipples('rgba(47,158,99,1)')
      }

      if (mode === 'field') {
        const gap = w < 700 ? 34 : 28
        ctx.lineCap = 'round'
        for (let x = gap / 2; x < w; x += gap) {
          for (let y = gap / 2; y < h; y += gap) {
            let ang = Math.sin(x * 0.01 + t * 0.9) * 0.45 + Math.cos(y * 0.012 + t * 0.7) * 0.3 - Math.PI / 2
            if (mouse.on) {
              const dx = mouse.x - x, dy = mouse.y - y
              const dist = Math.hypot(dx, dy)
              if (dist < 200) ang += (Math.atan2(dy, dx) + Math.PI / 2 - ang) * (1 - dist / 200) * 0.7
            }
            const len = 13
            ctx.strokeStyle = (x + y) % 3 < 1 ? 'rgba(47,158,99,0.26)' : 'rgba(120,150,70,0.20)'
            ctx.lineWidth = 2.2
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
            ctx.stroke()
          }
        }
        drawRipples('rgba(47,158,99,1)')
      }

      if (mode === 'letters') {
        for (const d of dots) {
          d.ph += 0.02
          d.x += d.vx * 0.6 + Math.sin(d.ph) * 0.3
          d.y += d.vy * 0.7
          d.rot += d.vr * 0.4
          push(d, 160, 0.18)
          d.vx *= 0.97
          if (d.y < -40) { d.y = h + 40; d.x = rnd(0, w) }
          wrap(d, 40)
          ctx.save()
          ctx.translate(d.x, d.y)
          ctx.rotate(Math.sin(d.rot) * 0.5)
          ctx.globalAlpha = d.a * 0.8
          const ew = d.r * 1.8, eh = d.r * 1.2
          ctx.fillStyle = 'rgba(255,255,255,0.92)'
          ctx.strokeStyle = 'rgba(47,158,99,0.55)'
          ctx.lineWidth = 1.6
          ctx.beginPath(); ctx.roundRect(-ew / 2, -eh / 2, ew, eh, 4); ctx.fill(); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(-ew / 2, -eh / 2); ctx.lineTo(0, 2); ctx.lineTo(ew / 2, -eh / 2); ctx.stroke()
          ctx.restore()
        }
        ctx.globalAlpha = 1
        drawRipples('rgba(47,158,99,1)')
      }

      if (mode === 'alert') {
        const centers = [[0.2, 0.3], [0.8, 0.25], [0.55, 0.8]]
        centers.forEach(([cx, cy], i) => {
          for (let k = 0; k < 4; k++) {
            const p = ((t * 0.12 + k / 4 + i * 0.3) % 1)
            ctx.strokeStyle = i === 1 ? 'rgba(240,170,60,1)' : 'rgba(47,158,99,1)'
            ctx.globalAlpha = (1 - p) * 0.28
            ctx.lineWidth = 2
            ctx.beginPath(); ctx.arc(w * cx, h * cy, p * 260, 0, 6.28); ctx.stroke()
          }
        })
        ctx.globalAlpha = 1
        if (mouse.on && Math.random() < 0.07) ripples.push({ x: mouse.x, y: mouse.y, r: 4, life: 0.8 })
        drawRipples('rgba(47,158,99,1)')
      }

      if (mode === 'garden') {
        for (const d of dots) {
          d.ph += 0.02
          d.vy += 0.003
          d.vx += Math.sin(d.ph) * 0.01
          push(d, 200, 0.2)
          d.vx *= 0.985; d.vy = Math.min(d.vy * 0.99, 1.2)
          d.x += d.vx + 0.15; d.y += Math.max(d.vy, 0.25)
          d.rot += d.vr
          if (d.y > h + 20) { d.y = -20; d.x = rnd(0, w); d.vy = 0.3 }
          wrap(d, 20)
          ctx.globalAlpha = d.a
          petal(d, d.hue < 0.33 ? 'rgba(255,255,255,0.95)' : d.hue < 0.66 ? 'rgba(247,196,205,0.9)' : 'rgba(255,224,130,0.9)')
        }
        ctx.globalAlpha = 1
      }

      if (mode === 'chat') {
        for (const d of dots) {
          d.ph += 0.025
          d.x += Math.sin(d.ph) * 0.35 + d.vx * 0.5
          d.y += d.vy * 0.7
          push(d, 130, 0.14)
          d.vx *= 0.97
          if (d.y < -40) { d.y = h + 40; d.x = rnd(0, w) }
          ctx.globalAlpha = d.a * 0.55
          ctx.fillStyle = 'rgba(255,255,255,0.7)'
          ctx.strokeStyle = 'rgba(47,158,99,0.4)'
          ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 6.28); ctx.fill(); ctx.stroke()
        }
        ctx.globalAlpha = 1
        drawRipples('rgba(47,158,99,1)')
      }

      // click petals (meadow + garden)
      petals = petals.filter((p) => p.a > 0.02)
      for (const p of petals) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.vx *= 0.98; p.rot += p.vr; p.a -= 0.012
        ctx.globalAlpha = p.a
        petal(p, p.hue < 0.5 ? 'rgba(255,255,255,0.95)' : 'rgba(247,196,205,0.95)')
      }
      ctx.globalAlpha = 1

      if (!reduce) raf = requestAnimationFrame(frame)
    }

    resize()
    frame()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', down)
    document.addEventListener('pointerleave', leave)
    const vis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden && !reduce) raf = requestAnimationFrame(frame)
    }
    document.addEventListener('visibilitychange', vis)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      document.removeEventListener('pointerleave', leave)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [mode])

  return <canvas ref={ref} className="backdrop" aria-hidden="true" />
}
