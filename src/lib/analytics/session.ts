// src/lib/analytics/session.ts
const SESSION_KEY = 'analytics_session_id'
const SESSION_EXPIRY = 30 * 60 * 1000 // 30 minutes

export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  // 尝试从 sessionStorage 获取
  const stored = sessionStorage.getItem(SESSION_KEY)
  if (stored) {
    const parsed = JSON.parse(stored)
    // 检查是否过期
    if (Date.now() - parsed.timestamp < SESSION_EXPIRY) {
      return parsed.sessionId
    }
  }

  // 创建新会话
  const sessionId = generateSessionId()
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      sessionId,
      timestamp: Date.now(),
    })
  )
  return sessionId
}

function generateSessionId(): string {
  // 生成随机会话 ID: timestamp + random string
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}`
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY)
  }
}
