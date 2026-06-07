/**
 * 飞书认证模块
 *
 * 延迟初始化 + token 缓存：
 * - 模块加载时不验证环境变量
 * - tenant_access_token 自动缓存，过期前 5 分钟自动刷新
 * - 仅限服务端使用（API Route / Server Component）
 */

const FEISHU_TOKEN_URL = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal'
const TOKEN_EXPIRY_BUFFER = 300 // 提前 5 分钟刷新

interface TokenResponse {
  code: number
  msg: string
  tenant_access_token: string
  expire: number
}

interface CachedToken {
  token: string
  expiresAt: number // ms
}

let cachedToken: CachedToken | null = null

function getCredentials() {
  const appId = process.env.FEISHU_APP_ID
  const appSecret = process.env.FEISHU_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error(
      'FEISHU_APP_ID and FEISHU_APP_SECRET are required. Please check your .env file.'
    )
  }

  return { appId, appSecret }
}

/**
 * 获取飞书 tenant_access_token
 *
 * 自动缓存 token，过期前 5 分钟自动刷新，避免频繁请求
 */
export async function getTenantAccessToken(): Promise<string> {
  const now = Date.now()

  // 缓存未过期则直接返回
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken.token
  }

  const { appId, appSecret } = getCredentials()

  const res = await fetch(FEISHU_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  })

  if (!res.ok) {
    throw new Error(`Feishu token request failed: ${res.status} ${res.statusText}`)
  }

  const data: TokenResponse = await res.json()

  if (data.code !== 0) {
    throw new Error(`Feishu token error: [${data.code}] ${data.msg}`)
  }

  // 缓存 token，减去缓冲时间
  cachedToken = {
    token: data.tenant_access_token,
    expiresAt: now + (data.expire - TOKEN_EXPIRY_BUFFER) * 1000,
  }

  return data.tenant_access_token
}

/**
 * 调用飞书 Open API 的便捷方法
 *
 * 自动附带 Authorization header，支持 JSON 请求体
 */
export async function feishuRequest<T = unknown>(
  path: string,
  options: {
    method?: string
    body?: unknown
  } = {}
): Promise<T> {
  const token = await getTenantAccessToken()
  const url = path.startsWith('http') ? path : `https://open.feishu.cn${path}`

  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Feishu API error: ${res.status} ${text}`)
  }

  return res.json() as Promise<T>
}
