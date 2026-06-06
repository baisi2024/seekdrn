import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { POLICIES, POLICY_SLUG_MAP } from '@/lib/compliance/constants'

/**
 * 生成静态参数，用于 ISR 缓存
 */
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

/**
 * 动态政策页面
 */
export default async function PolicyPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const t = await getTranslations('compliance')

  // 验证 slug 并映射到 section
  const section = POLICY_SLUG_MAP[slug]
  if (!section) {
    notFound()
  }

  // 从数据库获取政策内容
  const { data: policyContent } = await supabaseAdmin
    .from('footer_content')
    .select('*')
    .eq('section', section)
    .eq('published', true)
    .maybeSingle()

  // 如果政策未发布或不存在，返回 404
  if (!policyContent) {
    notFound()
  }

  // 获取翻译内容
  const title = getTranslation(policyContent.translations, locale, 'title')
  const content = getTranslation(policyContent.translations, locale, 'content')

  // 获取政策名称
  const policyConfig = POLICIES.find(p => p.slug === slug)
  const policyName = policyConfig?.name[locale as keyof typeof policyConfig.name] || 
                     policyConfig?.name.en || 
                     'Policy'

  return (
    <div className="py-16">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* 页面标题 */}
        <h1 className="text-3xl font-bold mb-8">
          {title || policyName}
        </h1>

        {/* 政策内容 */}
        {content ? (
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-gray-600">
            {t('noContent')}
          </p>
        )}
      </div>
    </div>
  )
}
