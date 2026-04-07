'use client'

import { motion, useMotionValue, useTransform } from 'motion/react'
import { type ReactNode, useRef, useEffect, useState } from 'react'

// Scroll-triggered fade-in (replaces static content)
export function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  className?: string
}) {
  const offset = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...offset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger container — wraps children that each get FadeIn
export function StaggerContainer({
  children,
  className = '',
  stagger = 0.1,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={{
        visible: { transition: { staggerChildren: stagger } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// 3D tilt on hover
export function TiltCard({
  children,
  className = '',
  maxTilt = 5,
}: {
  children: ReactNode
  className?: string
  maxTilt?: number
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt])
  const rotateY = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt])

  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      whileHover={{ scale: 1.02 }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set((e.clientX - rect.left) / rect.width - 0.5)
        y.set((e.clientY - rect.top) / rect.height - 0.5)
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Animated counter
export function AnimatedCounter({
  target,
  suffix = '',
  prefix = '',
  className = '',
  duration = 2,
}: {
  target: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    if (!ref.current || hasAnimated) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const step = target / (duration * 60)
          const timer = setInterval(() => {
            start += step
            if (start >= target) {
              if (ref.current) ref.current.textContent = `${prefix}${target}${suffix}`
              clearInterval(timer)
            } else {
              if (ref.current) ref.current.textContent = `${prefix}${Math.floor(start)}${suffix}`
            }
          }, 1000 / 60)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, suffix, prefix, duration, hasAnimated])

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>
}

// Breathing glow animation
export function BreathingGlow({
  children,
  className = '',
  color = 'rgba(245, 183, 49, 0.15)',
}: {
  children: ReactNode
  className?: string
  color?: string
}) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 20px ${color}`,
          `0 0 40px ${color}`,
          `0 0 20px ${color}`,
        ],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
