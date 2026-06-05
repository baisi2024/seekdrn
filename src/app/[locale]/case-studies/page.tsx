import { supabaseAdmin } from '@/lib/supabase/admin'
import { CaseCard } from '@/components/public/case-card'

export default async function CaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  const { data: caseStudies } = await supabaseAdmin
    .from('case_studies')
    .select('*')
    .eq('published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Case Studies</h1>
        {caseStudies && caseStudies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {caseStudies.map((cs) => (
              <CaseCard key={cs.id} caseStudy={cs} locale={locale} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            No case studies available yet
          </div>
        )}
      </div>
    </div>
  )
}
