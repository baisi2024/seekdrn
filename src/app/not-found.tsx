export default function GlobalNotFound() {
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
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#e5e7eb' }}>404</h1>
            <p style={{ color: '#6b7280' }}>Page not found</p>
          </div>
        </div>
      </body>
    </html>
  )
}
