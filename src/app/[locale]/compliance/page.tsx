import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { ComplianceSupportBlock } from '@/components/public/compliance-support-block'
import { ComplianceQueryTool } from '@/components/public/compliance-query-tool'
import { Shield, FileText, Cookie, Scale } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'compliance' })

  return {
    title: t('title'),
    description: t('metaDescription'),
    alternates: {
      canonical: `/${locale}/compliance`,
    },
  }
}

const POLICY_ITEMS = [
  {
    slug: 'export',
    icon: Shield,
    key: 'export',
  },
  {
    slug: 'privacy',
    icon: FileText,
    key: 'privacy',
  },
  {
    slug: 'terms',
    icon: Scale,
    key: 'terms',
  },
  {
    slug: 'cookie',
    icon: Cookie,
    key: 'cookie',
  },
]

export default async function CompliancePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('compliance')

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <p className="text-sm font-semibold text-primary">{t('support.policyLabel')}</p>
          <h1 className="mt-3 text-3xl font-bold text-foreground lg:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        <div className="mb-12">
          <ComplianceSupportBlock
            locale={locale}
            title={t('support.title')}
            subtitle={t('support.subtitle')}
            quoteLabel={t('support.quoteLabel')}
            packLabel={t('support.packLabel')}
            policyLabel={t('support.policyLabel')}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {POLICY_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.slug} href={`/${locale}/compliance/${item.slug}`}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="rounded-lg bg-accent p-3">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg mb-1">
                        {t(`${item.key}.title`)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t(`${item.key}.description`)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* General compliance statement */}
        <div className="max-w-3xl">
          <Card className="bg-muted border-border">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-3">{t('generalNotice.title')}</h2>
              <p className="text-muted-foreground">
                {t('generalNotice.content')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Compliance Query Tool */}
        <div className="max-w-3xl mt-8">
          <ComplianceQueryTool locale={locale} />
        </div>
      </div>
    </div>
  )
}