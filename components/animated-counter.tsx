"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  /** Target value to count up to */
  value: number
  /** Duration in milliseconds */
  duration?: number
  /** Suffix text (e.g., "+", "%", "x") */
  suffix?: string
  /** Prefix text (e.g., "R$") */
  prefix?: string
  /** Number of decimal places */
  decimals?: number
  /** Additional CSS classes */
  className?: string
  /** Whether to animate (e.g., only when visible) */
  animate?: boolean
}

export function AnimatedCounter({
  value,
  duration = 2000,
  suffix = "",
  prefix = "",
  decimals = 0,
  className = "",
  animate = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!animate || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [animate, hasAnimated])

  useEffect(() => {
    if (!hasAnimated && animate) return
    if (!animate) {
      setDisplayValue(value)
      return
    }

    let start = 0
    const startTime = performance.now()
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      const current = easedProgress * value

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [value, duration, hasAnimated, animate])

  const formattedValue = decimals > 0
    ? displayValue.toFixed(decimals)
    : Math.round(displayValue).toLocaleString("pt-BR")

  return (
    <span ref={ref} className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  )
}
