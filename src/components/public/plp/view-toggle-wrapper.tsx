'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ViewToggle } from '@/components/public/plp/view-toggle'

export function ViewToggleWrapper() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentView = searchParams.get('view') === 'list' ? 'list' : 'grid'

  function handleChange(view: 'grid' | 'list') {
    const params = new URLSearchParams(searchParams.toString())
    if (view === 'grid') {
      params.delete('view')
    } else {
      params.set('view', view)
    }
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  return <ViewToggle view={currentView} onChange={handleChange} />
}
