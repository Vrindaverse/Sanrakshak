import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'
import { EASE_OUT_EXPO, EASE_OUT_SOFT } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface AnimatedPageProps {
  children: ReactNode
  className?: string
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  const { pathname } = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8, transition: { duration: 0.18, ease: EASE_OUT_SOFT } }}
        transition={{ duration: 0.42, ease: EASE_OUT_EXPO }}
        className={cn('will-change-transform', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
