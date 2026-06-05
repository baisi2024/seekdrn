import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTranslation(
  translations: Record<string, Record<string, string>> | Record<string, string>,
  locale: string,
  field: string
): string {
  // Handle both nested translation objects and simple key-value objects
  if (typeof translations[locale] === 'object' && translations[locale] !== null) {
    return (translations[locale] as Record<string, string>)?.[field] || (translations['en'] as Record<string, string>)?.[field] || ''
  }
  // Handle simple key-value objects like { en: 'value' }
  return (translations as Record<string, string>)?.[locale] || (translations as Record<string, string>)?.['en'] || ''
}
