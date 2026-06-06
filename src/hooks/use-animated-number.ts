'use client'

import { useState, useEffect, useRef } from 'react'
import { easeOutCubic } from '@/lib/performance-utils'

interface UseAnimatedNumberOptions {
  duration?: number
  easing?: (t: number) => number
  startOnMount?: boolean
}

/**
 * 动画数字 Hook
 * @param targetValue 目标值
 * @param options 配置选项
 * @returns 当前动画值
 */
export function useAnimatedNumber(
  targetValue: number,
  options: UseAnimatedNumberOptions = {}
) {
  const {
    duration = 1000,
    easing = easeOutCubic,
    startOnMount = true,
  } = options

  const [currentValue, setCurrentValue] = useState(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    if (!startOnMount) return

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const value =
        startValueRef.current +
        (targetValue - startValueRef.current) * easedProgress

      setCurrentValue(Math.round(value))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [targetValue, duration, easing, startOnMount])

  const start = () => {
    startValueRef.current = currentValue
    startTimeRef.current = null

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp
      }

      const elapsed = timestamp - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const value =
        startValueRef.current +
        (targetValue - startValueRef.current) * easedProgress

      setCurrentValue(Math.round(value))

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const reset = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setCurrentValue(0)
    startValueRef.current = 0
    startTimeRef.current = null
  }

  return { value: currentValue, start, reset }
}
