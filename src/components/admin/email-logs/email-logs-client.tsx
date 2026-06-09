'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { List } from 'react-window'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'
import { LogsStats } from './logs-stats'
import { LogsFilters, type FilterValues } from './logs-filters'
import { LogCard, type EmailLog } from './log-card'
import { LogDetailSheet } from './log-detail-sheet'
import { useAdminTranslations } from '@/hooks/use-admin-translations'
import { AdminPage } from '@/components/admin/core'

interface EmailLogsClientProps {
  initialLogs: EmailLog[]
  templates: string[]
}

export function EmailLogsClient({ initialLogs, templates }: EmailLogsClientProps) {
  const t = useAdminTranslations()
  const [logs, setLogs] = useState<EmailLog[]>(initialLogs)
  const [loading, setLoading] = useState(false)
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({
    status: '',
    template_key: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  })
  const prevFiltersRef = useRef<FilterValues>(filters)

  const stats = {
    total: logs.length,
    sent: logs.filter((l) => l.status === 'sent').length,
    failed: logs.filter((l) => l.status === 'failed').length,
    pending: logs.filter((l) => l.status === 'pending').length,
  }

  const fetchLogs = useCallback(async (showToast = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.template_key) params.append('template_key', filters.template_key)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/admin/email-logs?${params.toString()}`)
      const data = await response.json()

      if (data.error) throw new Error(data.error)

      setLogs(data.data || [])
      if (showToast) {
        toast.success(t('email_logs_page.dataRefreshed'))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('email_logs_page.refreshFailed')
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [filters, t])

  // 当筛选条件改变时重新获取数据
  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.status !== filters.status ||
      prevFiltersRef.current.template_key !== filters.template_key ||
      prevFiltersRef.current.search !== filters.search ||
      prevFiltersRef.current.dateFrom !== filters.dateFrom ||
      prevFiltersRef.current.dateTo !== filters.dateTo

    if (filtersChanged) {
      fetchLogs()
      prevFiltersRef.current = filters
    }
  }, [filters, fetchLogs])

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => fetchLogs(), 30000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchLogs])

  const handleViewLog = (log: EmailLog) => {
    setSelectedLog(log)
    setSheetOpen(true)
  }

  const handleResend = async (log: EmailLog) => {
    try {
      const response = await fetch(`/api/admin/email-templates/${log.template_key}/test-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: log.recipient_email,
          language: log.language,
          variables: log.variables,
        }),
      })

      const data = await response.json()

      if (data.error) throw new Error(data.error)

      toast.success(t('email_logs_page.emailResent'))
      setSheetOpen(false)
      fetchLogs()
    } catch (error) {
      const message = error instanceof Error ? error.message : t('email_logs_page.resendFailed')
      toast.error(message)
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (filters.search && !log.recipient_email.includes(filters.search)) {
      return false
    }
    return true
  })

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const log = filteredLogs[index]
    return (
      <div style={style} className="px-4">
        <LogCard log={log} onView={handleViewLog} />
      </div>
    )
  }

  return (
    <AdminPage
      title="email_logs_page.title"
      actions={
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
            />
            <Label htmlFor="auto-refresh" className="text-sm">
              {t('email_logs_page.autoRefresh')}
            </Label>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLogs(true)}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('email_logs_page.refresh')}
          </Button>
        </div>
      }
    >
      <LogsStats stats={stats} />

      <LogsFilters
        filters={filters}
        onFiltersChange={setFilters}
        templates={templates}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t('email_logs_page.totalRecords').replace('{count}', String(filteredLogs.length))}
          </p>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {t('email_logs_page.noLogs')}
          </div>
        ) : (
          <div className="border rounded-lg">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(List as any)({
              height: 600,
              itemCount: filteredLogs.length,
              itemSize: 100,
              width: '100%',
              children: Row,
            })}
          </div>
        )}
      </div>

      <LogDetailSheet
        log={selectedLog}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onResend={handleResend}
      />
    </AdminPage>
  )
}
