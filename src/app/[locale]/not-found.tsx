import Link from 'next/link'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  const locale = useLocale()

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0E17]">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-white/10">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-white/50 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button render={<Link href={`/${locale}`} />} nativeButton={false}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
