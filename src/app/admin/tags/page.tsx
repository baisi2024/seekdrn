import { TagManager } from '@/features/products/components/admin/tag-manager'

export default function TagsPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Tag Management</h1>
      <TagManager />
    </div>
  )
}
