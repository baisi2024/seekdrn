/**
 * 从模板内容中提取变量名
 * @param content 模板内容
 * @returns 变量名数组
 */
export function extractVariables(content: string): string[] {
  const regex = /{{(\w+)}}/g
  const variables = new Set<string>()
  let match
  while ((match = regex.exec(content)) !== null) {
    variables.add(match[1])
  }
  return Array.from(variables)
}

/**
 * 验证模板中使用的变量是否在允许列表中
 * @param content 模板内容
 * @param availableVariables 允许的变量列表
 * @returns 验证结果
 */
export function validateVariables(
  content: string,
  availableVariables: string[]
): { valid: boolean; missing: string[]; unused: string[] } {
  const used = extractVariables(content)
  const missing = used.filter(v => !availableVariables.includes(v))
  const unused = availableVariables.filter(v => !used.includes(v))
  return {
    valid: missing.length === 0,
    missing,
    unused
  }
}

/**
 * 替换模板中的变量
 * @param content 模板内容
 * @param variables 变量值
 * @returns 替换后的内容
 */
export function replaceVariables(
  content: string,
  variables: Record<string, string>
): string {
  let result = content
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, value)
  }
  return result
}
