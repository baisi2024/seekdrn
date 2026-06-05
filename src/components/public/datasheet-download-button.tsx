'use client'

import { Button } from '@/components/ui/button'
import { trackDatasheetDownload } from '@/lib/gtm'

interface DatasheetDownloadButtonProps {
  productModel: string
  datasheetUrl: string
}

export function DatasheetDownloadButton({ productModel, datasheetUrl }: DatasheetDownloadButtonProps) {
  const handleClick = () => {
    trackDatasheetDownload(productModel)
  }

  return (
    <Button asChild variant="outline" size="lg">
      <a href={datasheetUrl} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
        Download Spec
      </a>
    </Button>
  )
}
