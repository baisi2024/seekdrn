'use client'

import { buttonVariants } from '@/components/ui/button'
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
    <a 
      href={datasheetUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      onClick={handleClick}
      className={buttonVariants({ variant: 'outline', size: 'lg' })}
    >
      Download Spec
    </a>
  )
}
