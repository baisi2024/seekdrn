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
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="h-8 w-8 flex items-center justify-center border border-[#0066FF]">
            <span className="text-[#0066FF] font-bold text-sm">SD</span>
          </div>
          <span className="font-semibold text-lg tracking-wide text-white">SEEKDRONE</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-white/50 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button render={<Link href={`/${locale}#demo-form`} />} nativeButton={false} size="sm" className="hidden md:inline-flex bg-[#0066FF] text-white hover:bg-[#0052CC]">
            {t('nav.requestDemo')}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="text-white" />} className="md:hidden">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#0A0E17] border-l border-white/[0.06]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg text-white/70 hover:text-white" onClick={() => setOpen(false)}>
                    {link.label}
                  </Link>
                ))}
                <Button render={<Link href={`/${locale}#demo-form`} onClick={() => setOpen(false)} />} nativeButton={false} className="mt-4 bg-[#0066FF] text-white hover:bg-[#0052CC]">
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
