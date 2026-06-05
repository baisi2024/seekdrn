import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'

export default async function CompliancePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('compliance')

  const { data: footerContent } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .eq('section', 'compliance')
    .eq('published', true)
    .maybeSingle()

  const content = footerContent
    ? getTranslation(footerContent.translations, locale, 'content')
    : null

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">{t('title')}</h1>
        {content ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-600">
            SeekDrone operates in compliance with international export control regulations.
            Our products are intended for use in approved markets and applications only.
          </p>
        )}
      </div>
    </div>
  )
}
