'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

export interface FilterValues {
  status: string
  template_key: string
  search: string
  dateFrom: string
  dateTo: string
}

interface LogsFiltersProps {
  filters: FilterValues
  onFiltersChange: (filters: FilterValues) => void
  templates: string[]
}

export function LogsFilters({
  filters,
  onFiltersChange,
  templates,
}: LogsFiltersProps) {
  const t = useAdminTranslations()
  
  const handleClearFilters = () => {
    onFiltersChange({
      status: '',
      template_key: '',
      search: '',
      dateFrom: '',
      dateTo: '',
    })
  }

  const hasActiveFilters =
    filters.status ||
    filters.template_key ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('email_logs_page.filterStatus')}</label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, status: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('email_logs_page.filterAllStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('email_logs_page.filterAll')}</SelectItem>
                  <SelectItem value="sent">{t('email_logs_page.filterSent')}</SelectItem>
                  <SelectItem value="failed">{t('email_logs_page.filterFailed')}</SelectItem>
                  <SelectItem value="pending">{t('email_logs_page.filterPending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('email_logs_page.filterTemplate')}</label>
              <Select
                value={filters.template_key}
                onValueChange={(value) =>
                  onFiltersChange({ ...filters, template_key: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('email_logs_page.filterAllTemplates')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('email_logs_page.filterAll')}</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template} value={template}>
                      {template}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('email_logs_page.filterStartDate')}</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateFrom: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('email_logs_page.filterEndDate')}</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) =>
                  onFiltersChange({ ...filters, dateTo: e.target.value })
                }
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t('email_logs_page.filterSearch')}</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('email_logs_page.filterSearchPlaceholder')}
                  value={filters.search}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, search: e.target.value })
                  }
                  className="pl-8 w-full"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="w-full md:w-auto"
            >
              <X className="h-4 w-4 mr-2" />
              {t('email_logs_page.clearFilters')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
