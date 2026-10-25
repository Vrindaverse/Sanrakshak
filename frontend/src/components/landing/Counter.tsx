import { useEffect, useRef } from 'react'
import { useInView } from 'framer-motion'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

interface CounterProps {
  to: number
  pad?: number
  duration?: number
  className?: string
}

export function Counter({ to, pad = 2, duration = 1100, className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  useEffect(() => {
    if (!inView || !ref.current) return
    const counter = { value: 0 }
    const animation = animate(counter, {
      value: to,
      duration,
      ease: 'outCubic',
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = String(Math.round(counter.value)).padStart(pad, '0')
        }
      },
    })
    return () => {
      animation.pause()
    }
  }, [inView, to, pad, duration])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {String(0).padStart(pad, '0')}
    </span>
  )
}
