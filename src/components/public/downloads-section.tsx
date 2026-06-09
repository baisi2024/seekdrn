'use client'

import { FileText, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'
import { getTranslation } from '@/lib/utils'
import { formatFileSize } from '@/lib/format-file-size'
import { trackDatasheetDownload } from '@/lib/gtm'

interface Download {
  id: string
  type: 'manual' | 'datasheet' | 'certificate' | 'media'
  title: Record<string, string>
  description: Record<string, string>
  file_url: string
  file_size: number
  file_type: string
  language: string
}

interface Props {
  downloads: Download[]
  locale: string
  productModel?: string
}

export function DownloadsSection({ downloads, locale, productModel }: Props) {
  const t = useTranslations('products')

  if (!downloads || downloads.length === 0) return null

  return (
    <section data-testid="downloads-section">
      <div className="grid md:grid-cols-2 gap-4">
        {downloads.map(item => {
          const title = getTranslation(item.title, locale, 'en')
          const description = getTranslation(item.description, locale, 'en')

          const handleDownloadClick = () => {
            if (productModel) {
              trackDatasheetDownload({
                product_model: productModel,
                document_type: item.type,
                locale,
              })
            }
          }

          return (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{title}</h3>
                    {description && (
                      <p className="text-sm text-muted-foreground mb-2">{description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{item.language.toUpperCase()}</span>
                      <span>{formatFileSize(item.file_size)}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    render={<a href={item.file_url} download />}
                    data-testid="download-button"
                    onClick={handleDownloadClick}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
