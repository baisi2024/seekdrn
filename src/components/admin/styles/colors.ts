/**
 * 颜色映射工具
 * 将硬编码的 gray 颜色映射到设计系统变量
 */

export const colorMap: Record<string, string> = {
  // 背景色映射
  'bg-gray-50': 'bg-muted/50',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted/80',
  'bg-gray-300': 'bg-muted/60',

  // 文本色映射
  'text-gray-400': 'text-muted-foreground/80',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-foreground/80',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',

  // 边框色映射
  'border-gray-100': 'border-border/50',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border/80',
}

/**
 * 替换单个颜色类名
 */
export function normalizeColor(className: string): string {
  return colorMap[className] || className
}

/**
 * 替换类名字符串中的所有硬编码颜色
 */
export function normalizeColors(classNames: string): string {
  return classNames
    .split(' ')
    .map(normalizeColor)
    .join(' ')
}

/**
 * 检查是否包含硬编码颜色
 */
export function hasHardcodedColors(classNames: string): boolean {
  return Object.keys(colorMap).some(color => classNames.includes(color))
}
