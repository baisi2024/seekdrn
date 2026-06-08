import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { DynamicNavbar } from '@/components/public/dynamic-navbar'
import { DynamicFooter } from '@/components/public/dynamic-footer'
import { LeadFormProvider } from '@/components/public/lead-form-provider'
import { ProductCompareProvider } from '@/components/public/product-compare-provider'
import { ProductCompareBar } from '@/components/public/product-compare-bar'
import LocaleHtmlUpdater from './locale-html-updater'
import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/site-settings/api'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const settings = await getSiteSettings()

  const defaultTitle = settings?.seo_metadata?.default_title?.[locale]
    || settings?.site_name?.[locale]
    || 'SeekDrone'
  const defaultDescription = settings?.seo_metadata?.default_description?.[locale]
    || settings?.seo_description?.[locale]
    || 'Industrial UAV solutions and counter-drone systems'

  const alternates: Record<string, string> = {}
  for (const lang of routing.locales) {
    alternates[lang] = `/${lang}`
  }

  return {
    title: {
      default: defaultTitle,
      template: `%s | ${defaultTitle}`,
    },
    description: defaultDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://seekdrone.com'),
    alternates: {
      canonical: `/${locale}`,
      languages: alternates,
    },
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      images: settings?.seo_metadata?.og_image ? [{ url: settings.seo_metadata.og_image }] : [],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: defaultTitle,
      description: defaultDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'ar' | 'es' | 'fr' | 'pt' | 'id' | 'zh' | 'th' | 'vi' | 'fa' | 'ru')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <>
      <LocaleHtmlUpdater locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <LeadFormProvider locale={locale}>
          <ProductCompareProvider>
            <DynamicNavbar locale={locale} />
            <main className="min-h-screen">{children}</main>
            <DynamicFooter locale={locale} />
            <ProductCompareBar />
          </ProductCompareProvider>
        </LeadFormProvider>
      </NextIntlClientProvider>
    </>
  )
}
