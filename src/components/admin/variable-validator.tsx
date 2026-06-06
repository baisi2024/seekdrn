'use client'

import { validateVariables } from '@/lib/email-helpers'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react'

interface VariableValidatorProps {
  content: string
  availableVariables: string[]
}

export function VariableValidator({ content, availableVariables }: VariableValidatorProps) {
  const result = validateVariables(content, availableVariables)

  if (result.valid && result.unused.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="font-medium text-green-700 dark:text-green-300">
                变量验证通过
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                所有变量都已正确定义并使用
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
      <CardContent className="p-4">
        <div className="space-y-3">
          {!result.valid && (
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-700 dark:text-red-300">
                  缺少变量定义
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.missing.map((variable) => (
                    <Badge key={variable} variant="destructive">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                  请在&quot;变量配置&quot;中添加这些变量
                </p>
              </div>
            </div>
          )}
          
          {result.unused.length > 0 && (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700 dark:text-yellow-300">
                  未使用的变量
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.unused.map((variable) => (
                    <Badge key={variable} variant="secondary">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                  这些变量已定义但未在模板中使用
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
