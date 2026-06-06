'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { EmailLog } from './log-card'

interface LogDetailSheetProps {
  log: EmailLog | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onResend?: (log: EmailLog) => void
}

export function LogDetailSheet({
  log,
  open,
  onOpenChange,
  onResend,
}: LogDetailSheetProps) {
  if (!log) return null

  const getStatusIcon = () => {
    switch (log.status) {
      case 'sent':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = () => {
    switch (log.status) {
      case 'sent':
        return <Badge variant="default">已发送</Badge>
      case 'failed':
        return <Badge variant="destructive">失败</Badge>
      default:
        return <Badge variant="secondary">待发送</Badge>
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
    } catch {
      return dateString
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {getStatusIcon()}
            邮件详情
          </SheetTitle>
          <SheetDescription>
            查看邮件发送的完整信息
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">状态</span>
              {getStatusBadge()}
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">模板</span>
              <span className="text-sm text-right">{log.template_key}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">收件人</span>
              <span className="text-sm text-right">{log.recipient_email}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">语言</span>
              <span className="text-sm uppercase">{log.language}</span>
            </div>

            <div className="flex justify-between items-start">
              <span className="text-sm font-medium text-muted-foreground">发送时间</span>
              <span className="text-sm text-right">
                {formatDate(log.sent_at || log.created_at)}
              </span>
            </div>

            {log.error_message && (
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted-foreground">错误信息</span>
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                  {log.error_message}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {log.subject && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">邮件主题</h3>
              <p className="text-sm text-muted-foreground">{log.subject}</p>
            </div>
          )}

          {log.body_html && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">邮件内容</h3>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div
                  dangerouslySetInnerHTML={{ __html: log.body_html }}
                  className="prose prose-sm dark:prose-invert max-w-none"
                />
              </ScrollArea>
            </div>
          )}

          {log.variables && Object.keys(log.variables).length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">变量值</h3>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <pre className="text-xs text-muted-foreground">
                    {JSON.stringify(log.variables, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            </>
          )}

          {log.status === 'failed' && onResend && (
            <>
              <Separator />
              <Button
                onClick={() => onResend(log)}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重新发送
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
