import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduceMotion = useReducedMotion()
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.3 })
  const scaleX = reduceMotion ? scrollYProgress : smooth

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[70] h-px origin-left bg-gradient-to-r from-acid via-ice to-acid shadow-[0_0_14px_oklch(0.9_0.18_130_/_0.5)]"
    />
  )
}
