'use client'

import Link from 'next/link'
import { Tabs, TabsList } from '@/components/ui/tabs'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'uav', label: 'UAV' },
  { key: 'payload', label: 'Payload' },
  { key: 'cuas', label: 'C-UAS' },
  { key: 'ground_control', label: 'Ground Control' },
]

interface ProductFilterProps {
  activeCategory: string
  labels: Record<string, string>
}

export function ProductFilter({ activeCategory, labels }: ProductFilterProps) {
  return (
    <Tabs defaultValue={activeCategory} className="mb-8">
      <TabsList>
        {CATEGORIES.map((cat) => (
          <Link 
            key={cat.key} 
            href={`?cat=${cat.key}`} 
            replace
            className="relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all hover:text-foreground data-[active]:bg-background data-[active]:text-foreground"
            data-active={activeCategory === cat.key ? '' : undefined}
          >
            {labels[cat.key] || cat.label}
          </Link>
        ))}
      </TabsList>
    </Tabs>
  )
}
