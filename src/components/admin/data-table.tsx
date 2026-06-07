'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useAdminTranslations } from '@/hooks/use-admin-translations'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  searchPlaceholder?: string
  pageSize?: number
  onRowClick?: (item: T) => void
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  pageSize = 10,
  onRowClick,
}: DataTableProps<T>) {
  const t = useAdminTranslations()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  )

  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-4">
      {/* 搜索栏 - 改进样式 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(0)
            }}
            className="pl-9 bg-background border-2 focus:border-primary transition-colors"
          />
        </div>
      </div>
      
      {/* 表格容器 - 添加阴影和圆角 */}
      <div className="border rounded-xl overflow-hidden shadow-sm bg-card">
        <table className="w-full">
          {/* 表头 - 改进背景和样式 */}
          <thead className="bg-muted/50 border-b">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-3.5 text-left text-sm font-semibold text-foreground">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          {/* 表体 - 改进悬停效果 */}
          <tbody className="divide-y">
            {paged.map((item, index) => (
              <tr
                key={item.id}
                className={`${onRowClick ? 'cursor-pointer hover:bg-muted/30 transition-colors duration-150' : ''} ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-sm">
                    {col.render
                      ? col.render(item)
                      : String(item[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* 空状态 - 改进设计 */}
        {paged.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">{t('noResults')}</p>
            <p className="text-xs text-muted-foreground">{t('tryAdjusting')}</p>
          </div>
        )}
      </div>
      
      {/* 分页 - 改进样式 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {t('showing')} <span className="font-medium text-foreground">{page * pageSize + 1}</span> {t('to')}{' '}
            <span className="font-medium text-foreground">{Math.min((page + 1) * pageSize, filtered.length)}</span> {t('of')}{' '}
            <span className="font-medium text-foreground">{filtered.length}</span> {t('results')}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="transition-all duration-150"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="transition-all duration-150"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
