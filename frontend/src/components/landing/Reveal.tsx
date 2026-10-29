import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { EASE_OUT_SOFT, staggerContainer } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
}

export function Reveal({ children, className, delay = 0, y = 26, once = true }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-12% 0px -8% 0px' }}
      transition={{ duration: 0.75, ease: EASE_OUT_SOFT, delay }}
    >
      {children}
    </motion.div>
  )
}

interface StaggerProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function Stagger({ children, className, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -8% 0px' }}
      variants={staggerContainer(0.08, delay)}
    >
      {children}
    </motion.div>
  )
}
