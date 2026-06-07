import type { Metadata } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'SeekDrone - Industrial UAV Solutions',
  description: 'Battle-proven drone platforms and counter-UAS solutions for defense, security, and critical infrastructure.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
        {children}
      </body>
    </html>
  )
}
