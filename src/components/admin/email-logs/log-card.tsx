'use client'

import { memo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, Eye, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

export interface EmailLog {
  id: string
  template_key: string
  recipient_email: string
  language: string
  status: string
  sent_at: string | null
  created_at: string
  error_message?: string
  subject?: string
  body_html?: string
  variables?: Record<string, unknown>
}

interface LogCardProps {
  log: EmailLog
  onView: (log: EmailLog) => void
  showTimeline?: boolean
}

export const LogCard = memo(function LogCard({ log, onView, showTimeline = false }: LogCardProps) {
  const t = useAdminTranslations()
  const [isHovered, setIsHovered] = useState(false)

  const getStatusConfig = () => {
    switch (log.status) {
      case 'sent':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          gradient: 'from-green-500 to-emerald-500',
          label: t('email_logs_detail.status_sent'),
        }
      case 'failed':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          gradient: 'from-red-500 to-pink-500',
          label: t('email_logs_detail.status_failed'),
        }
      default:
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          gradient: 'from-yellow-500 to-orange-500',
          label: t('email_logs_detail.status_pending'),
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss')
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'HH:mm')
    } catch {
      return dateString
    }
  }

  // 时间线视图
  if (showTimeline) {
    return (
      <div 
        className="group relative pl-8 pb-6"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="article"
        aria-label={`${t('email_logs_detail.email_record')}: ${log.recipient_email}`}
      >
        {/* 时间线 */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border to-transparent" />
        
        {/* 时间点 */}
        <div className={`
          absolute left-0 top-1 -translate-x-1/2
          w-4 h-4 rounded-full border-2 border-background
          ${statusConfig.bg} ${statusConfig.color}
          transition-transform group-hover:scale-125
        `}>
          <StatusIcon className="w-2 h-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* 内容卡片 */}
        <Card className={`
          overflow-hidden
          bg-white/80 backdrop-blur-sm
          border-l-4 border-l-transparent
          hover:border-l-green-500
          transition-all duration-300
          ${isHovered ? 'shadow-lg' : ''}
        `}>
          <div className={`h-1 bg-gradient-to-r ${statusConfig.gradient}`} />
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${statusConfig.bg}`}>
                    <Mail className={`h-3.5 w-3.5 ${statusConfig.color}`} />
                  </div>
                  <p className="font-medium truncate">{log.recipient_email}</p>
                  <Badge 
                    variant="outline"
                    className={`border-current ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="truncate font-mono text-xs">{log.template_key}</span>
                  <span className="shrink-0 uppercase text-xs px-1.5 py-0.5 rounded bg-muted">
                    {log.language}
                  </span>
                  <span className="shrink-0 text-xs">
                    {formatTime(log.sent_at || log.created_at)}
                  </span>
                </div>
                
                {/* 悬停时显示错误信息 */}
                {isHovered && log.error_message && (
                  <p className="text-xs text-red-500 line-clamp-2 animate-fade-in">
                    {t('email_logs_detail.error_prefix')} {log.error_message}
                  </p>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onView(log)}
                className="shrink-0 hover:bg-purple-100 hover:text-purple-600"
                aria-label={t('email_logs_detail.view_detail')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 默认卡片视图
  return (
    <Card 
      className={`
        group overflow-hidden
        bg-white/80 backdrop-blur-sm
        hover:shadow-xl hover:shadow-purple-500/5
        border-2 border-transparent
        hover:border-purple-500/20
        transition-all duration-300
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`${t('email_logs_detail.email_record')}: ${log.recipient_email}`}
    >
      {/* 顶部渐变条 */}
      <div className={`h-1 bg-gradient-to-r ${statusConfig.gradient}`} />
      
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`
            shrink-0 p-2 rounded-lg ${statusConfig.bg}
            transition-transform group-hover:scale-110
          `}>
            <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{log.recipient_email}</p>
              <Badge 
                variant="outline"
                className={`border-current ${statusConfig.color}`}
              >
                {statusConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="truncate font-mono text-xs">{log.template_key}</span>
              <span className="shrink-0">•</span>
              <span className="shrink-0 uppercase text-xs px-1.5 py-0.5 rounded bg-muted">
                {log.language}
              </span>
              <span className="shrink-0">•</span>
              <span className="shrink-0 text-xs">
                {formatDate(log.sent_at || log.created_at)}
              </span>
            </div>
            
            {/* 悬停时显示错误信息 */}
            {isHovered && log.error_message && (
              <p className="text-xs text-red-500 line-clamp-1 animate-fade-in">
                {t('email_logs_detail.error_prefix')} {log.error_message}
              </p>
            )}
          </div>

          <div className="shrink-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onView(log)
              }}
              className="hover:bg-purple-100 hover:text-purple-600"
              aria-label={t('email_logs_detail.view_detail')}
            >
              <Eye className="h-4 w-4 mr-1" />
              {t('email_logs_detail.view')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
