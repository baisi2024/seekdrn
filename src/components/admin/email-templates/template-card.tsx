'use client'

import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, Trash2, Eye, Mail } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { EmailTemplate } from '../email-templates-table'

interface TemplateCardProps {
  template: EmailTemplate
  onDelete: (id: string) => void
}

export function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(template.id)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold text-base">{template.template_key}</h3>
        </div>
        <Badge variant={template.is_active ? 'default' : 'secondary'}>
          {template.is_active ? '活跃' : '未激活'}
        </Badge>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {template.description || '暂无描述'}
        </p>
        
        {/* 可用变量列表 */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">可用变量:</p>
          <div className="flex flex-wrap gap-1">
            <code className="text-xs bg-muted px-2 py-1 rounded">{'{{name}}'}</code>
            <code className="text-xs bg-muted px-2 py-1 rounded">{'{{email}}'}</code>
            <code className="text-xs bg-muted px-2 py-1 rounded">{'{{link}}'}</code>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between border-t pt-3">
        <p className="text-xs text-muted-foreground">
          更新于 {formatDate(template.updated_at)}
        </p>
        
        <div className="flex items-center gap-2">
          <Link href={`/admin/email-templates/${template.template_key}`}>
            <Button size="icon-sm" variant="ghost" title="编辑">
              <Edit className="h-3.5 w-3.5" />
            </Button>
          </Link>
          
          <Button size="icon-sm" variant="ghost" title="预览">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon-sm" variant="ghost" title="删除">
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>确认删除</DialogTitle>
                <DialogDescription>
                  确定要删除模板 &ldquo;{template.template_key}&rdquo; 吗？此操作无法撤销。
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" disabled={isDeleting}>
                  取消
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? '删除中...' : '删除'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardFooter>
    </Card>
  )
}
