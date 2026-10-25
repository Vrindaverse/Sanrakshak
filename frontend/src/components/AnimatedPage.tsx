import { type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <div className={cn('animate-fade-in', className)}>
      {children}
    </div>
  )
}

interface AnimateOnViewProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimateOnView({ children, className, delay = 0 }: AnimateOnViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [delay])

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0 translate-y-4 transition-all duration-500 ease-out',
        visible && 'opacity-100 translate-y-0',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CountUpProps {
  end: number
  duration?: number
  className?: string
}

export function CountUp({ end, duration = 1000, className }: CountUpProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    let frame: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * end))
      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [started, end, duration])

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  )
}
