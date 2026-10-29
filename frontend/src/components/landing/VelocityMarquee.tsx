import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { cn } from '@/lib/utils'

interface VelocityMarqueeProps {
  items: string[]
  baseVelocity?: number
  className?: string
}

export function VelocityMarquee({ items, baseVelocity = 56, className }: VelocityMarqueeProps) {
  const baseX = useMotionValue(0)
  const groupRef = useRef<HTMLDivElement>(null)
  const groupWidth = useRef(0)
  const direction = useRef(1)
  const [mobile, setMobile] = useState(false)
  const [hidden, setHidden] = useState(false)
  const reduceMotion = useReducedMotion()

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 80, stiffness: 200 })
  const velocityFactor = useTransform(smoothVelocity, [0, 1400], [0, 2.6], { clamp: false })

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const element = groupRef.current
    if (!element) return
    const observer = new ResizeObserver(() => {
      groupWidth.current = element.offsetWidth
    })
    observer.observe(element)
    groupWidth.current = element.offsetWidth
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  useAnimationFrame((_, delta) => {
    if (reduceMotion || hidden) return

    const factor = mobile ? 0 : velocityFactor.get()
    if (factor < -0.05) direction.current = -1
    else if (factor > 0.05) direction.current = 1

    let moveBy = direction.current * baseVelocity * (delta / 1000)
    moveBy += direction.current * moveBy * Math.abs(factor)

    let next = baseX.get() + moveBy
    const width = groupWidth.current
    if (width > 0) {
      if (next <= -width) next += width
      if (next > 0) next -= width
    }
    baseX.set(next)
  })

  const content = [...items, ...items, ...items]

  return (
    <div className={cn('marquee-viewport border-y border-white/[0.07] py-6 md:py-8', className)} aria-hidden="true">
      <motion.div className="marquee-track" style={{ x: baseX }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="marquee-group" ref={copy === 0 ? groupRef : undefined}>
            {content.map((item, index) => (
              <span key={`${copy}-${index}`} className="flex items-center">
                <span className="type-display px-6 text-[clamp(2.2rem,5.4vw,4.8rem)] leading-none tracking-[-0.02em] text-foreground/90 md:px-10">
                  {item}
                </span>
                <span className="h-2 w-2 shrink-0 rotate-45 bg-acid/70" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
