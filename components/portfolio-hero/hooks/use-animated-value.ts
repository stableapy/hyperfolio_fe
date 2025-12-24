"use client"

import { useState, useEffect, useRef } from "react"

interface UseAnimatedValueOptions {
  duration?: number // Duration of the animation in ms
  easing?: (t: number) => number // Easing function
}

interface UseAnimatedValueReturn {
  animatedValue: number
  isAnimating: boolean
}

/**
 * Hook to animate a number value with a geeky terminal counting effect
 * Features:
 * - Linear interpolation between values
 * - Configurable duration and easing
 * - Animation state tracking
 */
export function useAnimatedValue(
  targetValue: number,
  options: UseAnimatedValueOptions = {}
): UseAnimatedValueReturn {
  const { duration = 1000, easing = easeOutExpo } = options

  const [animatedValue, setAnimatedValue] = useState(targetValue)
  const [isAnimating, setIsAnimating] = useState(false)

  const previousValueRef = useRef(targetValue)
  const startTimeRef = useRef<number>(0)
  const startValueRef = useRef(targetValue)
  const animationFrameRef = useRef<number>(0)

  useEffect(() => {
    // Skip if value hasn't changed significantly
    if (Math.abs(targetValue - previousValueRef.current) < 0.01) {
      return
    }

    const startValue = previousValueRef.current
    const valueDifference = targetValue - startValue

    // For very small changes, just update directly
    if (Math.abs(valueDifference) < 1) {
      setAnimatedValue(targetValue)
      previousValueRef.current = targetValue
      return
    }

    // Start animation
    setIsAnimating(true)
    startValueRef.current = startValue
    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easing(progress)

      const currentValue = startValue + valueDifference * easedProgress
      setAnimatedValue(currentValue)

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
        previousValueRef.current = targetValue
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [targetValue, duration, easing])

  return { animatedValue, isAnimating }
}

// Easing functions for different animation styles

/**
 * Ease out exponential - fast start, slow end (like numbers settling)
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Ease out quartic - dramatic fast start, very slow end
 */
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/**
 * Ease out cubic - smooth deceleration
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Linear - constant speed (classic terminal counter)
 */
export function linear(t: number): number {
  return t
}
