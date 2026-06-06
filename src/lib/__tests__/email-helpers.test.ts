import { extractVariables, validateVariables } from '../email-helpers'

describe('extractVariables', () => {
  it('should extract variables from template', () => {
    const content = 'Hello {{name}}, your email is {{email}}'
    expect(extractVariables(content)).toEqual(['name', 'email'])
  })

  it('should return empty array when no variables', () => {
    const content = 'Hello world'
    expect(extractVariables(content)).toEqual([])
  })

  it('should handle duplicate variables', () => {
    const content = 'Hello {{name}}, welcome {{name}}'
    expect(extractVariables(content)).toEqual(['name'])
  })
})

describe('validateVariables', () => {
  it('should return valid when all variables are available', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['name', 'email']
    )
    expect(result.valid).toBe(true)
    expect(result.missing).toEqual([])
  })

  it('should detect missing variables', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['email']
    )
    expect(result.valid).toBe(false)
    expect(result.missing).toEqual(['name'])
  })

  it('should detect unused variables', () => {
    const result = validateVariables(
      'Hello {{name}}',
      ['name', 'email', 'company']
    )
    expect(result.unused).toEqual(['email', 'company'])
  })
})
