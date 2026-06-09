'use client'

import { buttonVariants } from '@/components/ui/button'
import { useAnalytics } from '@/hooks/use-analytics'

interface DatasheetDownloadButtonProps {
  productModel: string
  documentType?: string
  documentName?: string
  locale?: string
  datasheetUrl: string
}

export function DatasheetDownloadButton({ 
  productModel, 
  documentType = 'datasheet', 
  documentName,
  locale = 'en', 
  datasheetUrl 
}: DatasheetDownloadButtonProps) {
  const { trackDownload } = useAnalytics(locale)

  const handleClick = () => {
    trackDownload({
      product_model: productModel,
      document_type: documentType,
      document_name: documentName || datasheetUrl.split('/').pop() || 'unknown'
    })
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
