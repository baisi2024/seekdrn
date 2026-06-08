'use client'

import { buttonVariants } from '@/components/ui/button'
import { trackDatasheetDownload } from '@/lib/gtm'

interface DatasheetDownloadButtonProps {
  productModel: string
  documentType?: string
  locale?: string
  datasheetUrl: string
}

export function DatasheetDownloadButton({ productModel, documentType = 'datasheet', locale = 'en', datasheetUrl }: DatasheetDownloadButtonProps) {
  const handleClick = () => {
    trackDatasheetDownload({ product_model: productModel, document_type: documentType, locale })
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
