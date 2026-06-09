export default function GlobalNotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#0A0E17'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '6rem', fontWeight: 'bold', color: '#0066FF' }}>404</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)' }}>Page not found</p>
      </div>
    </div>
  )
}
