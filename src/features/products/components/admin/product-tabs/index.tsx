'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export type TabKey = 'basic' | 'content' | 'specs' | 'scenarios' | 'features' | 'payloads' | 'documents' | 'seo' | 'faq' | 'relations' | 'hero'

interface TabItem {
  key: TabKey
  label: string
}

const TABS: TabItem[] = [
  { key: 'basic', label: 'Basic Info' },
  { key: 'content', label: 'Content' },
  { key: 'specs', label: 'Specs' },
  { key: 'scenarios', label: 'Scenarios' },
  { key: 'features', label: 'Features' },
  { key: 'payloads', label: 'Payloads' },
  { key: 'documents', label: 'Documents' },
  { key: 'seo', label: 'SEO' },
  { key: 'faq', label: 'FAQ' },
  { key: 'relations', label: 'Relations' },
  { key: 'hero', label: 'Hero' },
]

interface ProductTabsProps {
  productId: string
  children: React.ReactNode
}

export function ProductTabs({ productId, children }: ProductTabsProps) {
  const searchParams = useSearchParams()
  const currentTab = (searchParams.get('tab') as TabKey) || 'basic'

  return (
    <div>
      <div className="flex gap-1 mb-6 border-b">
        {TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/products/${productId}?tab=${tab.key}`}
            className={cn(
              'px-4 py-2 rounded-t-lg transition-colors',
              currentTab === tab.key
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <div>{children}</div>
    </div>
  )
}

export function useCurrentTab(): TabKey {
  const searchParams = useSearchParams()
  return (searchParams.get('tab') as TabKey) || 'basic'
}
