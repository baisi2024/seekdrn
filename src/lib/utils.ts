import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从多语言翻译对象中安全提取字符串值
 * 支持两种格式：
 * 1. 嵌套格式：{ en: { name: 'Drone' }, zh: { name: '无人机' } } → getTranslation(obj, 'en', 'name') = 'Drone'
 * 2. 简单格式：{ en: 'Drone', zh: '无人机' } → getTranslation(obj, 'en', 'name') = 'Drone' (field 被忽略)
 */
export function getTranslation(
  translations: Record<string, Record<string, string>> | Record<string, string> | unknown,
  locale: string,
  field: string
): string {
  // Handle null/undefined
  if (!translations) return ''

  // Handle empty objects
  if (typeof translations !== 'object' || Object.keys(translations as object).length === 0) return ''

  const t = translations as Record<string, unknown>

  // Handle both nested translation objects and simple key-value objects
  if (typeof t[locale] === 'object' && t[locale] !== null) {
    const localeData = t[locale] as Record<string, string>
    const result = localeData?.[field]
    if (typeof result === 'string') return result

    const enData = t['en'] as Record<string, string>
    const enResult = enData?.[field]
    if (typeof enResult === 'string') return enResult

    return ''
  }

  // Handle simple key-value objects like { en: 'value' }
  const localeValue = t[locale]
  if (typeof localeValue === 'string') return localeValue

  const enValue = t['en']
  if (typeof enValue === 'string') return enValue

  return ''
}

/**
 * 从多语言字段值中安全提取字符串
 * 处理三种可能的格式：
 * 1. 多语言对象：{ en: '120', zh: '120' } → getLocalizedValue(obj, 'en') = '120'
 * 2. 纯字符串：'120' → getLocalizedValue('120', 'en') = '120'
 * 3. null/undefined → ''
 */
export function getLocalizedValue(
  value: Record<string, string> | string | unknown,
  locale: string
): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (typeof value === 'object') {
    const obj = value as Record<string, string>
    // 优先返回请求的语言
    if (obj[locale] && typeof obj[locale] === 'string') return obj[locale]
    // 回退到英文
    if (obj['en'] && typeof obj['en'] === 'string') return obj['en']
    // 回退到第一个字符串值
    const firstValue = Object.values(obj).find(v => typeof v === 'string')
    if (firstValue) return firstValue
  }
  return ''
}
