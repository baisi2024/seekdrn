import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { POLICIES, POLICY_SLUG_MAP } from '@/lib/compliance/constants'

export async function generateStaticParams() {
  const locales = ['en', 'ar', 'es', 'fr', 'pt', 'id', 'zh']
  const params: { locale: string; slug: string }[] = []

  for (const locale of locales) {
    for (const policy of POLICIES) {
      params.push({
        locale,
        slug: policy.slug,
      })
    }
  }

  return params
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params

  const section = POLICY_SLUG_MAP[slug]
  if (!section) return { title: 'Policy' }

  const { data: policyContent } = await supabaseAdmin
    .from('footer_content')
    .select('translations')
    .eq('section', section)
    .eq('published', true)
    .maybeSingle()

  const title = policyContent ? getTranslation(policyContent.translations, locale, 'title') : 'Policy'
  const policyConfig = POLICIES.find(p => p.slug === slug)
  const fallbackTitle = policyConfig?.name[locale as keyof typeof policyConfig.name] || policyConfig?.name.en || 'Policy'

  return {
    title: title || fallbackTitle,
    alternates: {
      canonical: `/${locale}/compliance/${slug}`,
    },
  }
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations('compliance')

  const section = POLICY_SLUG_MAP[slug]
  if (!section) {
    notFound()
  }

  const { data: policyContent } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .eq('section', section)
    .eq('published', true)
    .maybeSingle()

  if (!policyContent) {
    notFound()
  }

  const title = getTranslation(policyContent.translations, locale, 'title')
  const content = getTranslation(policyContent.translations, locale, 'content')

  const policyConfig = POLICIES.find(p => p.slug === slug)
  const policyName = policyConfig?.name[locale as keyof typeof policyConfig.name] ||
                     policyConfig?.name.en ||
                     'Policy'

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          {title || policyName}
        </h1>

        {content ? (
          <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-muted-foreground">
            {t('noContent')}
          </p>
        )}
      </div>
    </div>
  )
}