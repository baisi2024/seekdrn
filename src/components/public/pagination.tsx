'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string>
}

function getPageUrl(baseUrl: string, page: number, searchParams?: Record<string, string>): string {
  const params = new URLSearchParams()

  // Add other search params
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value)
    }
  }

  // Add page param only if not page 1
  if (page > 1) {
    params.set('page', String(page))
  }

  const queryString = params.toString()
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | 'ellipsis')[] = [1]

  if (current > 3) {
    pages.push('ellipsis')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('ellipsis')
  }

  if (total > 1) {
    pages.push(total)
  }

  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: PaginationProps) {
  const t = useTranslations('common.pagination')

  if (totalPages <= 1) return null

  const pages = getPageNumbers(currentPage, totalPages)

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      {/* Previous */}
      {currentPage > 1 ? (
        <Button variant="outline" size="sm" className="gap-1">
          <Link href={getPageUrl(baseUrl, currentPage - 1, searchParams)} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            {t('previous')}
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1">
          <ChevronLeft className="h-4 w-4" />
          {t('previous')}
        </Button>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : page === currentPage ? (
            <Button
              key={page}
              variant="default"
              size="sm"
              className="min-w-[36px]"
              disabled
            >
              {page}
            </Button>
          ) : (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className="min-w-[36px]"
            >
              <Link href={getPageUrl(baseUrl, page, searchParams)}>
                {page}
              </Link>
            </Button>
          ),
        )}
      </div>

      {/* Next */}
      {currentPage < totalPages ? (
        <Button variant="outline" size="sm" className="gap-1">
          <Link href={getPageUrl(baseUrl, currentPage + 1, searchParams)} className="flex items-center gap-1">
            {t('next')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled className="gap-1">
          {t('next')}
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  )
}
