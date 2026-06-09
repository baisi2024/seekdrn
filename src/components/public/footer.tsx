import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('common')
  const locale = useLocale()

  return (
    <footer className="bg-[#0A0E17] border-t border-white/[0.06] text-white/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 flex items-center justify-center border border-[#0066FF]">
                <span className="text-[#0066FF] font-bold text-sm">SD</span>
              </div>
              <span className="font-semibold text-lg tracking-wide text-white">SeekDrone</span>
            </div>
            <p className="text-sm">Industrial UAV solutions and counter-drone systems for defense, security, and critical infrastructure.</p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">{t('nav.products')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/products?cat=uav`} className="hover:text-white transition-colors">UAV Platforms</Link></li>
              <li><Link href={`/${locale}/products?cat=payload`} className="hover:text-white transition-colors">Payloads</Link></li>
              <li><Link href={`/${locale}/products?cat=cuas`} className="hover:text-white transition-colors">Counter-UAS</Link></li>
              <li><Link href={`/${locale}/products?cat=ground_control`} className="hover:text-white transition-colors">Ground Control</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">{t('nav.solutions')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/solutions/public-safety`} className="hover:text-white transition-colors">Public Safety</Link></li>
              <li><Link href={`/${locale}/solutions/energy`} className="hover:text-white transition-colors">Energy</Link></li>
              <li><Link href={`/${locale}/solutions/surveying`} className="hover:text-white transition-colors">Surveying</Link></li>
              <li><Link href={`/${locale}/solutions/counter-uas`} className="hover:text-white transition-colors">Counter-UAS</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">{t('nav.support')}</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: sales@seekdrn.com</li>
              <li>WhatsApp: +86 138 0013 8000</li>
              <li><Link href={`/${locale}/compliance`} className="hover:text-white transition-colors">Compliance Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] mt-8 pt-8 text-sm text-center">
          © {new Date().getFullYear()} SeekDrone. {t('footer.rights')}
        </div>
      </div>
    </footer>
  )
}
