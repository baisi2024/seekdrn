import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { Navbar } from '@/components/public/navbar'
import { Footer } from '@/components/public/footer'
import LocaleHtmlUpdater from './locale-html-updater'

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'ar' | 'es' | 'fr' | 'pt' | 'id' | 'zh')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <>
      <LocaleHtmlUpdater locale={locale} />
      <NextIntlClientProvider messages={messages}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </NextIntlClientProvider>
    </>
  )
}
