import { MediaLibrary } from '@/features/products/components/admin/media-library'

export default function MediaPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Media Library</h1>
      <MediaLibrary mode="manage" />
    </div>
  )
}
