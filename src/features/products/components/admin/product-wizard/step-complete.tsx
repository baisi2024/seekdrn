'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, FileText, Search, HelpCircle, Link2 } from 'lucide-react'

interface StepCompleteProps {
  productId: string | null
  productModel: string
  published: boolean
}

export function StepComplete({ productId, productModel, published }: StepCompleteProps) {
  const router = useRouter()

  if (!productId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">产品创建失败，请重试</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">产品创建成功！</h2>
        <p className="text-muted-foreground">
          产品 <span className="font-medium text-foreground">{productModel}</span> 已成功创建
          {published ? '并已发布' : '，当前为草稿状态'}
        </p>
      </div>

      {/* Next Steps */}
      <div className="bg-muted/50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">后续完善建议</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <FileText className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">完善文档</p>
              <p className="text-sm text-muted-foreground">添加产品手册、说明书等下载资料</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <Search className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">SEO优化</p>
              <p className="text-sm text-muted-foreground">设置页面标题、描述和关键词</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <HelpCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">FAQ管理</p>
              <p className="text-sm text-muted-foreground">添加常见问题解答</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 rounded-lg bg-background">
            <Link2 className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">关联管理</p>
              <p className="text-sm text-muted-foreground">关联案例研究、解决方案等</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        <Button
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          返回产品列表
        </Button>
        <Button
          onClick={() => router.push(`/admin/products/${productId}`)}
        >
          继续编辑
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push(`/en/products/${productId}`)}
        >
          查看产品页面
        </Button>
      </div>
    </div>
  )
}
