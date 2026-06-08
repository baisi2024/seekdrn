import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getTranslation } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CaseHeroVideo } from '@/components/public/case-hero-video'
import { LeadFormCTAButton } from '@/components/public/lead-form-cta-button'
import { ShareButtons } from '@/components/public/share-buttons'
import { InlineLeadForm } from '@/components/public/inline-lead-form'
import { ArrowRight, Box } from 'lucide-react'
import { Breadcrumb } from '@/components/public/breadcrumb'

interface CaseResult {
  value: string
  metric: string
  unit?: string
}

interface RelatedProduct {
  id: string
  slug: string
  model?: string
  images?: string[]
  translations?: Record<string, Record<string, string>>
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; locale: string }> }): Promise<Metadata> {
  const { slug, locale } = await params

  const { data: caseStudy } = await supabaseAdmin
    .from('case_studies')
    .select('translations')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  const title = caseStudy ? getTranslation(caseStudy.translations, locale, 'title') : 'Case Study'

  return {
    title,
    alternates: {
      canonical: `/${locale}/case-studies/${slug}`,
    },
  }
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>
}) {
  const { slug, locale } = await params
  const t = await getTranslations('case-studies')
  const tc = await getTranslations('common')

  const { data: caseStudy } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!caseStudy) notFound()

  const title = getTranslation(caseStudy.translations, locale, 'title')
  const background = getTranslation(caseStudy.translations, locale, 'background')
  const challenge = getTranslation(caseStudy.translations, locale, 'challenge')
  const solution = getTranslation(caseStudy.translations, locale, 'solution')
  const clientQuote = getTranslation(caseStudy.client_quote || {}, locale, 'text')

  // Query related products
  const { data: relatedProductsData } = await supabaseAdmin
    .from('product_case_relations')
    .select('product_id, products(*)')
    .eq('case_study_id', caseStudy.id)
    .order('sort_order')

  const relatedProducts = (relatedProductsData
    ?.map((r) => r.products)
    .filter(Boolean) || []) as unknown as RelatedProduct[]

  return (
    <div className="bg-background py-16">
      <div className="container mx-auto px-4">
        <Breadcrumb
          items={[
            { label: tc('breadcrumb.home'), href: `/${locale}` },
            { label: tc('breadcrumb.case_studies'), href: `/${locale}/case-studies` },
            { label: title || '' },
          ]}
        />
        {/* Hero */}
        <div className="mb-12">
          {caseStudy.video_url ? (
            <CaseHeroVideo
              videoUrl={caseStudy.video_url}
              poster={caseStudy.images && caseStudy.images[0]}
            />
          ) : caseStudy.images && caseStudy.images[0] ? (
            <div className="aspect-video rounded-2xl overflow-hidden bg-muted mb-6 relative">
              <Image src={caseStudy.images[0]} alt={title} fill className="object-cover" />
            </div>
          ) : null}
          <div className="flex gap-2 mb-4">
            <Badge>{caseStudy.industry}</Badge>
            {caseStudy.country && <Badge variant="outline">{caseStudy.country}</Badge>}
          </div>
          <h1 className="max-w-4xl text-3xl lg:text-5xl font-bold text-foreground">{title}</h1>
          <div className="mt-3">
            <ShareButtons title={title} pageType="case" locale={locale} />
          </div>
        </div>

        {/* Results */}
        {caseStudy.results && caseStudy.results.length > 0 && (
          <section className="mb-12 rounded-3xl border border-border bg-[#f7f8f5] p-6 lg:p-8">
            <p className="text-sm font-semibold text-primary">{t('resultsEyebrow')}</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground mb-6">{t('results')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {(caseStudy.results as CaseResult[]).map((r, i) => (
                <Card key={i} className="bg-background">
                  <CardContent className="p-6 text-center">
                    <div className="font-mono font-bold text-3xl text-primary mb-2">
                      {r.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{r.metric}</div>
                    {r.unit && <div className="text-xs text-muted-foreground/60 mt-1">{r.unit}</div>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Background */}
        {background && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('background')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: background }} />
          </section>
        )}

        {/* Challenge */}
        {challenge && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('challenge')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: challenge }} />
          </section>
        )}

        {/* Solution */}
        {solution && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('solution')}</h2>
            <div className="prose max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: solution }} />
          </section>
        )}

        {/* Client Quote */}
        {clientQuote && (
          <section className="mb-12">
            <Card className="bg-muted">
              <CardContent className="p-6">
                <blockquote className="text-lg italic text-foreground">
                  &ldquo;{clientQuote}&rdquo;
                </blockquote>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Field Footage */}
        {caseStudy.images && caseStudy.images.length > 1 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">{t('fieldFootage')}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {caseStudy.images.slice(1).map((img: string, i: number) => (
                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                  <Image src={img} alt={`Footage ${i + 1}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Products Used */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('productsUsed')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((product) => (
                <div key={product.id} className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={getTranslation(product.translations || {}, locale, 'name') || product.model || ''}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Box className="h-14 w-14 text-muted-foreground/40" />
                      </div>
                    )}
                    {product.model && (
                      <Badge className="absolute left-3 top-3 font-mono text-xs">{product.model}</Badge>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-semibold text-foreground text-lg leading-snug">
                      {getTranslation(product.translations || {}, locale, 'name') || product.model || 'Product'}
                    </h3>
                    <div className="mt-auto pt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/${locale}/products/${product.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        {t('relatedProducts')}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <LeadFormCTAButton
                        intent="quote"
                        productModel={product.model}
                        caseSlug={caseStudy.slug}
                        pageType="case"
                        locale={locale}
                        variant="outline"
                        size="sm"
                      >
                        {t('requestSimilar')}
                      </LeadFormCTAButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Project CTA */}
        <section className="rounded-3xl border border-border bg-[#f7f8f5] p-8 text-center">
          <h2 className="text-2xl font-semibold text-foreground">{t('similarProject.title')}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t('similarProject.subtitle')}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <LeadFormCTAButton
              intent="quote"
              caseSlug={caseStudy.slug}
              pageType="case"
              locale={locale}
            >
              {t('similarProject.primaryCta')}
            </LeadFormCTAButton>
            <Link href={`/${locale}/products`} className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
              {t('similarProject.secondaryCta')}
            </Link>
          </div>
        </section>

        {/* Inline Lead Form */}
        <div className="mt-12">
          <InlineLeadForm
            mode="inline"
            defaultIntent="quote"
            caseSlug={caseStudy.slug}
            locale={locale}
          />
        </div>
      </div>
    </div>
  )
}
