'use client'

import * as LucideIcons from 'lucide-react'

interface DynamicIconProps {
  name: string
  className?: string
}

export function DynamicIcon({ name, className }: DynamicIconProps) {
  // Convert kebab-case or snake_case to PascalCase for lucide icon lookup
  const pascalName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[pascalName]

  if (!IconComponent) {
    return null
  }

  return <IconComponent className={className} />
}
