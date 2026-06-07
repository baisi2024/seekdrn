import { MediaLibrary } from '@/features/products/components/admin/media-library'
import { AdminPage } from '@/components/admin/core'

export default function MediaPage() {
  return (
    <AdminPage title="media_page.title">
      <MediaLibrary mode="manage" />
    </AdminPage>
  )
}
