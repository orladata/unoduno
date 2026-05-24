"use client"

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

function Skeleton({ className, ...props }: React.ComponentProps<typeof motion.div>) {
  return (
    <motion.div
      data-slot="skeleton"
      className={cn('relative overflow-hidden bg-accent/30 rounded-md', className)}
      {...props}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  )
}

export { Skeleton }
