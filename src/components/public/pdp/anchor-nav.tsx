'use client'

import { useState, useEffect } from 'react'

interface AnchorItem {
  id: string
  label: string
}

interface AnchorNavProps {
  items: AnchorItem[]
}

export function AnchorNav({ items }: AnchorNavProps) {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -60% 0px' }
    )

    items.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A0E17]/95 backdrop-blur-lg">
      <div className="container mx-auto flex items-center gap-1 overflow-x-auto py-3 px-4">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeId === item.id
                ? 'bg-[#0066FF]/15 text-[#0066FF]'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
