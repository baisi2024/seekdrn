/**
 * 统一的语言配置
 * 前端和后台管理共用
 */

export const LOCALES = [
  { code: 'en', label: 'English', labelZh: '英语' },
  { code: 'ar', label: 'Arabic', labelZh: '阿拉伯语' },
  { code: 'es', label: 'Spanish', labelZh: '西班牙语' },
  { code: 'fr', label: 'French', labelZh: '法语' },
  { code: 'pt', label: 'Portuguese', labelZh: '葡萄牙语' },
  { code: 'id', label: 'Indonesian', labelZh: '印尼语' },
  { code: 'zh', label: 'Chinese', labelZh: '中文' },
  { code: 'th', label: 'Thai', labelZh: '泰语' },
  { code: 'vi', label: 'Vietnamese', labelZh: '越南语' },
  { code: 'fa', label: 'Persian', labelZh: '波斯语' },
  { code: 'ru', label: 'Russian', labelZh: '俄语' },
] as const

export type LocaleCode = (typeof LOCALES)[number]['code']

export const LOCALE_CODES = LOCALES.map(l => l.code)

/**
 * 获取语言标签
 */
export function getLocaleLabel(code: string, inChinese = false): string {
  const locale = LOCALES.find(l => l.code === code)
  if (!locale) return code
  return inChinese ? locale.labelZh : locale.label
}
