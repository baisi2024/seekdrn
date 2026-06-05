import type { Metadata } from 'next'
import { GoogleTagManager } from '@next/third-parties/google'

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
    <>
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID!} />
      {children}
    </>
  )
}
