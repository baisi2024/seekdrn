import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTranslation(
  translations: Record<string, Record<string, string>>,
  locale: string,
  field: string
): string {
  return translations[locale]?.[field] || translations['en']?.[field] || ''
}
