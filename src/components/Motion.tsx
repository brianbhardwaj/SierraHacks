import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'

/** Fades and lifts children into view when scrolled to. */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const ref = useRef<HTMLElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0, rootMargin: '0px 0px -60px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const style = { '--d': `${delay}ms` } as CSSProperties
  return (
    <Tag
      ref={ref as never}
      className={`reveal${shown ? ' in' : ''} ${className}`}
      style={style}
    >
      {children}
    </Tag>
  )
}

/** Counts up to a number the first time it is visible. */
export function Count({ to, suffix = '', duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [val, setVal] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      if (reduce) return setVal(to)
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min((now - start) / duration, 1)
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, duration])

  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  )
}

/** Letters pop in one at a time. */
export function Wave({ text }: { text: string }) {
  return (
    <span aria-label={text}>
      {text.split('').map((c, i) => (
        <span key={i} className="wave" aria-hidden="true" style={{ animationDelay: `${i * 70}ms` }}>
          {c}
        </span>
      ))}
    </span>
  )
}
