import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SeekDrone - Industrial UAV Solutions',
  description: 'Battle-proven drone platforms and counter-UAS solutions for defense, security, and critical infrastructure.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
