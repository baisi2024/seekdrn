'use client'

import { AdminPage } from '@/components/admin/core'
import { CategoryManager } from '@/features/products/components/admin/category-manager'

export default function CategoriesPage() {
  return (
    <AdminPage title="categories_page.title">
      <CategoryManager />
    </AdminPage>
  )
}
