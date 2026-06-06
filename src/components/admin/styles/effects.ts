/**
 * 统一的视觉效果系统
 */

export const effects = {
  // 卡片效果
  card: 'shadow-lg hover:shadow-xl transition-shadow duration-300',
  cardElevated: 'shadow-xl hover:shadow-2xl transition-shadow duration-300',
  cardBordered: 'border border-border hover:border-primary/50 transition-colors duration-200',

  // 按钮效果
  button: 'transition-all duration-200 hover:scale-105',
  buttonGentle: 'transition-all duration-200',

  // 渐变背景
  gradientPage: 'bg-gradient-to-br from-slate-50 via-white to-blue-50',
  gradientCard: 'bg-gradient-to-br from-background to-muted/50',
  gradientSidebar: 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800',

  // 边框效果
  border: 'border border-border hover:border-primary/50 transition-colors duration-200',
  borderSubtle: 'border border-border/50 hover:border-border transition-colors duration-200',

  // 悬停效果
  hover: 'hover:bg-muted/50 transition-colors duration-200',
  hoverScale: 'hover:scale-105 transition-transform duration-200',
  hoverLift: 'hover:-translate-y-1 transition-transform duration-200',

  // 焦点效果
  focus: 'focus:ring-2 focus:ring-primary/50 focus:outline-none',
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',

  // 动画效果
  fadeIn: 'animate-in fade-in duration-200',
  slideIn: 'animate-in slide-in-from-bottom-4 duration-300',
  scaleIn: 'animate-in zoom-in-95 duration-200',
} as const

/**
 * 组合多个效果
 */
export function combineEffects(...effectNames: (keyof typeof effects)[]): string {
  return effectNames.map(name => effects[name]).join(' ')
}
