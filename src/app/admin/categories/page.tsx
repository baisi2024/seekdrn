import { CategoryManager } from '@/features/products/components/admin/category-manager'

export default function CategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Category Management</h1>
      <CategoryManager />
    </div>
  )
}
