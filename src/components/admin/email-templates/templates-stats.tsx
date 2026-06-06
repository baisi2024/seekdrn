'use client'

import { memo, useMemo } from 'react'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Mail, CheckCircle2, Clock } from 'lucide-react'
import { EmailTemplate } from '../email-templates-table'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { useAnimatedNumber } from '@/hooks/use-animated-number'
import { formatNumber } from '@/lib/performance-utils'

interface TemplatesStatsProps {
  templates: EmailTemplate[]
}

// 迷你图表组件
const MiniChart = memo(function MiniChart({ 
  data, 
  color = 'blue' 
}: { 
  data: number[]
  color?: 'blue' | 'green' | 'orange' | 'purple'
}) {
  const max = Math.max(...data, 1)
  const colorClasses = {
    blue: 'from-blue-500 to-blue-300',
    green: 'from-green-500 to-green-300',
    orange: 'from-orange-500 to-orange-300',
    purple: 'from-purple-500 to-purple-300',
  }

  return (
    <div className="flex items-end gap-0.5 h-8" role="img" aria-label="迷你趋势图">
      {data.map((value, index) => (
        <div
          key={index}
          className={`
            w-1 rounded-t transition-all duration-300
            bg-gradient-to-t ${colorClasses[color]}
          `}
          style={{
            height: `${(value / max) * 100}%`,
            animationDelay: `${index * 50}ms`,
          }}
        />
      ))}
    </div>
  )
})

// 统计卡片组件
const StatCard = memo(function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  miniChartData,
}: {
  title: string
  value: number | string
  icon: React.ElementType
  color: 'blue' | 'green' | 'orange' | 'purple'
  trend?: number
  miniChartData?: number[]
}) {
  const { value: animatedValue } = useAnimatedNumber(
    typeof value === 'number' ? value : 0,
    { duration: 800 }
  )

  const colorClasses = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-500/10',
      gradient: 'from-blue-500 to-cyan-500',
    },
    green: {
      text: 'text-green-600',
      bg: 'bg-green-500/10',
      gradient: 'from-green-500 to-emerald-500',
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-orange-500/10',
      gradient: 'from-orange-500 to-amber-500',
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-500/10',
      gradient: 'from-purple-500 to-pink-500',
    },
  }

  const displayValue = typeof value === 'number' 
    ? formatNumber(animatedValue) 
    : value

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* 顶部渐变条 */}
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color].gradient}`} />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className={`rounded-full p-2 ${colorClasses[color].bg} transition-transform group-hover:scale-110`}>
          <Icon className={`h-4 w-4 ${colorClasses[color].text}`} />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold tabular-nums">
              {displayValue}
            </div>
            {trend !== undefined && (
              <p className={`
                text-xs mt-1 flex items-center gap-1
                ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground'}
              `}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}
                {Math.abs(trend).toFixed(1)}%
              </p>
            )}
          </div>
          
          {/* 迷你图表 */}
          {miniChartData && miniChartData.length > 0 && (
            <MiniChart data={miniChartData} color={color} />
          )}
        </div>
      </CardContent>
    </Card>
  )
})

export function TemplatesStats({ templates }: TemplatesStatsProps) {
  const t = useAdminTranslations()
  
  const stats = useMemo(() => {
    const totalTemplates = templates.length
    const activeTemplates = templates.filter(t => t.is_active).length
    const lastUpdated = templates.length > 0 
      ? new Date(templates[0].updated_at).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : t('email_templates_page.noData')

    // 生成模拟的趋势数据（实际项目中应该从 API 获取）
    const generateTrendData = (base: number) => 
      Array.from({ length: 7 }, () => Math.max(0, base + Math.floor(Math.random() * 5 - 2)))

    return [
      {
        title: t('email_templates_page.statsTotal'),
        value: totalTemplates,
        icon: Mail,
        color: 'blue' as const,
        miniChartData: generateTrendData(totalTemplates),
      },
      {
        title: t('email_templates_page.statsActive'),
        value: activeTemplates,
        icon: CheckCircle2,
        color: 'green' as const,
        miniChartData: generateTrendData(activeTemplates),
      },
      {
        title: t('email_templates_page.statsLastUpdate'),
        value: lastUpdated,
        icon: Clock,
        color: 'orange' as const,
      },
    ]
  }, [templates, t])

  return (
    <div className="grid gap-4 md:grid-cols-3" role="region" aria-label="模板统计">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
