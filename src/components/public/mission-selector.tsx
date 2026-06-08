import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface MissionOption {
  key: string
  title: string
  description: string
  href: string
}

interface MissionSelectorProps {
  title: string
  subtitle: string
  options: MissionOption[]
  viewLabel: string
  eyebrow?: string
}

export function MissionSelector({ title, subtitle, options, viewLabel, eyebrow }: MissionSelectorProps) {
  return (
    <section className="bg-[#f7f8f5] py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl">
          {eyebrow && <p className="text-sm font-semibold text-primary">{eyebrow}</p>}
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground lg:text-5xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground lg:text-lg">
            {subtitle}
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {options.map((option) => (
            <Link
              key={option.key}
              href={option.href}
              className="group rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-sm"
            >
              <h3 className="text-lg font-semibold text-foreground">{option.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{option.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {viewLabel}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
