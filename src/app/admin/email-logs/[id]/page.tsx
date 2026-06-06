import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'

export default async function EmailLogDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: log } = await supabaseAdmin
    .from('email_logs')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!log) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Email Log Detail</h1>

      <div className="space-y-4">
        <div>
          <strong>Template:</strong> {log.template_key}
        </div>
        <div>
          <strong>Recipient:</strong> {log.recipient_email}
        </div>
        <div>
          <strong>Language:</strong> {log.language}
        </div>
        <div>
          <strong>Status:</strong> {log.status}
        </div>
        <div>
          <strong>Sent At:</strong>{' '}
          {log.sent_at ? new Date(log.sent_at).toLocaleString() : '-'}
        </div>
        {log.error_message && (
          <div>
            <strong>Error:</strong> {log.error_message}
          </div>
        )}

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Subject</h2>
          <p>{log.subject}</p>
        </div>

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Body</h2>
          <div
            className="border p-4 rounded"
            dangerouslySetInnerHTML={{ __html: log.body_html }}
          />
        </div>

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Variables</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(log.variables, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
