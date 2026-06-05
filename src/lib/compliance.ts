export type ComplianceStatus = 'approved' | 'review_required' | 'blocked'

const BLOCKED_COUNTRIES = ['North Korea', 'Iran', 'Syria', 'Cuba', 'Russia']

export function screen(country: string, application: string): ComplianceStatus {
  if (BLOCKED_COUNTRIES.includes(country)) return 'blocked'
  if (application === 'C-UAS' || application === 'Counter-UAS Defense') return 'review_required'
  return 'approved'
}
