'use client'

import { validateVariables } from '@/lib/email-helpers'
import { Badge } from '@/components/ui/badge'

interface VariableValidatorProps {
  content: string
  availableVariables: string[]
}

export function VariableValidator({ content, availableVariables }: VariableValidatorProps) {
  const result = validateVariables(content, availableVariables)

  if (result.valid && result.unused.length === 0) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <Badge variant="default" className="bg-green-500">
          Valid
        </Badge>
        <p className="mt-2 text-sm text-green-700">
          All variables are properly defined.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      {!result.valid && (
        <div className="mb-2">
          <Badge variant="destructive">Missing Variables</Badge>
          <p className="mt-1 text-sm text-red-700">
            {result.missing.join(', ')}
          </p>
        </div>
      )}
      {result.unused.length > 0 && (
        <div>
          <Badge variant="secondary">Unused Variables</Badge>
          <p className="mt-1 text-sm text-yellow-700">
            {result.unused.join(', ')}
          </p>
        </div>
      )}
    </div>
  )
}
