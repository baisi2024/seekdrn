'use client'

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string }
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem' }}>
              Error
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Something went wrong
            </p>
            <details style={{ textAlign: 'left', background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '500' }}>Error details</summary>
              <pre style={{ marginTop: '0.5rem', fontSize: '0.875rem', overflow: 'auto' }}>
                {error.message}
              </pre>
            </details>
          </div>
        </div>
      </body>
    </html>
  )
}
