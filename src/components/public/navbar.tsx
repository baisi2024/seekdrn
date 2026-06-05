'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from './language-switcher'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function Navbar() {
  const t = useTranslations('common')
  const locale = useLocale()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: `/${locale}/products`, label: t('nav.products') },
    { href: `/${locale}/solutions/public-safety`, label: t('nav.solutions') },
    { href: `/${locale}/case-studies`, label: t('nav.caseStudies') },
    { href: `/${locale}/compliance`, label: t('nav.support') },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SD</span>
          </div>
          <span className="font-bold text-lg text-gray-900">SeekDrone</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button render={<Link href={`/${locale}#demo-form`} />} size="sm" className="hidden md:inline-flex">
            {t('nav.requestDemo')}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" />} className="md:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg text-gray-700 hover:text-gray-900" onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <Button render={<Link href={`/${locale}#demo-form`} onClick={() => setOpen(false)} />} className="mt-4">
                  {t('nav.requestDemo')}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
