/**
 * 性能优化工具函数
 */

/**
 * 防抖函数
 * @param fn 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn.apply(this, args)
      timeoutId = null
    }, delay)
  }
}

/**
 * 节流函数
 * @param fn 要节流的函数
 * @param limit 时间限制（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      fn.apply(this, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 请求动画帧节流
 * @param fn 要节流的函数
 * @returns 节流后的函数
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null

  return function (this: unknown, ...args: Parameters<T>) {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        fn.apply(this, args)
        rafId = null
      })
    }
  }
}

/**
 * 格式化数字（添加千位分隔符）
 * @param num 数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('zh-CN')
}

/**
 * 缓动函数 - easeOutExpo
 */
export function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * 缓动函数 - easeOutCubic
 */
export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 缓动函数 - easeInOutCubic
 */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}
