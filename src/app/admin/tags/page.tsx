'use client'

import { AdminPage } from '@/components/admin/core'
import { TagManager } from '@/features/products/components/admin/tag-manager'

export default function TagsPage() {
  return (
    <AdminPage title="tags_page.title">
      <TagManager />
    </AdminPage>
  )
}
